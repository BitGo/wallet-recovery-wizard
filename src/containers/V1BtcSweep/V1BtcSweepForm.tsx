import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikPasswordfield, FormikTextfield } from '~/components';
import { FormikFilefield } from "~/components/FormikFilefield";

const validationSchema = Yup.object({
  walletId: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  unspents: Yup.mixed().required(),
  destinationAddress: Yup.string().required(),
  encryptedUserKey: Yup.string().required(),
  otp: Yup.string().required(),
}).required();

export type V1BtcSweepFormProps = {
  onSubmit: (
    values: V1BtcSweepFormValues,
    formikHelpers: FormikHelpers<V1BtcSweepFormValues>
  ) => void | Promise<void>;
};

type V1BtcSweepFormValues = Yup.Asserts<typeof validationSchema>;

export function V1BtcSweepForm({onSubmit}: V1BtcSweepFormProps) {
  const formik = useFormik<V1BtcSweepFormValues>({
    onSubmit,
    initialValues: {
      walletId: '',
      walletPassphrase: '',
      unspents: undefined,
      destinationAddress: '',
      encryptedUserKey: '',
      otp: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`This is the wallet ID of the wallet from where to sweep.`}
            Label="Wallet ID"
            name="walletId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikPasswordfield
            HelperText={`The wallet passphrase of the wallet from where to sweep.`}
            Label="Wallet Passphrase"
            name="walletPassphrase"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`The encrypted user private key for the wallet.`}
            Label="Encrypted User Private Key"
            name="encryptedUserKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`The address your sweep transaction will send to.`}
            Label="Destination Address"
            name="destinationAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikFilefield
            name="tx"
            accept=".json"
            Width="fill"
            Label="Upload unspents file"
            onChange={event => {
              formik
                .setFieldValue('unspents', event.currentTarget.files?.[0])
                .catch(console.error);
            }}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`2FA`}
            Label="2FA Code"
            name="otp"
            Width="fill"
          />
        </div>

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
            {formik.isSubmitting ? 'Sweeping...' : 'Sweep Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
