import * as Yup from 'yup';
import { useFormik, Form, FormikProvider, FormikHelpers } from 'formik';
import {
  Button,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  userKeyID: Yup.string(),
  backupKey: Yup.string().required(),
  backupKeyID: Yup.string(),
  bitgoKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.string().required(),
});

export type BitcoinFormProps = {
  onSubmit: (
    values: BitcoinFormValues,
    formikHelpers: FormikHelpers<BitcoinFormValues>
  ) => void | Promise<void>;
};

type BitcoinFormValues = {
  userKey: string;
  userKeyID: string;
  backupKey: string;
  backupKeyID: string;
  bitgoKey: string;
  recoveryDestination: string;
  scan: string;
};

export function BitcoinForm({ onSubmit }: BitcoinFormProps) {
  const formik = useFormik<BitcoinFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      userKeyID: '',
      backupKey: '',
      backupKeyID: '',
      bitgoKey: '',
      recoveryDestination: '',
      scan: '20',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-6">
          <Notice
            Variant="Secondary"
            IconLeft={<Icon Name="warning-sign" Size="small" />}
          >
            Bitcoin transactions are replayable. Please make sure you are the
            owner of the Destination Address to avoid accidentally sending your
            Bitcoin to an address you do not own.
          </Notice>
        </div>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            name="userKey"
            Label="User Public Key"
            HelperText="Your user public key, as found on your BitGo recovery keycard."
            placeholder='Enter the "Provided User Key" from your BitGo keycard...'
            rows={4}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="userKeyID"
            Label="User Key ID (optional)"
            HelperText="Your user Key ID as found on your BitGo recovery keycard. Most wallets will not have this and you can leave it blank."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            name="backupKey"
            Label="Backup Public Key"
            HelperText="The backup public key for the wallet, as found on your BitGo recovery keycard."
            placeholder='Enter the "Backup Key" from your BitGo keycard...'
            rows={2}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="backupKeyID"
            Width="fill"
            Label="Backup Key ID (optional)"
            HelperText="Your backup Key ID, as found on your BitGo recovery keycard. Most wallets will not have this and you can leave it blank."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="bitgoKey"
            Width="fill"
            Label="BitGo Public Key"
            HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
            placeholder='Enter the "BitGo Public Key" from your BitGo keycard...'
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="recoveryDestination"
            Label="Destination Address"
            HelperText="The address your transaction will be sent to."
            placeholder="Enter destination address..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="scan"
            Label="Address Scanning Factor"
            HelperText="The amount of addresses without transactions to scan before stopping the tool."
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
