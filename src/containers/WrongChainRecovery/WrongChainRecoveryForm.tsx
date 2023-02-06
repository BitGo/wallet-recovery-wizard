import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  signTransaction: Yup.bool().default(false).required(),
  walletId: Yup.string().required(),
  transactionId: Yup.string().required(),
  destinationAddress: Yup.string().required(),
  walletPassphrase: Yup.string().when(['signTransaction', 'privateKey'], {
    is: (signTransaction: boolean, privateKey?: string) => {
      return signTransaction && !privateKey;
    },
    then: Yup.string().optional(),
  }),
  privateKey: Yup.string().optional(),
  apiKey: Yup.string().optional(),
}).required();

export type WrongChainRecoveryFormProps = {
  onSubmit: (
    vavalues: WrongChainRecoveryFormValues,
    formikHelpers: FormikHelpers<WrongChainRecoveryFormValues>
  ) => void | Promise<void>;
  sourceCoin: string;
  destinationCoin: string;
  apiProvider?: 'Block Chair';
};

type WrongChainRecoveryFormValues = Yup.Asserts<typeof validationSchema>;

export function WrongChainRecoveryForm({
  onSubmit,
  sourceCoin,
  destinationCoin,
  apiProvider,
}: WrongChainRecoveryFormProps) {
  const formik = useFormik<WrongChainRecoveryFormValues>({
    onSubmit,
    initialValues: {
      signTransaction: false,
      walletId: '',
      transactionId: '',
      destinationAddress: '',
      walletPassphrase: '',
      privateKey: '',
      apiKey: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`This is the wallet ID of the wallet that received the source coin. This should be a ${destinationCoin} wallet.`}
            Label="Wallet ID"
            name="walletId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`The transaction ID of the transactions that sent ${sourceCoin} to the wrong address.`}
            Label="Transaction ID"
            name="transactionId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`The address the source coin was mistakenly sent to. This should be a ${sourceCoin} address.`}
            Label="Destination Address"
            name="destinationAddress"
            Width="fill"
          />
        </div>
        {apiProvider && (
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText={`An API key for ${apiProvider}. This is needed to query for unspents from the source coin transaction`}
              Label="Api Key"
              name="apiKey"
              Width="fill"
            />
          </div>
        )}
        <div className="tw-mb-4">
          <label className="tw-text-label-1">
            <Field
              label="Sign Transaction"
              type="checkbox"
              name="signTransaction"
            />
            &nbsp; Sign Transaction
          </label>
          <div className="tw-mt-1 tw-text-gray-700 tw-text-label-2">
            {`Produce a signed transaction`}
          </div>
        </div>
        {formik.values.signTransaction && (
          <>
            <div className="tw-mb-4">
              <FormikTextfield
                HelperText={`The wallet passphrase of the ${destinationCoin} wallet that received the source coin. You can leave this blank if you know the private key.`}
                Label="Wallet Passphrase"
                type="password"
                name="walletPassphrase"
                Width="fill"
              />
            </div>
            <div className="tw-mb-4">
              <FormikTextfield
                HelperText={`The private key (xprv) for the ${destinationCoin}} wallet that received the source coin. If you have your wallet passphrase, you don't need this.`}
                Label="Private Key"
                name="privateKey"
                Width="fill"
              />
            </div>
          </>
        )}

        <div className="tw-flex tw-flex-col-reverse sm:tw-justify-between sm:tw-flex-row tw-gap-1 tw-mt-4">
          <Button Tag={Link} to="/" Variant="secondary" Width="hug">
            Cancel
          </Button>
          <Button
            Variant="primary"
            Width="hug"
            type="submit"
            Disabled={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
