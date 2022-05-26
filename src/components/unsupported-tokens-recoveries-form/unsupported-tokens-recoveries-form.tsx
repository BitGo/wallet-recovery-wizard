import { Collapse, Icon, Radio, RadioGroup } from '@blueprintjs/core';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import Lead2 from '../../modules/lumina/components/lead2/lead2';
import { Section } from '../../modules/lumina/components/section/section';
import { TextareaField } from '../../modules/lumina/components/textarea-field';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { useApplicationContext } from '../contexts/application-context';
import { SuccessAnimation } from '../success-animation/success-animation';
import tooltips from '../tooltips';

interface IUnsupportedTokensRecoveriesFormProps extends IBaseProps {}

interface IUnsupportedTokensRecoveriesFormValues {
  walletId: string;
  tokenAddress: string;
  recoveryAddress: string;
  credentialsType: 'passphrase' | 'prv';
  passphrase?: string;
  prv?: string;
  twofa: string;
}

function UnsupportedTokensRecoveriesForm(props: IUnsupportedTokensRecoveriesFormProps) {
  const { bitgoSDKOfflineWrapper } = useApplicationContext();
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const history = useHistory();
  const coin = bitgoSDKOfflineWrapper.bitgoSDK.getEnv() === 'prod' ? 'eth' : 'gteth';

  const UnsupportedTokensRecoveriesFormSchema = Yup.object().shape({
    walletId: Yup.string().required('Please enter a wallet ID'),
    tokenAddress: Yup.string().required('Please enter a token contract address'),
    recoveryAddress: Yup.string().required('Please enter a recovery address'),
    credentialsType: Yup.string().required('Please select a credential type'),
    // TODO(louis): need exact logic here
    passphrase: Yup.string().required('Please enter a your wallet password'),
    twofa: Yup.string().required('Please enter a your 2FA code'),
  });

  const handleSubmit = async (values: IUnsupportedTokensRecoveriesFormValues) => {
    try {
      await bitgoSDKOfflineWrapper.bitgoSDK.unlock({ otp: values.twofa });
      const wallet = await bitgoSDKOfflineWrapper.bitgoSDK.coin(coin).wallets().get({ id: values.walletId });
      await wallet.recoverToken({
        tokenContractAddress: values.tokenAddress,
        recipient: values.recoveryAddress,
        walletPassphrase: values.passphrase,
        prv: values.prv,
        broadcast: true,
      });
      setShowSuccess(true);
    } catch (error) {
      if (error.message === 'Insufficient balance.') {
        // this is terribly unhelpful
        error.message =
          'Token recovery requires a balance of ETH in the wallet - please send any amount of ETH to the wallet and retry.';
      } else if (error.message.includes('denied by policy')) {
        error.message =
          'Recovery denied by policy. Unsupported token recoveries require approval from a second admin on you wallet. Please use the BitGo website to add another admin to your wallet, then try again. If you have any questions, contact support@bitgo.com';
      }
      setValidationErrors([
        {
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: error.message,
        },
      ]);
    }
  };

  const formik = useFormik<IUnsupportedTokensRecoveriesFormValues>({
    initialValues: {
      walletId: undefined,
      tokenAddress: undefined,
      recoveryAddress: undefined,
      credentialsType: undefined,
      passphrase: undefined,
      prv: undefined,
      twofa: undefined,
    },
    validationSchema: UnsupportedTokensRecoveriesFormSchema,
    onSubmit: handleSubmit,
  });

  const { errors, values, submitCount, submitForm, isSubmitting, handleChange, touched, setFieldValue } = formik;

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
        schema={UnsupportedTokensRecoveriesFormSchema}
      >
        <div className="flex-grow-1 pv4 l-gpl l-gpr">
          <div className="mw7 center">
            <Lead2 mbx="mb3">Recover ERC20 tokens that are not officially supported by BitGo.</Lead2>

            <div className="mb4">
              <div className="pa3 ba b--border bg-almost-white flex br2">
                <Icon icon="warning-sign" className="mt1" />
                <div className="ml2 lh-copy">
                  Unsupported tokens may only be recovered from a wallet's base address. Please contact{' '}
                  <a className="pointer blue" href="mailto:support@bitgo.com">
                    support@bitgo.com
                  </a>{' '}
                  to send tokens from a wallet's receive address to its base address.
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
                      titleH5: 'Enter wallet information',
                      hideHeaderBorder: false,
                    }}
                  >
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: `${coin.toUpperCase()} Wallet ID`,
                      }}
                      inputProps={{
                        'data-testid': 'walletId',
                        error: touched.walletId ? errors.walletId : undefined,
                        name: 'walletId',
                        onChange: handleChange,
                        className: 'mb1',
                        value: values.walletId,
                        placeholder: 'Enter wallet ID...',
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.unsupportedToken.walletId}</HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: 'Token Contract Address',
                      }}
                      inputProps={{
                        'data-testid': 'tokenAddress',
                        error: touched.tokenAddress ? errors.tokenAddress : undefined,
                        name: 'tokenAddress',
                        onChange: handleChange,
                        className: 'mb1',
                        value: values.tokenAddress,
                        placeholder: 'Enter token address...',
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.unsupportedToken.tokenAddress}</HelpBlock>
                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: 'Destination Address',
                      }}
                      inputProps={{
                        'data-testid': 'recoveryAddress',
                        error: touched.recoveryAddress ? errors.recoveryAddress : undefined,
                        name: 'recoveryAddress',
                        onChange: handleChange,
                        className: 'mb1',
                        value: values.recoveryAddress,
                        placeholder: "Enter destination address..."
                      }}
                    />
                    <HelpBlock className="mb3">{tooltips.unsupportedToken.recoveryAddress}</HelpBlock>

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
                        <HelpBlock>{tooltips.unsupportedToken.passphrase}</HelpBlock>
                        <Collapse isOpen={values.credentialsType === 'passphrase'}>
                          <div className="overflow-hidden pt2">
                            <InputField
                              layout="vertical"
                              inputProps={{
                                'data-testid': 'passphrase',
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
                        <HelpBlock>{tooltips.unsupportedToken.prv}</HelpBlock>
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

                    <InputField
                      layout="vertical"
                      labelProps={{
                        labelText: '2FA Code',
                      }}
                      inputProps={{
                        'data-testid': 'twofa',
                        error: touched.twofa ? errors.twofa : undefined,
                        name: 'twofa',
                        onChange: handleChange,
                        className: 'mw4 mb3',
                        value: values.twofa,
                        placeholder: 'Enter 2FA...',
                      }}
                    />
                  </Section>
                </div>
                <Footer
                  className="bn"
                  isFlush
                  isVisible
                  isPrimaryButtonLoading={isSubmitting}
                  primaryButtonText="Recover Tokens"
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
                    The token recovery transaction has been signed and sent to BitGo. The transaction now requires
                    approval from another admin on your wallet. Please have another admin log in to the website and
                    approve the transaction. Note that the transaction will appear to have a value of 0 ETH because the
                    token is unsupported.
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

export default UnsupportedTokensRecoveriesForm;
