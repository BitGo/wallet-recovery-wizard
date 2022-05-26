import { NetworkType } from '@bitgo/statics';
import * as utxolib from '@bitgo/utxo-lib';
import { address, bip32, Transaction, TransactionBuilder } from '@bitgo/utxo-lib';
import { Icon } from '@blueprintjs/core';
import { AbstractUtxoCoin } from 'bitgo/dist/types/src/v2/coins';
import { useFormik } from 'formik';
import { find } from 'lodash';
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { BitgoInstrument } from '../../modules/lumina/api/bitgo-instruments';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import { Label } from '../../modules/lumina/components/label/label';
import Lead2 from '../../modules/lumina/components/lead2/lead2';
import { Section } from '../../modules/lumina/components/section/section';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { useApplicationContext } from '../contexts/application-context';
import CurrencySelect from '../currency-select/currency-select';
import { SuccessAnimation } from '../success-animation/success-animation';
import tooltips from '../tooltips';
import { coinConfig } from '../utils';

interface IMigratedLegacyWalletRecoveriesFormProps extends IBaseProps {}

interface IMigratedLegacyWalletRecoveriesFormValues {
  selectedInstrument?: BitgoInstrument;
  walletId: string;
  recoveryAddress: string;
  passphrase: string;
  twofa: string;
}

