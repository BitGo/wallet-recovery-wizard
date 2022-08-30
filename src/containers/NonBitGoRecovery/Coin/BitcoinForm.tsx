import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  recoveryDestination: Yup.string().required(),
  scan: Yup.number().required(),
  userKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
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
      backupKey: '',
      bitgoKey: '',
      krsProvider: '',
      recoveryDestination: '',
      scan: 20,
      userKey: '',
      walletPassphrase: '',
    },
    validationSchema,
  });

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your BitGo recovery keycard.'
      : 'The backup public key for the wallet, as found on your BitGo recovery keycard.';

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
          Self-managed hot wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikSelectfield
            HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
            Label="Key Recovery Service"
            name="krsProvider"
            Width="fill"
          >
            <option value="">None</option>
            <option value="keyternal">Keyternal</option>
            <option value="bitgoKRSv2">BitGo KRS</option>
            <option value="dai">Coincover</option>
          </FormikSelectfield>
        </div>
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
          <FormikTextarea
            HelperText={backupKeyHelperText}
            Label="Backup Public Key"
            name="backupKey"
            placeholder='Enter the "Backup Key" from your BitGo keycard...'
            rows={2}
            Width="fill"
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
