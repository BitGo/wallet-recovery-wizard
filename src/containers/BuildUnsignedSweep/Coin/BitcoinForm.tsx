import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  bitgoKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.number().required(),
}).required();

export type BitcoinFormProps = {
  onSubmit: (
    values: BitcoinFormValues,
    formikHelpers: FormikHelpers<BitcoinFormValues>
  ) => void | Promise<void>;
};

type BitcoinFormValues = Yup.Asserts<typeof validationSchema>;

export function BitcoinForm({ onSubmit }: BitcoinFormProps) {
  const formik = useFormik<BitcoinFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      userKeyId: '',
      backupKey: '',
      backupKeyId: '',
      bitgoKey: '',
      recoveryDestination: '',
      scan: 20,
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
            HelperText="Your user public key, as found on your BitGo recovery keycard."
            Label="User Public Key"
            name="userKey"
            placeholder='Enter the "Provided User Key" from your BitGo keycard...'
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user Key ID as found on your BitGo recovery keycard. Most wallets will not have this and you can leave it blank."
            Label="User Key Id (optional)"
            name="userKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The backup public key for the wallet, as found on your BitGo recovery keycard."
            Label="Backup Public Key"
            name="backupKey"
            placeholder='Enter the "Backup Key" from your BitGo keycard...'
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="backupKeyId"
            Width="fill"
            Label="Backup Key Id (optional)"
            HelperText="Your backup Key ID, as found on your BitGo recovery keycard. Most wallets will not have this and you can leave it blank."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
            Label="BitGo Public Key"
            name="bitgoKey"
            placeholder='Enter the "BitGo Public Key" from your BitGo keycard...'
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address your transaction will be sent to."
            Label="Destination Address"
            name="recoveryDestination"
            placeholder="Enter destination address..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The amount of addresses without transactions to scan before stopping the tool."
            Label="Address Scanning Factor"
            name="scan"
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
