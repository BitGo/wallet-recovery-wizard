import { useNavigate, useParams } from 'react-router-dom';
import { FormikFilefield } from '~/components/FormikFilefield';
import { Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '~/components';
import type {
  BroadcastableSweepTransaction,
  createAdaBroadcastableSweepTransactionParameters,
  createDotBroadcastableSweepTransactionParameters,
  createSolBroadcastableSweepTransactionParameters,
} from '~/utils/types';
import { assert, safeEnv } from '~/helpers';
import { useAlertBanner } from '~/contexts';

function isBroadcastableTransaction(
  json: unknown
): json is BroadcastableSweepTransaction {
  const broadcastableTransaction = json as BroadcastableSweepTransaction;
  return (
    broadcastableTransaction &&
    broadcastableTransaction.length !== undefined &&
    broadcastableTransaction.length > 0 &&
    broadcastableTransaction[0].serializedTx !== undefined
  );
}

function isSignedTransaction(
  json: unknown
): json is
  | createAdaBroadcastableSweepTransactionParameters
  | createDotBroadcastableSweepTransactionParameters
  | createSolBroadcastableSweepTransactionParameters {
  const signedTransaction = json as
    | createAdaBroadcastableSweepTransactionParameters
    | createDotBroadcastableSweepTransactionParameters
    | createSolBroadcastableSweepTransactionParameters;
  return (
    signedTransaction &&
    signedTransaction.signatureShares !== undefined &&
    signedTransaction.signatureShares.length > 0
  );
}

export function CreateBroadcastableTransactionIndex() {
  const { env } = useParams<{ env: string }>();
  const [, setAlert] = useAlertBanner();

  const environment = safeEnv(env);
  const navigate = useNavigate();
  const formik = useFormik<{ tx?: File }>({
    initialValues: {
      tx: undefined,
    },
    onSubmit: async (values, formikHelpers) => {
      if (values.tx) {
        formikHelpers.setSubmitting(true);
        await window.commands.setBitGoEnvironment(environment);
        const fileReader = new FileReader();
        fileReader.readAsText(values.tx, 'UTF-8');
        fileReader.onload = async event => {
          try {
            const tx = JSON.parse(event.target?.result as string) as
              | createAdaBroadcastableSweepTransactionParameters
              | createDotBroadcastableSweepTransactionParameters
              | createSolBroadcastableSweepTransactionParameters;

            assert(isSignedTransaction(tx), 'Signed transaction not found');

            const coin = tx.signatureShares[0].txRequest.walletCoin;
            const chainData = await window.queries.getChain(coin);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const broadcastTx: Error | BroadcastableSweepTransaction =
              await window.commands.createBroadcastableSweepTransaction(
                coin,
                tx
              );

            assert(
              isBroadcastableTransaction(broadcastTx),
              'Broadcastable transaction not found'
            );

            if (broadcastTx instanceof Error) {
              throw broadcastTx;
            }

            const showSaveDialogData = await window.commands.showSaveDialog({
              filters: [
                {
                  name: 'Custom File Type',
                  extensions: ['json'],
                },
              ],
              defaultPath: `~/${chainData}-broadcastable-mpc-tx-${Date.now()}.json`,
            });
            if (!showSaveDialogData.filePath) {
              throw new Error('No file path selected');
            }

            await window.commands.writeFile(
              showSaveDialogData.filePath,
              JSON.stringify(broadcastTx, null, 2),
              { encoding: 'utf8' }
            );
            navigate(
              `/${environment}/create-broadcastable-transaction/${coin}/success`
            );
          } catch (error) {
            if (error instanceof Error) {
              formikHelpers.setFieldError('tx', error.message);
              setAlert(error.message);
            } else {
              console.log(error);
            }
            formikHelpers.setSubmitting(false);
          }
        };
      } else {
        formikHelpers.setFieldError('tx', 'File is required');
      }
    },
    validationSchema: Yup.object({
      tx: Yup.mixed().required('File is required'),
    }).required(),
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-4">
          <FormikFilefield
            name="tx"
            accept=".json"
            Width="fill"
            Label="Upload Signed Transaction"
            onChange={event => {
              formik
                .setFieldValue('tx', event.currentTarget.files?.[0])
                .catch(console.error);
            }}
          />
        </div>
        <Button
          Variant="primary"
          Width="fill"
          type="submit"
          Disabled={formik.isSubmitting || !formik.values.tx}
          disabled={formik.isSubmitting || !formik.values.tx}
        >
          Create Transaction
        </Button>
      </Form>
    </FormikProvider>
  );
}
