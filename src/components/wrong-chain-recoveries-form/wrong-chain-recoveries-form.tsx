import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { NetworkType } from '@bitgo/statics';
import { Checkbox, Collapse, Icon, Radio, RadioGroup } from '@blueprintjs/core';
import BigNumber from 'bignumber.js';
import { remote } from 'electron';
import { FieldArray, FormikProvider, useFormik } from 'formik';
import fs from 'fs';
import jszip from 'jszip';
import _ from 'lodash';
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { BitgoInstrument } from '../../modules/lumina/api/bitgo-instruments';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { Button } from '../../modules/lumina/components/button/button';
import { DefinitionListItem } from '../../modules/lumina/components/definition-list-item/definition-list-item';
import { DefinitionList } from '../../modules/lumina/components/definition-list/definition-list';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import { Input } from '../../modules/lumina/components/input/input';
import { Label } from '../../modules/lumina/components/label/label';
import Lead2 from '../../modules/lumina/components/lead2/lead2';
import { Section } from '../../modules/lumina/components/section/section';
import { TextareaField } from '../../modules/lumina/components/textarea-field';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { BitgoError } from '../../pkg/bitgo/bitgo-sdk-offline-wrapper';
import { saveFile } from '../../pkg/electron/utils';
import { useApplicationContext } from '../contexts/application-context';
import CurrencySelect from '../currency-select/currency-select';
import { SuccessAnimation } from '../success-animation/success-animation';
import tooltips from '../tooltips';
import { coinConfig } from '../utils';

const { dialog } = remote;

interface IWrongChainRecoveriesFormProps extends IBaseProps {}

interface IWrongChainRecoveriesFormValues {
  sourceCoin?: BitgoInstrument;
  recoveryCoin?: BitgoInstrument;
  wallet: string;
  txids: string[];
  recoveryAddress: string;
  signed: boolean;
  credentialsType: 'passphrase' | 'prv';
  passphrase?: string;
  prv?: string;
}

