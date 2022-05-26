import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { BaseCoin } from '@bitgo/sdk-core';
import { BaseCoin as BitgoStaticBaseCoin, NetworkType } from '@bitgo/statics';
import { Collapse, Icon } from '@blueprintjs/core';
import { Chain, Hardfork } from '@ethereumjs/common';
import { fromBase58 } from 'bip32';
import * as BitGoJS from 'bitgo';
import * as Errors from 'bitgo/dist/src/errors';
import { useFormik } from 'formik';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import { Label } from '../../modules/lumina/components/label/label';
import Lead2 from '../../modules/lumina/components/lead2/lead2';
import { Section } from '../../modules/lumina/components/section/section';
import { TextareaField } from '../../modules/lumina/components/textarea-field';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { saveFile } from '../../pkg/electron/utils';
import { useApplicationContext } from '../contexts/application-context';
import CurrencySelect from '../currency-select/currency-select';
import { SuccessAnimation } from '../success-animation/success-animation';
import tooltips from '../tooltips';
import { coinConfig, getDerivedXpub, isBlockChairKeyNeeded, recoverWithKeyPath, toWei } from '../utils';

const { dialog } = window.require('electron').remote;

const displayedParams = {
  btc: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan'],
  bsv: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  bcha: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  bch: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  ltc: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  btg: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  zec: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  dash: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
  eth: [
    'userKey',
    'userKeyID',
    'backupKey',
    'backupKeyID',
    'walletContractAddress',
    'walletPassphrase',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  xrp: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'rootAddress', 'recoveryDestination'],
  xlm: ['userKey', 'backupKey', 'rootAddress', 'recoveryDestination'],
  token: [
    'userKey',
    'userKeyID',
    'backupKey',
    'backupKeyID',
    'walletContractAddress',
    'tokenContractAddress',
    'recoveryDestination',
    'apiKey',
    'gasLimit',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
  ],
  trx: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan'],
  eos: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  near: ['commonKeyChain', 'recoveryDestination', 'scan'],
  dot: ['commonKeyChain', 'recoveryDestination', 'scan'],
  sol: ['commonKeyChain', 'recoveryDestination', 'scan'],
};

interface IBuildUnsignedSweepFormProps extends IBaseProps {}

interface IBuildUnsignedSweepFormValues {
  selectedCoin?: BitgoStaticBaseCoin;
  commonKeyChain?: string;
  userKey: string;
  userKeyID: string;
  backupKey: string;
  backupKeyID: string;
  bitgoKey: string;
  rootAddress: string;
  walletContractAddress: string;
  tokenAddress: string;
  walletPassphrase: string;
  recoveryDestination: string;
  apiKey: string;
  scan: number;
  krsProvider: string;
  gasLimit: number;
  gasPrice: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
}

