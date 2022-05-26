import { NetworkType } from '@bitgo/statics';
import { Dialog, Tab, Tabs } from '@blueprintjs/core';
import { shell } from 'electron';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { accessTokenStorageName, sessionStorageName, userStorageName } from '../../app';
import { useApplicationContext } from '../../components/contexts/application-context';
import { Button, IButtonProps } from '../../modules/lumina/components/button/button';
import ConfirmationDialog from '../../modules/lumina/components/confirmation-dialog/confirmation-dialog';
import { Footer } from '../../modules/lumina/components/footer/footer';
import { H7 } from '../../modules/lumina/components/H7/h7';
import { InputField } from '../../modules/lumina/components/input-field/input-field';
import { ValidationBanner } from '../../modules/lumina/components/validation-banner/validation-banner';
import { BitgoBackendErrorCode } from '../../modules/lumina/errors/bitgo-backend-errors';
import { IValidationError } from '../../modules/lumina/errors/types';
import { BitgoError } from '../../pkg/bitgo/bitgo-sdk-offline-wrapper';
import './_log-in-button.scss';

interface LogInFormValues {
  email: string;
  accessToken?: string;
  password?: string;
  otp?: string;
}

interface LogInButton {
  buttonProps?: IButtonProps;
}

function LogInButton({ buttonProps = {} }: LogInButton) {
  const { bitgoSDKOfflineWrapper, setSession, session, network, setUser } = useApplicationContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [useAccessToken, setUseAccessToken] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<IValidationError[]>(null);

  const LogInFormSchema = Yup.object().shape({
    email: Yup.string(),
    accessToken: Yup.string(),
    password: Yup.string(),
    otp: Yup.string(),
  });

  const handleSubmit = async (values: LogInFormValues) => {
    try {
      bitgoSDKOfflineWrapper.bitgoSDK.clear();
      let accessToken = values.accessToken
      if (useAccessToken) {
        bitgoSDKOfflineWrapper.bitgoSDK.authenticateWithAccessToken({
          accessToken: values.accessToken,
        });
      } else {
        const authResponse = await bitgoSDKOfflineWrapper.bitgoSDK.authenticate({
          username: values.email,
          password: values.password,
          otp: values.otp,
        });
        accessToken = authResponse.access_token;
      }
      const session = await bitgoSDKOfflineWrapper.bitgoSDK.session();
      const me = await bitgoSDKOfflineWrapper.bitgoSDK.me();

      window.sessionStorage.setItem(sessionStorageName, JSON.stringify(session));
      window.sessionStorage.setItem(userStorageName, JSON.stringify(me));
      window.sessionStorage.setItem(accessTokenStorageName, JSON.stringify(accessToken));

      setSession(session);
      setUser(me);

      handleClose();
      // TODO(louis): is this needed?
      // bitgoSDKOfflineWrapper.bitgoSDK.sessionInfo = authResponse;
    } catch (error) {
      const bitgoError = error as BitgoError;
      setValidationErrors([
        {
          // TODO(louis): check with peter if this error is API specific or wraps bitgojs error
          code: BitgoBackendErrorCode.INVALID_ARGUMENT,
          path: [],
          message: bitgoError.message,
        },
      ]);
    }
  };

  const handleClose = () => {
    setValidationErrors(null);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleLogOut = async () => {
    bitgoSDKOfflineWrapper.endUserSession(() => {
      setSession(null);
      setUser(null);
    })
  };

  const formik = useFormik<LogInFormValues>({
    initialValues: {
      email: undefined,
      password: undefined,
      otp: undefined,
    },
    validationSchema: LogInFormSchema,
    onSubmit: handleSubmit,
  });

  const { submitCount, errors, values, submitForm, isSubmitting, handleChange, handleBlur, resetForm } = formik;

  const handleToggleIsConfirmationDialogOpen = () => {
    setIsConfirmationDialogOpen(!isConfirmationDialogOpen);
  };

  const renderForgotPassword = (
    <Button
      className="l-logIn-forgotPassword"
      minimal
      small
      onClick={() => [
        shell.openExternal(
          `https://app.bitgo${network === NetworkType.MAINNET ? '' : '-test'}.com/auth/recover-password`
        ),
      ]}
    >
      Forgot?
    </Button>
  );

  return (
    <>
      {session ? (
        <>
          <a
            {...buttonProps}
            onClick={() => {
              handleToggleIsConfirmationDialogOpen();
            }}
          >
            Log out &rarr;
          </a>
        </>
      ) : (
        <>
          <Button
            {...buttonProps}
            intent="primary"
            onClick={() => {
              setIsDialogOpen(!isDialogOpen);
            }}
          >
            Log in to {`bitgo${network === NetworkType.MAINNET ? '' : '-test'}.com`} &rarr;
          </Button>
        </>
      )}

      <Dialog
        isOpen={isDialogOpen}
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        onClose={() => setIsDialogOpen(false)}
        className="bp3-dialog--w0"
        title={
          <React.Fragment>
            <ValidationBanner
              errors={validationErrors}
              formikErrors={errors}
              hasSubmitted={submitCount > 0}
              size="m"
              className="l-validationBanner--dialogHeader"
            />
            Log in to {`bitgo${network === NetworkType.MAINNET ? '' : '-test'}.com`}
          </React.Fragment>
        }
      >
        <div className="ph4 pt2 pb3 lh-copy">
          <Tabs
            className="l-cardTabs l-cardTabs--h7"
            renderActiveTabPanelOnly={true}
            onChange={(newTabID) => {
              setUseAccessToken(newTabID === 'access-token' ? true : false);
            }}
          >
            <Tab
              id="credentials"
              title={<H7 mbx="">BitGo Credentials</H7>}
              panel={
                <div className="w-100 flex-grow-1 pt3">
                  <div className="mb3">
                    <InputField
                      layout="vertical"
                      inputProps={{
                        'data-testid': 'email',
                        className: 'l-logInForm-email',
                        large: true,
                        onBlur: handleBlur,
                        name: 'email',
                        onChange: handleChange,
                        placeholder: 'Email',
                        error: submitCount > 0 && errors.email ? errors.email : null,
                        value: values.email,
                        tabIndex: 1,
                      }}
                    />
                    <InputField
                      layout="vertical"
                      inputProps={{
                        'data-testid': 'password',
                        className: 'l-logInForm-password',
                        large: true,
                        onBlur: handleBlur,
                        name: 'password',
                        onChange: handleChange,
                        rightElement: renderForgotPassword,
                        placeholder: 'Password',
                        error: submitCount > 0 && errors.password ? errors.password : null,
                        value: values.password,
                        type: 'password',
                        tabIndex: 2,
                      }}
                    />
                  </div>
                  <InputField
                    layout="vertical"
                    inputProps={{
                      'data-testid': 'otp',
                      large: true,
                      onBlur: handleBlur,
                      name: 'otp',
                      onChange: handleChange,
                      placeholder: 'OTP',
                      error: submitCount > 0 && errors.otp ? errors.otp : null,
                      value: values.otp,
                      tabIndex: 3,
                    }}
                  />
                </div>
              }
            />
            <Tab
              id="access-token"
              title={<H7 mbx="">Access Token</H7>}
              panel={
                <div className="w-100 flex-grow-1 pt3">
                  <InputField
                    layout="vertical"
                    inputProps={{
                      'data-testid': 'access-code',
                      autoFocus: true,
                      className: 'bp3-large',
                      name: 'accessToken',
                      onChange: handleChange,
                      placeholder: 'Enter your access code...',
                      error: submitCount > 0 && errors.accessToken ? errors.accessToken : null,
                      value: values.accessToken,
                      tabIndex: 1,
                    }}
                  />
                </div>
              }
            />
          </Tabs>
        </div>
        <Footer
          isVisible
          primaryButtonText="Log in"
          onCancelButtonClick={handleClose}
          onPrimaryButtonClick={submitForm}
          isPrimaryButtonLoading={isSubmitting}
        />
      </Dialog>

      <ConfirmationDialog
        confirmationTitle="Log out"
        confirmationText="Are you sure you want to log out?"
        primaryButtonText="Log out"
        primaryButtonClassName="bp3-intent-danger"
        secondaryButtonText="Cancel"
        isOpen={isConfirmationDialogOpen}
        onClose={handleToggleIsConfirmationDialogOpen}
        onPrimaryClicked={handleLogOut}
      />
    </>
  );
}

export default LogInButton;
