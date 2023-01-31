import { useParams } from 'react-router-dom';
import { useAlertBanner } from '~/contexts';
import { mapLoginError, safeEnv } from '~/helpers';
import { LoginForm } from './LoginForm';

export type LoginFormProps = {
  onSuccess: (username: string) => void | Promise<void>;
};

export function Login({ onSuccess }: LoginFormProps) {
  const { env, coin } = useParams<'env' | 'coin'>();
  const bitGoEnvironment = safeEnv(env);

  const [, setAlert] = useAlertBanner();
  return (
    <LoginForm
      onSubmit={async (values, { setSubmitting }) => {
        await window.commands.setBitGoEnvironment(bitGoEnvironment, coin);
        const { username, password, otp } = values;
        setAlert(undefined);
        setSubmitting(true);
        if (await window.queries.isSdkAuthenticated()) {
          await window.commands.logout();
        }
        const res = await window.commands.login(username, password, otp);
        if (res instanceof Error) {
          setAlert(mapLoginError(res.message));
        } else {
          await onSuccess(res.username);
        }
        setSubmitting(false);
      }}
    />
  );
}
