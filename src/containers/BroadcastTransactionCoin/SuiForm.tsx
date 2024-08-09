import { Form, FormikProvider, useFormik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { Button } from '~/components';
import { FormikFilefield } from '~/components/FormikFilefield';
import { useAlertBanner } from '~/contexts';
import { assert, safeEnv } from '~/helpers';
import {
  BroadcastTransactionResult,
  suiBroadcastTransactionParameters,
} from '~/utils/types';

function hasBroadcastableTransactions(
  json: unknown
): json is
  | suiBroadcastTransactionParameters {
  const data = json as
    | suiBroadcastTransactionParameters;
  return (
    data &&
    data.transactions &&
    data.transactions.length > 0
  );
}

export function SuiForm() {
  const { env, coin } = useParams<'env' | 'coin'>();
  const [, setAlert] = useAlertBanner();

  const environment = safeEnv(env);
  const navigate = useNavigate();
  const formik = useFormik<{ file?: File }>({
    initialValues: {
      file: undefined,
    },
    onSubmit: async (values, formikHelpers) => {
      if (values.file) {
        formikHelpers.setSubmitting(true);
        await window.commands.setBitGoEnvironment(environment);
        const fileReader = new FileReader();
        fileReader.readAsText(values.file, 'UTF-8');
        fileReader.onload = async event => {
          try {
            const data = JSON.parse(event.target?.result as string) as
              | suiBroadcastTransactionParameters;

            console.log(data);
            assert(hasBroadcastableTransactions(data), 'Broadcastable transactions not found');

            const chainData = await window.queries.getChain(coin!);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const broadcastResult: Error | BroadcastTransactionResult =
              await window.commands.broadcastTransaction(
                coin!,
                data
              );

            if (broadcastResult instanceof Error) {
              throw broadcastResult;
            }

            const showSaveDialogData = await window.commands.showSaveDialog({
              filters: [
                {
                  name: 'Custom File Type',
                  extensions: ['json'],
                },
              ],
              defaultPath: `~/${chainData}-broadcast-transaction-${Date.now()}.json`,
            });
            if (!showSaveDialogData.filePath) {
              throw new Error('No file path selected');
            }

            await window.commands.writeFile(
              showSaveDialogData.filePath,
              JSON.stringify(broadcastResult, null, 2),
              { encoding: 'utf8' }
            );
            navigate(
              `/${environment}/broadcast-transaction/${coin}/success`
            );
          } catch (error) {
            if (error instanceof Error) {
              formikHelpers.setFieldError('file', error.message);
              setAlert(error.message);
            } else {
              console.log(error);
            }
            formikHelpers.setSubmitting(false);
          }
        };
      } else {
        formikHelpers.setFieldError('file', 'File is required');
      }
    },
    validationSchema: Yup.object({
      file: Yup.mixed().required('File is required'),
    }).required(),
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-4">
          <FormikFilefield
            name="file"
            accept=".json"
            Width="fill"
            Label="Upload Broadcast Transaction(s)"
            onChange={event => {
              formik
                .setFieldValue('file', event.currentTarget.files?.[0])
                .catch(console.error);
            }}
          />
        </div>
        <Button
          Variant="primary"
          Width="fill"
          type="submit"
          Disabled={formik.isSubmitting || !formik.values.file}
          disabled={formik.isSubmitting || !formik.values.file}
        >
          Broadcast Transaction(s)
        </Button>
      </Form>
    </FormikProvider>
  );
}
