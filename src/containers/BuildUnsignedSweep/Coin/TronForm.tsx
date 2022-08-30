import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextarea, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
}).required();

export type TronFormProps = {
  onSubmit: (
    values: TronFormValues,
    formikHelpers: FormikHelpers<TronFormValues>
  ) => void | Promise<void>;
};

type TronFormValues = Yup.Asserts<typeof validationSchema>;

export function TronForm({ onSubmit }: TronFormProps) {
  const formik = useFormik<TronFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      recoveryDestination: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
            Label="Box A Value"
            name="userKey"
            placeholder='Enter the "A: User Key" from your BitGo keycard...'
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted backup key, as found on your BitGo recovery keycard."
            Label="Box B Value"
            name="backupKey"
            placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
            Label="Box C Value"
            name="bitgoKey"
            placeholder='Enter the "C: BitGo Public Key" from your BitGo keycard...'
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            placeholder="Enter your wallet password..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address your recovery transaction will send to."
            Label="Destination Address"
            name="recoveryDestination"
            placeholder="Enter destination address..."
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
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
