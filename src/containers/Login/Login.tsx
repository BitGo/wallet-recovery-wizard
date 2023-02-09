import { useParams } from 'react-router-dom';
import { useAlertBanner } from '~/contexts';
import { mapSdkErrorToAlert, safeEnv } from '~/helpers';
import { LoginForm } from './LoginForm';

export type LoginProps = {
  onSuccess: (username: string) => void | Promise<void>;
};

export function Login({ onSuccess }: LoginProps) {
  const { env, coin } = useParams<'env' | 'coin'>();
  const safeBitgoEnv = safeEnv(env);

  const [, setAlert] = useAlertBanner();
  return (
    <LoginForm
      env={safeBitgoEnv}
      onSubmit={async (values, { setSubmitting }) => {
        await window.commands.setBitGoEnvironment(safeBitgoEnv, coin);
        const { username, password, otp } = values;
        setAlert(undefined);
        setSubmitting(true);
        if (await window.queries.isSdkAuthenticated()) {
          await window.commands.logout();
        }
        const res = await window.commands.login(username, password, otp);
        if (res instanceof Error) {
          setAlert(mapSdkErrorToAlert(res.message));
        } else {
          await onSuccess(res.username);
        }
        setSubmitting(false);
      }}
    />
  );
}
