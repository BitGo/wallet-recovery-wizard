import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { SignPsbtForm, SignPsbtFormValues } from './SignPsbtForm';
import { FormikHelpers } from 'formik';

function safeEnv(env: string | undefined): 'test' | 'prod' {
  if (env === 'test' || env === 'prod') {
    return env;
  }
  throw new Error('Invalid environment');
}

export default function SignPsbt() {
  const navigate = useNavigate();
  const { env: envParam } = useParams<{ env: string }>();
  const [error, setError] = useState<string | null>(null);

  let env: 'test' | 'prod';
  try {
    env = safeEnv(envParam);
  } catch {
    return <div className="tw-text-red-500">Invalid environment</div>;
  }

  async function onSubmit(
    values: SignPsbtFormValues,
    formikHelpers: FormikHelpers<SignPsbtFormValues>
  ) {
    try {
      setError(null);

      await window.commands.setBitGoEnvironment(env, values.coin);

      const result = await window.commands.signPsbt(values.coin, {
        psbt: values.psbt,
        userKey: values.userKey.trim(),
        walletPassphrase: values.walletPassphrase,
        recipientAddress: values.recipientAddress,
        feeRateSatVB: Number(values.feeRateSatVB),
      });

      const defaultFilename = `${values.coin}-half-signed-psbt-${Date.now()}.json`;
      const { filePath } = await window.commands.showSaveDialog({
        defaultPath: defaultFilename,
      });

      if (!filePath) {
        setError('No file selected');
        return;
      }

      await window.commands.writeFile(filePath, JSON.stringify(result, null, 2), {
        encoding: 'utf-8',
      });

      navigate(`/${env}/sign-psbt/success`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      formikHelpers.setSubmitting(false);
    }
  }

  return (
    <div className="tw-max-w-2xl tw-mx-auto">
      {error && (
        <div className="tw-mb-4 tw-p-4 tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-rounded">
          {error}
        </div>
      )}
      <SignPsbtForm onSubmit={onSubmit} />
    </div>
  );
}