function WrongChainRecoveriesForm(props: IWrongChainRecoveriesFormProps) {
  const { bitgoSDKOfflineWrapper, network } = useApplicationContext();
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recoveryTxs, setRecoveryTxs] = useState([]);

  const history = useHistory();

  const WrongChainRecoveriesFormSchema = Yup.object().shape({
    sourceCoin: Yup.object().required('Please select a source currency'),
    recoveryCoin: Yup.object().required('Please select a recovery currency'),
    wallet: Yup.string().required('Please enter a wallet ID'),
    txids: Yup.array().of(Yup.string().required('Please enter at least one blockchain transaction ID')),
    recoveryAddress: Yup.string().required('Please enter a recovery address'),
  });

  const handleSubmit = async (values: IWrongChainRecoveriesFormValues) => {
    try {
      const sourceCoin = bitgoSDKOfflineWrapper.bitgoSDK.coin(
        values.sourceCoin.bitgoStaticBaseCoin.name
      ) as AbstractUtxoCoin;
      const promises = values.txids.map(async (txid) => {
        try {
          // Do not pass the default empty string to the SDK or it will try to use it as a valid xprv
          const xprv = _.isEmpty(values.prv) ? undefined : values.prv;

          const recoveryTx = await sourceCoin.recoverFromWrongChain({
            txid: txid,
            recoveryAddress: values.recoveryAddress,
            wallet: values.wallet,
            coin: bitgoSDKOfflineWrapper.bitgoSDK.coin(
              values.recoveryCoin.bitgoStaticBaseCoin.name
            ) as AbstractUtxoCoin,
            signed: values.signed,
            walletPassphrase: values.passphrase,
            xprv,
          });
          return recoveryTx;
        } catch (error) {
          const bitgoError = error as BitgoError;
          setValidationErrors([
            {
              code: BitgoBackendErrorCode.INVALID_ARGUMENT,
              path: [],
              message: bitgoError.message,
            },
          ]);
          return;
        }
      });

      let newRecoveryTxs = await Promise.all(promises);
      // it's possible to have duplicate transactions if multiple wrong chain
      // txs were on the same address. let's not give support any more recoveries
      // than they need :)
      newRecoveryTxs = _.uniqBy(newRecoveryTxs, 'txHex');
      if (_.isEmpty(newRecoveryTxs[0])) {
        throw 'Something went wrong with calling: recoverFromWrongChain()';
      }
      setRecoveryTxs(newRecoveryTxs);
    } catch (error) {
      const bitgoError = error as BitgoError;
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: bitgoError.message,
        },
      ]);
    }
  };

  const getFileName = (index: number): string => {
    if (values.signed) {
      return `${recoveryTxs[index].sourceCoin}-${values.txids[index].slice(0, 6)}-${Date.now()}.signed.json`;
    } else {
      return `${recoveryTxs[index].coin}-${values.txids[index].slice(0, 6)}-${Date.now()}.unsigned.json`;
    }
  };

  const saveSingleTransaction = async () => {
    try {
      await saveFile(getFileName(0), JSON.stringify(recoveryTxs[0], null, 4));
    } catch (error) {
      const bitgoError = error as BitgoError;
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: bitgoError.message,
        },
      ]);
    }
  };

  const saveMultipleTransactions = async () => {
    try {
      const zipName = `${values.sourceCoin.bitgoStaticBaseCoin.name}-recoveries-${values.wallet.slice(0, 6)}`;
      const zip = new jszip();

      _.forEach(recoveryTxs, (transaction, index) => {
        const fileName = getFileName(index);
        zip.file(fileName, JSON.stringify(transaction, null, 4));
      });

      const dialogParams = {
        filters: [
          {
            name: 'Custom File Type',
            extensions: ['zip'],
          },
        ],
        defaultPath: '~/' + zipName,
      };

      const filePath = await dialog.showSaveDialog(remote.getCurrentWindow(), dialogParams);
      if (!filePath) {
        // TODO: The user exited the file creation process. What do we do?
        return;
      }
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(fs.createWriteStream(filePath.filePath));
    } catch (error) {
      const bitgoError = error as BitgoError;
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: bitgoError.message,
        },
      ]);
    }
  };

  const handleSaveTransactions = async () => {
    if (recoveryTxs.length === 1) {
      await saveSingleTransaction();
    } else {
      await saveMultipleTransactions();
    }
    setShowSuccess(true);
  };

  const renderIndicator = () => {
    return (
      <div className="flex justify-between items-center mh1 f7 fw5 silver mb4">
        <div className="flex items-center">
          <Icon
            icon={recoveryTxs.length > 0 ? 'tick-circle' : 'selection'}
            iconSize={14}
            className="mr2"
            intent={recoveryTxs.length > 0 ? 'none' : 'primary'}
          />
          Enter Transaction Information
        </div>
        <div
          className="flex-grow-1 flex-shrink-1 mh1 bt b--border"
          style={{
            borderTopWidth: 2,
          }}
        />
        <div className="flex items-center">
          <Icon
            icon={recoveryTxs.length > 0 ? (showSuccess ? 'tick-circle' : 'selection') : 'circle'}
            iconSize={14}
            className="mr2"
            intent={recoveryTxs.length > 0 ? (showSuccess ? 'none' : 'primary') : 'none'}
          />
          Download Transactions
        </div>
        <div
          className="flex-grow-1 flex-shrink-1 mh1 bt b--border"
          style={{
            borderTopWidth: 2,
          }}
        />
        <div className="flex items-center">
          <Icon
            icon={showSuccess ? 'tick-circle' : 'circle'}
            iconSize={14}
            className="mr2"
            intent={showSuccess ? 'primary' : 'none'}
          />
          Complete
        </div>
      </div>
    );
  };

  const formik = useFormik<IWrongChainRecoveriesFormValues>({
    initialValues: {
      sourceCoin: undefined,
      recoveryCoin: undefined,
      wallet: undefined,
      txids: [''],
      recoveryAddress: undefined,
      signed: undefined,
      credentialsType: undefined,
      passphrase: undefined,
      prv: undefined,
    },
    validationSchema: WrongChainRecoveriesFormSchema,
    onSubmit: handleSubmit,
  });

  const { errors, values, submitCount, setFieldValue, submitForm, isSubmitting, touched, handleChange, initialValues } =
    formik;

  let destinationCurrencyAllowedCoins = [];
  if (values.sourceCoin?.bitgoStaticBaseCoin?.name) {
    const selectedCoinName = values.sourceCoin?.bitgoStaticBaseCoin?.name
      ? bitgoSDKOfflineWrapper.bitgoSDK.coin(values.sourceCoin?.bitgoStaticBaseCoin?.name).getFamily()
      : undefined;
    destinationCurrencyAllowedCoins =
      coinConfig.allCoins[selectedCoinName].supportedRecoveries[network === NetworkType.MAINNET ? 'prod' : 'test'];
  }

  return (
    <div className="relative flex flex-grow-1 overflow-auto">
      <ValidationBanner
        isAbsolute
        errors={validationErrors}
        formikErrors={errors}
        className="overflow-auto"
        childrenClassName="overflow-auto pt3"
        hasSubmitted={submitCount > 0}
        size="s"
        schema={WrongChainRecoveriesFormSchema}
      >
        <div className="flex-grow-1 pv4 l-gpl l-gpr">
          <div className="mw7 center">
            <Lead2 mbx="mb4">Construct a transaction to recover coins sent to addresses on the wrong chain.</Lead2>
            {/* <Lead2 mbx="mb4">
              Current environment:{' '}
              <span className="fw6">{network === NetworkType.MAINNET ? 'Mainnet' : 'Testnet'}</span>.{' '}
              <NavLink to="/" className="blue">
                Go back to change &rarr;
              </NavLink>
            </Lead2> */}

            {renderIndicator()}

            {!showSuccess && (
              <>
                {recoveryTxs.length === 0 ? (
                  <>
                    <div className="pt4 pb3 ba b--border br2">
                      <Section
                        className="ph4"
                        bodyClassName="pt3"
                        sectionHeaderProps={{
                          titleH5: 'Enter transaction information',
                          hideHeaderBorder: false,
                        }}
                      >
                        <FormikProvider value={formik}>
                          <div className="mb3">
                            <Label>Source Currency</Label>
                            <CurrencySelect
                              data-testid="source-currency"
                              allowedCoins={
                                coinConfig.supportedRecoveries.crossChain[
                                  network === NetworkType.MAINNET ? 'prod' : 'test'
                                ]
                              }
                              error={touched.sourceCoin ? errors.sourceCoin?.toString() : undefined}
                              className="mb1"
                              activeItem={{
                                bitgoInstrument: values?.sourceCoin || initialValues.sourceCoin,
                              }}
                              onItemSelect={(item) => {
                                setFieldValue('sourceCoin', item);
                              }}
                            />
                            <HelpBlock>{tooltips.crossChain.sourceCoin()}</HelpBlock>
                          </div>

                          <div className="mb3">
                            <Label>Destination Currency</Label>
                            <CurrencySelect
                              data-testid="destination-currency"
                              selectProps={{
                                disabled: destinationCurrencyAllowedCoins.length === 0,
                              }}
                              allowedCoins={destinationCurrencyAllowedCoins}
                              className="mb1"
                              activeItem={{
                                bitgoInstrument: values?.recoveryCoin || initialValues.recoveryCoin,
                              }}
                              error={touched.recoveryCoin ? errors.recoveryCoin?.toString() : undefined}
                              onItemSelect={(item) => {
                                setFieldValue('recoveryCoin', item);
                              }}
                            />
                            <HelpBlock>{tooltips.crossChain.destinationCoin()}</HelpBlock>
                          </div>

                          <InputField
                            layout="vertical"
                            labelProps={{
                              labelText: 'Wallet ID',
                            }}
                            inputProps={{
                              'data-testid': 'wallet-id',
                              error: touched.wallet ? errors.wallet : undefined,
                              name: 'wallet',
                              onChange: handleChange,
                              className: 'mb1',
                              value: values.wallet,
                              placeholder: 'Enter wallet ID...',
                            }}
                          />
                          <HelpBlock className="mb3">
                            {tooltips.crossChain.wallet(values.recoveryCoin?.bitgoStaticBaseCoin?.name || '')}
                          </HelpBlock>

                          <Label>Transaction IDs</Label>
                          <HelpBlock className="mb2">
                            {tooltips.crossChain.txid(values.sourceCoin?.bitgoStaticBaseCoin?.name || '')}
                          </HelpBlock>
                          <div className="mb3">
                            <FieldArray
                              name="txids"
                              render={(arrayHelpers) => (
                                <div>
                                  {values.txids.length === 0 ? (
                                    <div className="tc silver pv2 ba--dashed br2">
                                      Please enter at least one transaction ID.
                                    </div>
                                  ) : (
                                    <>
                                      {values.txids.map((txid, index) => {
                                        const txidPath = `txids.${index}`;
                                        return (
                                          <div className="flex justify-items items-end mb1" key={index}>
                                            <Input
                                              data-testid={`transaction-id-${index}`}
                                              className="flex-grow-1"
                                              placeholder="Enter a blockchain transaction ID..."
                                              error={
                                                submitCount > 0 && touched.txids[index]
                                                  ? _.get(errors, txidPath)
                                                  : undefined
                                              }
                                              onChange={handleChange}
                                              name={txidPath}
                                              value={values.txids[index]}
                                            />
                                            <Button
                                              className="ml1"
                                              minimal
                                              disabled={values.txids.length < 2}
                                              icon="cross"
                                              onClick={() => arrayHelpers.remove(index)}
                                            />
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                  <Button
                                    data-testid="add-transaction-id"
                                    icon="plus"
                                    onClick={() => arrayHelpers.push('')}
                                  >
                                    Add transaction ID
                                  </Button>
                                </div>
                              )}
                            />
                          </div>

                          <InputField
                            layout="vertical"
                            labelProps={{
                              labelText: 'Destination Address',
                            }}
                            inputProps={{
                              'data-testid': 'destination-address',
                              name: 'recoveryAddress',
                              error: touched.recoveryAddress ? errors.recoveryAddress : undefined,
                              onChange: handleChange,
                              className: 'mb1',
                              value: values.recoveryAddress,
                              placeholder: 'Enter destination address...',
                            }}
                          />
                          <HelpBlock className="mb3">
                            {tooltips.crossChain.recoveryAddress(values.sourceCoin?.bitgoStaticBaseCoin?.name || '')}
                          </HelpBlock>

                          <div className="mb3">
                            <Checkbox
                              data-testid="sign-transaction"
                              labelElement={<span className="fw6">Sign transaction</span>}
                              checked={values.signed}
                              onChange={(event) => {
                                const target = event.target as any;
                                setFieldValue('signed', target.checked);
                              }}
                            />
                            <HelpBlock className="l-checkbox-leftOffset">
                              TBD help text for what this does exactly.
                            </HelpBlock>
                          </div>

                          <Collapse isOpen={values.signed}>
                            <div className="l-checkbox-leftOffset">
                              <RadioGroup
                                className="l-radioGroup mb4"
                                label="Credential Type"
                                name="credentialsType"
                                onChange={(event) => {
                                  setFieldValue('credentialsType', event.currentTarget.value);
                                  if (event.currentTarget.value === 'passphrase') {
                                    setFieldValue('prv', undefined);
                                  } else {
                                    setFieldValue('passphrase', undefined);
                                  }
                                }}
                                selectedValue={values.credentialsType}
                              >
                                <Radio className="pb1" label="Wallet Passphrase" value="passphrase" />
                                <div className="l-checkbox-leftOffset mb2">
                                  <HelpBlock>
                                    {tooltips.crossChain.passphrase(
                                      values.recoveryCoin?.bitgoStaticBaseCoin?.name || ''
                                    )}
                                  </HelpBlock>
                                  <Collapse isOpen={values.credentialsType === 'passphrase'}>
                                    <div className="overflow-hidden pt2">
                                      <InputField
                                        layout="vertical"
                                        inputProps={{
                                          'data-testid': 'wallet-passphrase',
                                          error: touched.passphrase ? errors.passphrase : undefined,
                                          name: 'passphrase',
                                          onChange: handleChange,
                                          type: 'password',
                                          className: 'mb1',
                                          value: values.passphrase,
                                          placeholder: 'Enter wallet passphrase..',
                                        }}
                                      />
                                    </div>
                                  </Collapse>
                                </div>
                                <Radio className="pb1" label="Private Key" value="prv" />
                                <div className="l-checkbox-leftOffset mb2">
                                  <HelpBlock>
                                    {tooltips.crossChain.prv(values.recoveryCoin?.bitgoStaticBaseCoin?.name || '')}
                                  </HelpBlock>
                                  <Collapse isOpen={values.credentialsType === 'prv'}>
                                    <div className="overflow-hidden pt2">
                                      <TextareaField
                                        layout="vertical"
                                        textareaProps={{
                                          'data-testid': 'private-key',
                                          error: touched.prv ? errors.prv : undefined,
                                          name: 'prv',
                                          onChange: handleChange,
                                          className: 'mb1',
                                          value: values.prv,
                                          rows: 2,
                                          minRows: 2,
                                          maxRows: 2,
                                          placeholder: 'Enter wallet private key...',
                                        }}
                                      />
                                    </div>
                                  </Collapse>
                                </div>
                              </RadioGroup>
                            </div>
                          </Collapse>
                        </FormikProvider>
                      </Section>
                    </div>
                    <Footer
                      className="bn"
                      isFlush
                      isVisible
                      isPrimaryButtonLoading={isSubmitting}
                      primaryButtonText="Continue"
                      cancelButtonText="Cancel"
                      onCancelButtonClick={() => {
                        history.push('/');
                      }}
                      onPrimaryButtonClick={submitForm}
                    />
                  </>
                ) : (
                  <>
                    <div className="pt4 pb3 ba b--border br2 confirmation-values">
                      <Section
                        className="ph4"
                        bodyClassName="pt2"
                        sectionHeaderProps={{
                          titleH5: 'Confirm recovery transaction values',
                          hideHeaderBorder: false,
                        }}
                      >
                        {values.signed ? (
                          <DefinitionList className="mb2">
                            <DefinitionListItem
                              label="Source Coin"
                              value={`${bitgoSDKOfflineWrapper.bitgoSDK
                                .coin(recoveryTxs[0].sourceCoin)
                                .getFullName()} (${recoveryTxs[0].sourceCoin.toUpperCase()})`}
                            />
                            <DefinitionListItem
                              label="Recovery Coin"
                              value={`${bitgoSDKOfflineWrapper.bitgoSDK
                                .coin(recoveryTxs[0].recoveryCoin)
                                .getFullName()} (
                              ${recoveryTxs[0].recoveryCoin.toUpperCase()})`}
                            />
                            <DefinitionListItem label="Wallet" value={recoveryTxs[0].walletId} />
                            <DefinitionListItem
                              label="Amount to Recover"
                              value={`${new BigNumber(
                                _.sumBy(recoveryTxs, (recoveryTx) => {
                                  return recoveryTx.amount;
                                })
                              )
                                .times(1e-8)
                                .toFixed(8)} ${recoveryTxs[0].sourceCoin.toUpperCase()}`}
                            />
                            <DefinitionListItem
                              label="Destination Address"
                              valueContainerClassName="ff-mono"
                              value={recoveryTxs[0].recoveryAddress}
                            />
                          </DefinitionList>
                        ) : (
                          <DefinitionList className="mb2">
                            <DefinitionListItem
                              label="Source Coin"
                              value={`${bitgoSDKOfflineWrapper.bitgoSDK
                                .coin(recoveryTxs[0].coin)
                                .getFullName()} (${recoveryTxs[0].coin.toUpperCase()})`}
                            />
                            <DefinitionListItem label="Wallet" value={recoveryTxs[0].walletId} />
                            <DefinitionListItem
                              label="Amount to Recover"
                              value={`${new BigNumber(
                                _.sumBy(recoveryTxs, (recoveryTx) => {
                                  return recoveryTx.amount;
                                })
                              )
                                .times(1e-8)
                                .toFixed(8)} ${recoveryTxs[0].coin.toUpperCase()}`}
                            />
                            <DefinitionListItem
                              label="Destination Address"
                              valueContainerClassName="ff-mono"
                              value={recoveryTxs[0].address}
                            />
                          </DefinitionList>
                        )}
                      </Section>
                    </div>
                    <Footer
                      className="bn"
                      isFlush
                      isVisible
                      isPrimaryButtonLoading={isSubmitting}
                      primaryButtonText="Recover Funds"
                      cancelButtonText="Back"
                      onCancelButtonClick={() => {
                        setRecoveryTxs([]);
                      }}
                      onPrimaryButtonClick={handleSaveTransactions}
                    />
                  </>
                )}
              </>
            )}
            {showSuccess && (
              <div className="pa5 ba b--border br2 flex flex-column items-center justify-center">
                <div className="w-100 flex flex-column items-center justify-center mb2">
                  <SuccessAnimation className="mb3" />
                  <Lead2 className="tc">Success!</Lead2>
                </div>
                <NavLink className="bp3-button bp3-minimal" to="/" data-testid="back-to-home-link">
                  Back to Home &rarr;
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </ValidationBanner>
    </div>
  );
}

export default WrongChainRecoveriesForm;