function BuildUnsignedSweepForm(props: IBuildUnsignedSweepFormProps) {
  const { bitgoSDKOfflineWrapper, network } = useApplicationContext();
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const history = useHistory();

  // TODO(louis): needs more validations
  const BuildUnsignedSweepFormSchema = Yup.object().shape({
    selectedCoin: Yup.object().shape({
      name: Yup.string().required('Please select a currency'),
    }),
    userKey: Yup.string().required('Please enter the "Provided User Key" from your BitGo recovery keycard'),
    backupKey: Yup.string().required('Please enter the "Backup Key" from your BitGo recovery keycard'),
    bitgoKey: Yup.string().required('Please enter the "BitGo Public Key" from your BitGo recovery keycard'),
    recoveryDestination: Yup.string().required('Please enter a recovery address'),
    scan: Yup.string().required('Please select a currency'),

    // TODO(louis): other coins will probably have conditional validations
    // passwordType: Yup.string().when('type', {
    //   is: BitgoWalletType.Hot,
    //   then: Yup.string().required('Please select a wallet password type'),
    // }),
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

    if (values.selectedCoin.isToken) {
      try {
        coin = bitgo.coin(values.tokenAddress);
      } catch (e) {
        // if we're here, the token address is malformed. let's set the coin to ETH so we can still validate addresses
        const coinTicker = network === NetworkType.MAINNET ? 'eth' : 'gteth';
        coin = bitgo.coin(coinTicker);
      }
    } else {
      coin = bitgo.coin(values.selectedCoin.name);
    }

    return coin;
  };

  const isDerivationPath = (derivationId: string, keyName: string) => {
    const derivationPathMessage =
      'Is the provided value a Derivation Path or a Seed?\n' + keyName + ': ' + derivationId + '\n';

    if (derivationId.length > 2 && derivationId.indexOf('m/') === 0) {
      const response = dialog.showMessageBox({
        type: 'question',
        buttons: ['Derivation Path', 'Seed'],
        title: 'Derivation Path?',
        message: derivationPathMessage,
      });

      return response === 0;
    }

    return false;
  };

  const deriveKeyByPath = (key: string, path: string) => {
    try {
      const node = fromBase58(key);
      const derivedNode = node.derivePath(path);
      return derivedNode.toBase58();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // If the user and/or backup keys are derived with a KeyID, we need to derive the proper key from that
  const updateKeysFromIDs = (basecoin: BaseCoin, recoveryParams) => {
    const keyInfo = [
      {
        id: recoveryParams.userKeyID,
        key: recoveryParams.userKey,
        description: 'User Key ID',
        name: 'userKey',
      },
      {
        id: recoveryParams.backupKeyID,
        key: recoveryParams.backupKey,
        description: 'Backup Key ID',
        name: 'backupKey',
      },
    ];

    keyInfo.forEach((keyObj) => {
      if (keyObj.id && keyObj.id !== '') {
        if (isDerivationPath(keyObj.id, keyObj.description)) {
          recoveryParams[keyObj.name] = deriveKeyByPath(keyObj.key, keyObj.id);
        } else {
          const response = basecoin.deriveKeyWithSeed({ key: keyObj.key, seed: keyObj.id });
          recoveryParams[keyObj.name] = response.key;
        }
        // once we've derived the key, then delete the keyID so we don't pass it through to the SDK
        delete recoveryParams[keyObj.name + 'ID'];
      }
    });
  };

  const getRecoveryParams = () => {
    // This is like _.pick
    return [
      'commonKeyChain',
      'userKey',
      'userKeyID',
      'backupKey',
      'backupKeyID',
      'bitgoKey',
      'rootAddress',
      'walletContractAddress',
      'walletPassphrase',
      'tokenAddress',
      'recoveryDestination',
      'scan',
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

  const handleSubmit = async (values: IBuildUnsignedSweepFormValues) => {
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

      if (recoveryParams.gasLimit) {
        if (recoveryParams.gasLimit <= 0 || recoveryParams.gasLimit !== parseInt(recoveryParams.gasLimit, 10)) {
          throw new Error('Gas limit must be a positive integer');
        }
      } else {
        // setting a default gas limit for the transaction as any excess funds which is not utilized for
        // gas fees will be refunded for the sender. We cannot estimate the actual gas without the data
        // part of the transaction which should be signed which we cannot get in WRW.
        recoveryParams.gasLimit = 500000;
      }

      if (values.selectedCoin?.name === 'eth' || values.selectedCoin?.name === 'token') {
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
        if (recoveryParams.gasPrice <= 0 || recoveryParams.gasPrice !== parseInt(recoveryParams.gasPrice, 10)) {
          throw new Error('Gas price must be a positive integer');
        }
        recoveryParams.gasPrice = toWei(recoveryParams.gasPrice);
      }

      if (isBlockChairKeyNeeded(values.selectedCoin?.name) && values.apiKey) {
        recoveryParams.apiKey = values.apiKey;
      }

      updateKeysFromIDs(baseCoin, recoveryParams);

      const recoveryPrebuild = (await recoverWithKeyPath(baseCoin, recoveryParams)) as any;

      // If key derivation path is defined, we will use that to give the derivated xpubs instead of the master xpubs
      const userXpub = values['userKeyID']
        ? getDerivedXpub(baseCoin, values['userKey'], values['userKeyID'])?.key
        : values['userKey'];
      const backupXpub = values['backupKeyID']
        ? getDerivedXpub(baseCoin, values['backupKey'], values['backupKeyID'])?.key
        : values['backupKey'];
      recoveryPrebuild.xpubsWithDerivationPath = {
        user: { xpub: userXpub, derivedFromParentWithSeed: values['userKeyID'] },
        backup: { xpub: backupXpub, derivedFromParentWithSeed: values['backupKeyID'] },
        bitgo: { xpub: values['bitgoKey'] },
      };

      // Keeping the pubs key intact to ensure people who use old
      // OVC < v4.2.1 won't be blocked. This will be deprecated
      // in future
      recoveryPrebuild.pubs = [userXpub, backupXpub, values['bitgoKey']];

      if (!recoveryPrebuild) {
        throw new Errors.ErrorNoInputToRecover();
      }
      const fileName = baseCoin.getChain() + '-unsigned-sweep-' + Date.now().toString() + '.json';
      await saveFile(fileName, JSON.stringify(recoveryPrebuild, null, 4));

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

  const formik = useFormik<IBuildUnsignedSweepFormValues>({
    initialValues: {
      selectedCoin: undefined,
      commonKeyChain: undefined,
      userKey: undefined,
      userKeyID: undefined,
      backupKey: undefined,
      backupKeyID: undefined,
      bitgoKey: undefined,
      rootAddress: undefined,
      walletContractAddress: undefined,
      tokenAddress: undefined,
      walletPassphrase: undefined,
      recoveryDestination: undefined,
      apiKey: undefined,
      scan: 20,
      krsProvider: undefined,
      gasLimit: 500000,
      gasPrice: 20, // Below values is in gwei, and only a default value if users do not override
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
    },
    validationSchema: BuildUnsignedSweepFormSchema,
    onSubmit: handleSubmit,
  });

  const { errors, values, setFieldValue, submitForm, isSubmitting, submitCount, handleChange, touched } = formik;

  const selectedCoinName = values.selectedCoin?.name
    ? bitgoSDKOfflineWrapper.bitgoSDK.coin(values.selectedCoin.name).getFamily()
    : undefined;

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
        schema={BuildUnsignedSweepFormSchema}
      >
        <div className="flex-grow-1 pv4 l-gpl l-gpr">
          <div className="mw7 center">
            <Lead2 mbx="mb4">
              Construct an unsigned sweep transaction for the self-managed cold wallet without using BitGo.
            </Lead2>

            {!showSuccess && (
              <>
                <div className="pt4 pb3 ba b--border br2">
                  <div className="mb4 ph4">
                    <Label>Currency</Label>
                    <CurrencySelect
                      allowedCoins={
                        coinConfig.supportedRecoveries.unsignedSweep[network === NetworkType.MAINNET ? 'prod' : 'test']
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
                      titleH5: 'Self-managed cold wallet details',
                      hideHeaderBorder: false,
                    }}
                  >
                    {!selectedCoinName ? (
                      <HelpBlock className="tc mb3 pv4 br2 ba--dashed">Please select a currency above.</HelpBlock>
                    ) : (
                      <div className="mb4">
                        {displayedParams[selectedCoinName].includes('commonKeyChain') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Common Key Chain',
                              }}
                              textareaProps={{
                                error: touched.commonKeyChain ? errors.commonKeyChain : undefined,
                                name: 'commonKeyChain',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'TBD...',
                                rows: 2,
                                minRows: 2,
                                maxRows: 2,
                                value: values.commonKeyChain,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.commonKeyChain}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('userKey') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'User Public Key',
                              }}
                              textareaProps={{
                                'data-testid': 'userKey',
                                error: touched.userKey ? errors.userKey : undefined,
                                name: 'userKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "Provided User Key" from your BitGo keycard...',
                                rows: 2,
                                minRows: 2,
                                maxRows: 2,
                                value: values.userKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.userKey}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('userKeyID') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'User Key ID (optional)',
                              }}
                              inputProps={{
                                className: 'mb1',
                                value: values.userKeyID,
                                onChange: handleChange,
                                name: 'userKeyID',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.userKeyID}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('backupKey') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Backup Public Key',
                              }}
                              textareaProps={{
                                'data-testid': 'backupKey',
                                error: touched.backupKey ? errors.backupKey : undefined,
                                name: 'backupKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "Backup Key" from your BitGo keycard...',
                                rows: 2,
                                minRows: 2,
                                maxRows: 2,
                                value: values.backupKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.backupPublicKey}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('backupKeyID') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Backup Key ID (optional)',
                              }}
                              inputProps={{
                                className: 'mb1',
                                value: values.backupKeyID,
                                onChange: handleChange,
                                name: 'backupKeyID',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.backupKeyID}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('bitgoKey') && (
                          <>
                            <TextareaField
                              layout="vertical"
                              labelProps={{
                                labelText: 'BitGo Public Key',
                              }}
                              textareaProps={{
                                'data-testid': 'bitgoKey',
                                error: touched.bitgoKey ? errors.bitgoKey : undefined,
                                name: 'bitgoKey',
                                onChange: handleChange,
                                className: 'mb1',
                                placeholder: 'Enter the "BitGo Public Key" from your BitGo keycard...',
                                rows: 2,
                                minRows: 2,
                                maxRows: 2,
                                value: values.bitgoKey,
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.bitgoKey}</HelpBlock>
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
                                className: 'mb1',
                                value: values.rootAddress,
                                onChange: handleChange,
                                name: 'rootAddress',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.rootAddress}</HelpBlock>
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
                                className: 'mb1',
                                value: values.walletContractAddress,
                                onChange: handleChange,
                                name: 'walletContractAddress',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.walletContractAddress}</HelpBlock>
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
                                className: 'mb1',
                                value: values.tokenAddress,
                                onChange: handleChange,
                                name: 'tokenAddress',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.tokenAddress}</HelpBlock>
                          </>
                        )}
                        {displayedParams[selectedCoinName].includes('walletPassphrase') && (
                          <InputField
                            layout="vertical"
                            labelProps={{
                              labelText: 'Wallet Passphrase',
                            }}
                            inputProps={{
                              className: 'mb3',
                              value: values.walletPassphrase,
                              onChange: handleChange,
                              type: 'password',
                              name: 'walletPassphrase',
                              placeholder: 'Enter your wallet password...',
                            }}
                          />
                        )}
                        {displayedParams[selectedCoinName].includes('recoveryDestination') && (
                          <>
                            <InputField
                              layout="vertical"
                              labelProps={{
                                labelText: 'Destination Address',
                              }}
                              inputProps={{
                                'data-testid': 'recoveryDestination',
                                className: 'mb1',
                                value: values.recoveryDestination,
                                onChange: handleChange,
                                name: 'recoveryDestination',
                                placeholder: 'Enter destination address...',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.recoveryDestination}</HelpBlock>
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
                                className: 'mb1 mw3',
                                value: values.scan ? values.scan.toString() : '',
                                onChange: handleChange,
                                name: 'scan',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.scan}</HelpBlock>
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
                                className: 'mb1',
                                value: values.gasPrice ? values.gasPrice.toString() : '',
                                onChange: handleChange,
                                name: 'gasPrice',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.gasPrice}</HelpBlock>
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
                                className: 'mb1',
                                value: values.gasLimit ? values.gasLimit.toString() : '',
                                onChange: handleChange,
                                name: 'gasLimit',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.gasLimit}</HelpBlock>
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
                                className: 'mb1',
                                value: values.maxFeePerGas ? values.maxFeePerGas.toString() : '',
                                onChange: handleChange,
                                name: 'maxFeePerGas',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.maxFeePerGas}</HelpBlock>
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
                                className: 'mb1',
                                value: values.maxPriorityFeePerGas ? values.maxPriorityFeePerGas.toString() : '',
                                onChange: handleChange,
                                name: 'maxPriorityFeePerGas',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.maxPriorityFeePerGas}</HelpBlock>
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
                                className: 'mb1',
                                value: values.apiKey,
                                onChange: handleChange,
                                name: 'apiKey',
                              }}
                            />
                            <HelpBlock className="mb3">{tooltips.unsignedSweep.apiKey(selectedCoinName)}</HelpBlock>
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
                  onCancelButtonClick={() => {
                    history.push('/');
                  }}
                  onPrimaryButtonClick={submitForm}
                />
              </>
            )}
            {showSuccess && (
              <div className="pa5 ba b--border br2 flex flex-column items-center justify-center">
                <div className="w-100 flex flex-column items-center justify-center mb2 ph4">
                  <SuccessAnimation className="mb3" />
                  <Lead2 className="tc">We recommend that you use a third-party API to decode your txHex and verify its accuracy before broadcasting.</Lead2>
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

export default BuildUnsignedSweepForm;