function MigratedLegacyWalletRecoveriesForm(props: IMigratedLegacyWalletRecoveriesFormProps) {
  const { bitgoSDKOfflineWrapper, network } = useApplicationContext();
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recoveryTxID, setRecoveryTxID] = useState('');

  const history = useHistory();

  const MigratedLegacyWalletRecoveriesFormSchema = Yup.object().shape({
    selectedInstrument: Yup.object().required('Please select a currency'),
    walletId: Yup.string().required('Please enter the original wallet ID'),
    recoveryAddress: Yup.string().required('Please enter a recovery address'),
    passphrase: Yup.string().required('Please enter the wallet password'),
    twofa: Yup.string().required('Please enter your 2FA code'),
  });

  const createRecoveryTx = async (coin: AbstractUtxoCoin, migratedWallet, v1BtcWalletId) => {
    const OUTPUT_SIZE = 34;

    let feeRate = 5000;

    try {
      address.fromBase58Check(values.recoveryAddress, coin.network);
    } catch (e) {
      throw new Error('Invalid destination address, only base 58 is supported');
    }

    const maximumSpendable = await migratedWallet.maximumSpendable({ feeRate });
    const spendableAmount = parseInt(maximumSpendable.maximumSpendable, 10);

    let v1Wallet;
    try {
      v1Wallet = await bitgoSDKOfflineWrapper.bitgoSDK.wallets().get({ id: v1BtcWalletId });
    } catch (err) {
      if (err.message === 'not found') {
        throw new Error('v1 BTC Wallet not found. Make sure you are a user on that wallet.');
      } else {
        throw err;
      }
    }

    let txAmount;
    if (coin.getFamily() === 'bsv') {
      // BSV does not support paygo fees anymore
      txAmount = spendableAmount;
    } else {
      // Account for paygo fee plus fee for paygo output
      const payGoDeduction = Math.floor(spendableAmount * 0.01) + OUTPUT_SIZE * (feeRate / 1000);
      txAmount = spendableAmount - payGoDeduction;
    }

    let txPrebuild;
    try {
      txPrebuild = await migratedWallet.prebuildTransaction({
        recipients: [
          {
            address: values.recoveryAddress,
            amount: txAmount,
          },
        ],
        feeRate,
        noSplitChange: true,
      });
    } catch (e) {
      console.error('Got error building tx:');
      throw e;
    }

    if (!utxolib) {
      throw new Error('could not get utxo lib reference from bitgo object');
    }

    let signingKeychain;
    try {
      signingKeychain = await v1Wallet.getAndPrepareSigningKeychain({ walletPassphrase: values.passphrase });
    } catch (err) {
      console.error(`error while getting or decrypting signing keychain: ${err.message}`);
      throw Error(
        `Failed to get signing keychain (${err.message}). Only the original owner of the v1 btc wallet can perform this recovery`
      );
    }

    const rootExtKey = bip32.fromBase58(signingKeychain.xprv);

    rootExtKey.keyPair.network = coin.network;

    const hdPath = utxolib.hdPath(rootExtKey);

    // sign the transaction

    let transaction = Transaction.fromHex(txPrebuild.txHex);

    if (transaction.ins.length !== txPrebuild.txInfo.unspents.length) {
      throw new Error('length of unspents array should equal to the number of transaction inputs');
    }

    const txb = TransactionBuilder.fromTransaction(transaction);
    txb.setVersion(2);

    for (let inputIndex = 0; inputIndex < transaction.ins.length; ++inputIndex) {
      // get the current unspent
      const currentUnspent = txPrebuild.txInfo.unspents[inputIndex];

      if (coin.isBitGoTaintedUnspent(currentUnspent)) {
        console.log(`Skipping taint input ${inputIndex} - only BitGo will sign this one`);
        continue;
      }
      if (currentUnspent.chain === undefined || currentUnspent.index === undefined) {
        console.warn(`missing chain or index for unspent: ${currentUnspent.id}. skipping...`);
        continue;
      }
      const chainPath = '/' + currentUnspent.chain + '/' + currentUnspent.index;
      const subPath = signingKeychain.walletSubPath || '/0/0';
      const path = signingKeychain.path + subPath + chainPath;
      // derive the correct key
      const privKey = hdPath.deriveKey(path);
      const value = currentUnspent.value;

      // do the signature flow
      const subscript = new Buffer(currentUnspent.redeemScript, 'hex');

      const sigHashType = coin.defaultSigHashType;
      try {
        // BTG only needs to worry about P2SH-P2WSH
        if (currentUnspent.witnessScript) {
          const witnessScript = Buffer.from(currentUnspent.witnessScript, 'hex');
          txb.sign(inputIndex, privKey, subscript, sigHashType, value, witnessScript);
        } else {
          txb.sign(inputIndex, privKey, subscript, sigHashType, value);
        }
      } catch (e) {
        console.log(`got exception while signing unspent ${JSON.stringify(currentUnspent)}`);
        console.trace(e);
        throw e;
      }

      // now, let's verify the signature
      transaction = txb.buildIncomplete();

      const isSignatureVerified = coin.verifySignature(transaction, inputIndex, value);
      if (!isSignatureVerified) {
        throw new Error(`Could not verify signature on input #${inputIndex}`);
      }
    }

    const tx = txb.buildIncomplete();
    return {
      hex: tx.toHex(),
      id: tx.getId(),
    };
  };

  const handleSubmit = async (values: IMigratedLegacyWalletRecoveriesFormValues) => {
    try {
      const coin = bitgoSDKOfflineWrapper.bitgoSDK.coin(
        values.selectedInstrument?.bitgoStaticBaseCoin?.name
      ) as AbstractUtxoCoin;
      const wallets = await coin.wallets().list();

      console.log('coin.getFullName(): ', coin.getFullName());
      console.log('wallets: ', wallets);
      let v1BtcWalletId;

      // There is a bug that some BTG wallets have the private migrated object ID instead of public, hence the substring addition below
      const migratedWallet = find(
        wallets.wallets,
        // @ts-ignore
        (w) => w._wallet.migratedFrom === values.walletId || w._wallet.migratedFrom === values.walletId.substring(0, 24)
      );

      if (!migratedWallet) {
        throw new Error(
          `Unable to find a ${values.selectedInstrument?.bitgoStaticBaseCoin?.name} wallet that was migrated from wallet with ID ${values.walletId}.`
        );
      }

      console.info('found wallet: ', migratedWallet.id());

      // If we are recovering BSV, then the code above finds a BCH wallet (migratedWallet)
      // If that is the case, then we need to dig deeper and get the original v1 BTC wallet, and reset migratedWallet to this v1 BTC wallet
      if (coin.getFamily() === 'bsv') {
        const bch = bitgoSDKOfflineWrapper.bitgoSDK.coin(
          bitgoSDKOfflineWrapper.bitgoSDK.getEnv() === 'prod' ? 'bch' : `tbch`
        );
        const bchWallet = await bch.wallets().getWallet({ id: values.walletId });
        if (!bchWallet) {
          throw new Error(
            `could not find the original v1 btc wallet corresponding to the bch wallet with ID ${values.walletId}`
          );
        }
        // reset the state to this wallet id
        // @ts-ignore
        v1BtcWalletId = bchWallet._wallet.migratedFrom;
      } else {
        v1BtcWalletId = values.walletId;
      }

      let recoveryTx;
      try {
        recoveryTx = await createRecoveryTx(coin, migratedWallet, v1BtcWalletId);
      } catch (e) {
        if (e.message === 'insufficient balance') {
          // this is terribly unhelpful
          e.message = 'Insufficient balance to recover';
        }
        throw e;
      }

      if (!recoveryTx || !recoveryTx.hex) {
        console.error('Failed to create half-signed recovery transaction');
        return;
      }

      let needsUnlock = false;
      try {
        await migratedWallet.submitTransaction({
          txHex: recoveryTx.hex,
        });
      } catch (e) {
        if (e.message === 'needs unlock') {
          // try again after unlocking
          needsUnlock = true;
        } else {
          throw e;
        }
      }

      if (needsUnlock) {
        try {
          await bitgoSDKOfflineWrapper.bitgoSDK.unlock({ otp: values.twofa });
          await migratedWallet.submitTransaction({
            txHex: recoveryTx.hex,
          });
          console.info(`successfully submitted transaction ${recoveryTx.id} to bitgo`);
        } catch (e) {
          throw e;
        }
      }
      setRecoveryTxID(recoveryTx.id);
      setShowSuccess(true);
    } catch (error) {
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: error.message,
        },
      ]);
    }
  };

  const formik = useFormik<IMigratedLegacyWalletRecoveriesFormValues>({
    initialValues: {
      selectedInstrument: undefined,
      walletId: undefined,
      recoveryAddress: undefined,
      passphrase: undefined,
      twofa: undefined,
    },
    validationSchema: MigratedLegacyWalletRecoveriesFormSchema,
    onSubmit: handleSubmit,
  });

  const { submitCount, errors, values, setFieldValue, submitForm, isSubmitting, handleChange, initialValues, touched } =
    formik;

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
        schema={MigratedLegacyWalletRecoveriesFormSchema}
      >
        <div className="flex-grow-1 pv4 l-gpl l-gpr">
          <div className="mw7 center">
            <Lead2 mbx="mb2">
              Recover funds from a migrated wallet which is no longer officially supported by BitGo.
            </Lead2>
            {/* <Lead2 mbx="mb3">
              Current environment:{' '}
              <span className="fw6">{network === NetworkType.MAINNET ? 'Mainnet' : 'Testnet'}</span>.{' '}
              <NavLink to="/" className="blue">
                Go back to change &rarr;
              </NavLink>
            </Lead2> */}

            <div className="mb4">
              <div className="pa3 ba b--border bg-almost-white flex br2">
                <Icon icon="warning-sign" className="mt1" />
                <div className="ml2 lh-copy">
                  Unsupported tokens may only be recovered from a wallet&apos;s base address. Please contact{' '}
                  <a className="pointer blue" href="mailto:support@bitgo.com">
                    support@bitgo.com
                  </a>{' '}
                  to send tokens from a wallet&apos;s receive address to its base address.
                </div>
              </div>
            </div>

            {!showSuccess && (
              <>
                <div className="pt4 pb3 ba b--border br2">
                  <Section
                    className="ph4"
                    bodyClassName="pt3"
                    sectionHeaderProps={{
                      titleH5: 'Wallet Information',
                      hideHeaderBorder: false,
                    }}
                  >
                    <Label>Currency</Label>
                    <CurrencySelect
                      allowedCoins={
                        coinConfig.supportedRecoveries.migrated[network === NetworkType.MAINNET ? 'prod' : 'test']
                      }
                      error={touched.selectedInstrument ? errors.selectedInstrument?.toString() : undefined}
                      className="mb1"
                      activeItem={{
                        bitgoInstrument: initialValues?.selectedInstrument,
                      }}
                      onItemSelect={(item) => {
                        setFieldValue('selectedInstrument', item);
                      }}
                    />
                    <HelpBlock className="mb3">
                      Current environment:{' '}
                      <span className="fw6">{network === NetworkType.MAINNET ? 'Mainnet' : 'Testnet'}</span>.{' '}
                      <NavLink to="/" className="blue">
                        Go back to change &rarr;
                      </NavLink>
                    </HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: 'Original Wallet ID',
                      }}
                      inputProps={{
                        name: 'walletId',
                        onChange: handleChange,
                        error: touched.walletId ? errors.walletId : undefined,
                        className: 'mb1',
                        value: values.walletId,
                        placeholder: '',
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.migratedLegacy.walletId}</HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: 'Destination Address',
                      }}
                      inputProps={{
                        name: 'recoveryAddress',
                        onChange: handleChange,
                        error: touched.recoveryAddress ? errors.recoveryAddress : undefined,
                        className: 'mb1',
                        value: values.recoveryAddress,
                        placeholder: '',
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.migratedLegacy.recoveryAddress}</HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: 'Wallet Passphrase',
                      }}
                      inputProps={{
                        name: 'passphrase',
                        onChange: handleChange,
                        type: 'password',
                        error: touched.passphrase ? errors.passphrase : undefined,
                        className: 'mb1',
                        value: values.passphrase,
                        placeholder: '',
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.migratedLegacy.passphrase}</HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: '2FA Code',
                      }}
                      inputProps={{
                        name: 'twofa',
                        error: touched.twofa ? errors.twofa : undefined,
                        onChange: handleChange,
                        className: 'mw4 mb3',
                        value: values.twofa,
                        placeholder: '',
                      }}
                    />
                  </Section>
                </div>
                <Footer
                  className="bn"
                  isFlush
                  isVisible
                  isPrimaryButtonLoading={isSubmitting}
                  primaryButtonText="Recover Wallet"
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
                <div className="w-100 flex flex-column items-center justify-center mb2">
                  <SuccessAnimation className="mb3" />
                  <Lead2 className="tc">
                    Success! Recovery transaction has been submitted. Transaction ID: {recoveryTxID}
                  </Lead2>
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

export default MigratedLegacyWalletRecoveriesForm;
