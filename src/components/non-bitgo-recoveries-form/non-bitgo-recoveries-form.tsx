import { BaseCoin } from '@bitgo/sdk-core';
import { BaseCoin as BitgoStaticBaseCoin, NetworkType } from '@bitgo/statics';
import { Collapse, Icon } from '@blueprintjs/core';
import { Chain, Hardfork } from '@ethereumjs/common';
import * as BitGoJS from 'bitgo';
import { AbstractUtxoCoin } from 'bitgo/dist/types/src/v2/coins';
import { useFormik } from 'formik';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { Button } from '../../modules/lumina/components/button/button';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { HtmlSelect } from '../../modules/lumina/components/html-select/html-select';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import { Label } from '../../modules/lumina/components/label/label';
import Lead2 from '../../modules/lumina/components/lead2/lead2';
import { Section } from '../../modules/lumina/components/section/section';
import { TextareaField } from '../../modules/lumina/components/textarea-field/textarea-field';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { saveFile } from '../../pkg/electron/utils';
import { useApplicationContext } from '../contexts/application-context';
import CurrencySelect from '../currency-select/currency-select';
import { SuccessAnimation } from '../success-animation/success-animation';
import tooltips from '../tooltips';
import {
  coinConfig,
  getNonTestnetName,
  getRecoveryDebugInfo,
  isBlockChairKeyNeeded,
  recoverWithKeyPath,
  toWei,
} from '../utils';

const { clipboard } = window.require('electron');

const krsProviders = [
  {
    label: 'None',
    value: undefined,
  },
  {
    label: 'Keyternal',
    value: 'keyternal',
  },
  {
    label: 'BitGo KRS',
    value: 'bitgoKRSv2',
  },
  {
    label: 'Coincover',
    value: 'dai', // Coincover used to be called 'DAI' and so on the backend, BitGo still refers to them as 'dai'
  },
];

const displayedParams = {
  btc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  bsv: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  bch: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  bcha: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  ltc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  btg: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  zec: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  dash: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
  eth: [
    'userKey',
    'backupKey',
    'walletContractAddress',
    'walletPassphrase',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  xrp: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  xlm: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  trx: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination'],
  token: [
    'userKey',
    'backupKey',
    'walletContractAddress',
    'tokenContractAddress',
    'walletPassphrase',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  eos: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  near: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  dot: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
  sol: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
};

interface INonBitgoRecoveriesFormProps extends IBaseProps {}

interface INonBitgoRecoveriesFormValues {
  selectedCoin?: BitgoStaticBaseCoin;
  userKey: string;
  backupKey: string;
  bitgoKey: string;
  walletContractAddress: string;
  rootAddress: string;
  tokenAddress: string;
  walletPassphrase: string;
  recoveryDestination: string;
  error: string;
  krsProvider: undefined;
  apiKey: string;
  scan: number;
  gasLimit: number;
  gasPrice: number; // Below values is in gwei, and only a default value if users do not override
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
}

function NonBitgoRecoveriesForm({}: INonBitgoRecoveriesFormProps) {
  const { bitgoSDKOfflineWrapper, network } = useApplicationContext();
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const history = useHistory();

  const NonBitgoRecoveriesFormSchema = Yup.object().shape({
    selectedCoin: Yup.object().shape({
      name: Yup.string().required('Please select a currency'),
    }),
    userKey: Yup.string().required('Please enter the "A: User Key" from your BitGo recovery keycard'),
    backupKey: Yup.string().required('Please enter the "B: Backup Key" from your BitGo recovery keycard'),
    bitgoKey: Yup.string().required('Please enter the "C: BitGo Public Key" from your BitGo recovery keycard'),
    walletPassphrase: Yup.string().required('Please enter a wallet passphrase'),
    recoveryDestination: Yup.string().required('Please enter a recovery address'),
    scan: Yup.string().required('Please select a currency'),
  });

  // TODO(louis): need to look at this, token doesn't make sense, gteth
  const getCoinObject = () => {
    let coin: BaseCoin;
    let bitgo = bitgoSDKOfflineWrapper.bitgoSDK;

    if (values.apiKey && values.apiKey !== '') {
      bitgo = new BitGoJS.BitGo({
        env: network === NetworkType.MAINNET ? 'prod' : 'test',
        etherscanApiToken: values.apiKey,
      });
    }

    if (values.selectedCoin?.isToken) {
      try {
        coin = bitgo.coin(values.tokenAddress);
      } catch (e) {
        // if we're here, the token address is malformed. let's set the coin to ETH so we can still validate addresses
        const coinTicker = network === NetworkType.MAINNET ? 'eth' : 'gteth';
        coin = bitgo.coin(coinTicker);
      }
    } else {
      coin = bitgo.coin(values.selectedCoin?.name);
    }

    return coin;
  };

  const getRecoveryParams = () => {
    // This is like _.pick
    return [
      'userKey',
      'backupKey',
      'bitgoKey',
      'rootAddress',
      'walletContractAddress',
      'tokenAddress',
      'walletPassphrase',
      'recoveryDestination',
      'scan',
      'krsProvider',
      'gasLimit',
      'gasPrice',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ].reduce((obj, param) => {
      let value = values[param];
      const type = typeof value;
      if (value) {
        // Strip all whitespace, could be problematic
        if (type === 'string') {
          value = value.replace(/\s/g, '');
        }
        return Object.assign(obj, { [param]: value });
      }
      return obj;
    }, {});
  };

  const handleCopyDebugInfo = async () => {
    let recoveryDebugInfo;
    try {
      const baseCoin = getCoinObject();
      recoveryDebugInfo = await getRecoveryDebugInfo(baseCoin, getRecoveryParams());
    } catch (e) {
      console.error(`error gathering recovery debug info`, e);
      recoveryDebugInfo = e;
    }

    const errorInfo = {
      errorMessage: 'TBD',
      errorStack: 'TBD',
      recoveryDebugInfo: recoveryDebugInfo,
    };

    clipboard.writeText(JSON.stringify(errorInfo, null, 2));
  };

  const handleSubmit = async (values: INonBitgoRecoveriesFormValues) => {
    try {
      const baseCoin = getCoinObject() as AbstractUtxoCoin;

      const recoveryTool = baseCoin.recover;

      if (!recoveryTool) {
        setValidationErrors([
          {
            code: BitgoBackendErrorCode.INVALID_ARGUMENT,
            path: [],
            message: `Recovery tool not found for ${values.selectedCoin?.name}`,
          },
        ]);
        return;
      }

      let recoveryParams = getRecoveryParams() as any;

      if (isBlockChairKeyNeeded(selectedCoinName) && values.apiKey) {
        recoveryParams.apiKey = values.apiKey;
      }

      if (!coinConfig.allCoins[selectedCoinName].recoverP2wsh) {
        recoveryParams.ignoreAddressTypes = ['p2wsh'];
      }

      if (recoveryParams.gasLimit && recoveryParams.gasLimit <= 0) {
        setValidationErrors([
          {
            code: BitgoBackendErrorCode.INVALID_ARGUMENT,
            path: [],
            message: 'Gas limit must be a positive integer',
          },
        ]);
        return;
      }

      if (
        selectedCoinName === 'eth' ||
        // TODO(louis): need to handle token
        selectedCoinName === 'token'
      ) {
        recoveryParams = {
          ...recoveryParams,
          eip1559: {
            maxFeePerGas: toWei(recoveryParams.maxFeePerGas),
            maxPriorityFeePerGas: toWei(recoveryParams.maxPriorityFeePerGas),
          },
          replayProtectionOptions: {
            chain: network === NetworkType.MAINNET ? Chain.Mainnet : Chain.Goerli,
            hardfork: Hardfork.London,
          },
        };
        recoveryParams = omit(recoveryParams, ['gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas']);
      } else if (recoveryParams.gasPrice) {
        if (recoveryParams.gasPrice <= 0) {
          throw new Error('Gas price must be a positive integer');
        }
        // Convert the units back to wei, since that is the unit that backend uses.
        recoveryParams.gasPrice = toWei(recoveryParams.gasPrice);
      }

      const recovery = await recoverWithKeyPath(baseCoin, recoveryParams);

      const recoveryTx = recovery.transactionHex || recovery.txHex || recovery.tx || recovery.transaction;

      if (!recoveryTx) {
        throw new Error('Fully-signed recovery transaction not detected.');
      }

      const fileName = baseCoin.getChain() + '-recovery-' + Date.now().toString() + '.json';

      await saveFile(fileName, JSON.stringify(recovery, null, 4));

      if (values.selectedCoin?.name === 'eos') {
        const now = new Date();
        const sevenHoursFromNow = new Date(now.getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString();
        const eightHoursFromNow = new Date(now.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString();
        alert(
          `In seven hours, you will have an one-hour window to broadcast your EOS transaction: from ${sevenHoursFromNow} to ${eightHoursFromNow}.` +
            `For more information, please visit https://github.com/BitGo/wallet-recovery-wizard/blob/master/EOS.md.`
        );
      } else {
        alert(
          'We recommend that you use a third-party API to decode your txHex' +
            'and verify its accuracy before broadcasting.'
        );
      }

      setShowSuccess(true);
    } catch (err) {
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: err.message,
        },
      ]);
      return;
    }
  };

  const formik = useFormik<INonBitgoRecoveriesFormValues>({
    initialValues: {
      selectedCoin: undefined,
      userKey: undefined,
      backupKey: undefined,
      bitgoKey: undefined,
      walletContractAddress: undefined,
      rootAddress: undefined,
      tokenAddress: undefined,
      walletPassphrase: undefined,
      recoveryDestination: undefined,
      error: undefined,
      krsProvider: undefined,
      apiKey: undefined,
      scan: 20,
      gasLimit: 500000,
      gasPrice: 20, // Below values is in gwei, and only a default value if users do not override
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
    },
    validationSchema: NonBitgoRecoveriesFormSchema,
    onSubmit: handleSubmit,
  });

  const { errors, values, setFieldValue, submitForm, isSubmitting, submitCount, handleChange, touched } = formik;

  const selectedCoinName = getNonTestnetName(values.selectedCoin?.name, network);

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
        schema={NonBitgoRecoveriesFormSchema}
      >
        <div className="flex-grow-1 pv4 l-gpl l-gpr">
          <div className="mw7 center">
            <Lead2 mbx="mb4">
              Use your self-managed hot wallet recovery key card to create and broadcast a transaction without relying
              on BitGo.
            </Lead2>

            {!showSuccess && (
              <>
                <div className="pt4 pb3 ba b--border br2">
                  <div className="mb4 ph4">
                    <Label>Currency</Label>
                    <CurrencySelect
                      allowedCoins={
                        coinConfig.supportedRecoveries.nonBitGo[network === NetworkType.MAINNET ? 'prod' : 'test']
                      }
                      error={touched.selectedCoin ? errors.selectedCoin?.name : undefined}
                      className="mb1"
                      onItemSelect={(item) => {
                        setFieldValue('selectedCoin', item.bitgoStaticBaseCoin);
                      }}
                    />
                    <HelpBlock>
                      Current environment:{' '}
                      <span className="fw6">{network === NetworkType.MAINNET ? 'Mainnet' : 'Testnet'}</span>.{' '}
                      <NavLink to="/" className="blue">
                        Go back to change &rarr;
                      </NavLink>
                    </HelpBlock>

                    <Collapse isOpen={selectedCoinName && coinConfig.allCoins[selectedCoinName].replayableNetworks}>
                      <div className="pt3">
                        <div className="pa3 ba b--border bg-almost-white flex br2">
                          <Icon icon="warning-sign" />
                          <div className="ml2 lh-copy">
                            {selectedCoinName &&
                              coinConfig.allCoins[selectedCoinName].replayableNetworks &&
                              tooltips.replayTxWarning(selectedCoinName)}
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </div>

                  <Section
                    className="ph4"
                    bodyClassName="pt3"
                    sectionHeaderProps={{
                      titleH5: 'Hot wallet details',
                      hideHeaderBorder: false,
                    }}
                  >
                    {!selectedCoinName ? (
                      <HelpBlock className="tc mb3 pv4 br2 ba--dashed">Please select a currency above.</HelpBlock>
                    ) : (
                      <div className="mb4">
                        <Label>Key Recovery Service</Label>
                        <HtmlSelect
                          className="mb1"
                          options={krsProviders}
                          name="krsProvider"
                          onChange={handleChange}
                          value={values.krsProvider}
                          placeholder=""
                        />
                        <HelpBlock className="mb3">{tooltips.recovery.krsProvider}</HelpBlock>

                        {displayedParams[selectedCoinName].includes('apiKey') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'API Key',
                              }}
                              inputProps={{
                                className: 'mb1',
                                value: values.apiKey,
                                onChange: handleChange,
                                name: 'apiKey',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.apiKey(selectedCoinName)}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('userKey') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Box A Value',
                              }}
                              textareaProps={{
                                error: touched.userKey ? errors.userKey : undefined,
                                name: 'userKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "A: User Key" from your BitGo keycard...',
                                rows: 4,
                                minRows: 4,
                                maxRows: 4,
                                value: values.userKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.apiKey(selectedCoinName)}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('backupKey') && values.krsProvider ? (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Box B Value',
                              }}
                              textareaProps={{
                                error: touched.backupKey ? errors.backupKey : undefined,
                                name: 'backupKey',
                                onChange: (event) => {
                                  const value = event.currentTarget.value;
                                  setFieldValue('backupKey', value.replace(/\s/g, ''));
                                },
                                className: 'mb1',
                                placeholder: 'Enter the "B: Backup Key" from your BitGo keycard...',
                                rows: 4,
                                minRows: 4,
                                maxRows: 4,
                                value: values.backupKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.backupPublicKey}</HelpBlock>
                          </>
                        ) : (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Box B Value',
                              }}
                              textareaProps={{
                                error: touched.backupKey ? errors.backupKey : undefined,
                                name: 'backupKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "B: Backup Key" from your BitGo keycard...',
                                rows: 4,
                                minRows: 4,
                                maxRows: 4,
                                value: values.backupKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.backupPrivateKey}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('bitgoKey') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Box C Value',
                              }}
                              textareaProps={{
                                error: touched.bitgoKey ? errors.bitgoKey : undefined,
                                name: 'bitgoKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "C: BitGo Public Key" from your BitGo keycard...',
                                rows: 2,
                                minRows: 2,
                                maxRows: 2,
                                value: values.bitgoKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.bitgoKey}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('rootAddress') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Root Address',
                              }}
                              inputProps={{
                                error: touched.rootAddress ? errors.rootAddress : undefined,
                                name: 'rootAddress',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.rootAddress,
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.rootAddress}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('walletContractAddress') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Wallet Contract Address',
                              }}
                              inputProps={{
                                error: touched.walletContractAddress ? errors.walletContractAddress : undefined,
                                name: 'walletContractAddress',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.walletContractAddress,
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.walletContractAddress}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('tokenContractAddress') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Token Contract Address',
                              }}
                              inputProps={{
                                error: touched.tokenAddress ? errors.tokenAddress : undefined,
                                name: 'tokenAddress',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.tokenAddress,
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.tokenAddress}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('walletPassphrase') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Wallet Passphrase',
                              }}
                              inputProps={{
                                error: touched.walletPassphrase ? errors.walletPassphrase : undefined,
                                name: 'walletPassphrase',
                                onChange: handleChange,
                                className: 'mb1',
                                type: 'password',
                                value: values.walletPassphrase,
                                placeholder: 'Enter your wallet password...',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.walletPassphrase}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('recoveryDestination') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Destination Address',
                              }}
                              inputProps={{
                                error: touched.recoveryDestination ? errors.recoveryDestination : undefined,
                                name: 'recoveryDestination',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.recoveryDestination,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.recoveryDestination}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('scan') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Address Scanning Factor',
                              }}
                              inputProps={{
                                error: touched.scan ? errors.scan : undefined,
                                onChange: handleChange,
                                className: 'mb1 mw3',
                                value: values.scan ? values.scan.toString() : '',
                                name: 'scan',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.scan}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('apiKey') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'API Key',
                              }}
                              inputProps={{
                                error: touched.apiKey ? errors.apiKey : undefined,
                                name: 'apiKey',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.apiKey,
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.apiKey(selectedCoinName)}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('gasLimit') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Gas Limit',
                              }}
                              inputProps={{
                                error: touched.gasLimit ? errors.gasLimit : undefined,
                                name: 'gasLimit',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.gasLimit ? values.gasLimit.toString() : '',
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.gasLimit}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('gasPrice') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Gas Price (Gwei)',
                              }}
                              inputProps={{
                                error: touched.gasPrice ? errors.gasPrice : undefined,
                                name: 'gasPrice',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.gasPrice ? values.gasPrice.toString() : '',
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.gasPrice}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('maxFeePerGas') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Max Fee Per Gas (Gwei)',
                              }}
                              inputProps={{
                                error: touched.maxFeePerGas ? errors.maxFeePerGas : undefined,
                                name: 'maxFeePerGas',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.maxFeePerGas ? values.maxFeePerGas.toString() : '',
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.maxFeePerGas}</HelpBlock>
                          </>
                        )}

                        {displayedParams[selectedCoinName].includes('maxPriorityFeePerGas') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Max Priority Fee Per Gas (Gwei)',
                              }}
                              inputProps={{
                                error: touched.maxPriorityFeePerGas ? errors.maxPriorityFeePerGas : undefined,
                                name: 'maxPriorityFeePerGas',
                                onChange: handleChange,
                                className: 'mb1',
                                value: values.maxPriorityFeePerGas ? values.maxPriorityFeePerGas.toString() : '',
                                placeholder: 'TBD',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.recovery.maxPriorityFeePerGas}</HelpBlock>
                          </>
                        )}
                      </div>
                    )}
                  </Section>
                </div>
                <Footer
                  className="bn"
                  isFlush
                  isVisible
                  isPrimaryButtonLoading={isSubmitting}
                  primaryButtonText="Recover Funds"
                  cancelButtonText="Cancel"
                  primaryButtonGroupElement={<Button onClick={() => handleCopyDebugInfo()}>Copy Debug Info</Button>}
                  onCancelButtonClick={() => {
                    history.push('/');
                  }}
                  onPrimaryButtonClick={submitForm}
                />
              </>
            )}
            {showSuccess && (
              <div className="pa5 ba b--border br2 flex flex-column items-center justify-center">
                <div className="w-100 flex flex-column items-center justify-center mb2">
                  <SuccessAnimation className="mb3" />
                  <Lead2 className="tc">TBD</Lead2>
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

export default NonBitgoRecoveriesForm;
