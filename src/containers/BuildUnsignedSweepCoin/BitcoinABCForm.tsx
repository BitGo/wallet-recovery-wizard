import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield, Icon, Notice } from '~/components';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  bitgoKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.number().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
}).required();

export type BitcoinABCFormProps = {
  onSubmit: (
    values: BitcoinABCFormValues,
    formikHelpers: FormikHelpers<BitcoinABCFormValues>
  ) => void | Promise<void>;
};

type BitcoinABCFormValues = Yup.Asserts<typeof validationSchema>;

export function BitcoinABCForm({ onSubmit }: BitcoinABCFormProps) {
  const formik = useFormik<BitcoinABCFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      backupKey: '',
      backupKeyId: '',
      bitgoKey: '',
      recoveryDestination: '',
      scan: 20,
      userKey: '',
      userKeyId: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-8">
          <Notice
            Variant="Secondary"
            IconLeft={<Icon Name="warning-sign" Size="small" />}
          >
            BCHA (aka XEC) transactions are replayable on Bitcoin Cash. Please
            make sure you are the owner of the Destination Address to avoid
            accidentally sending your XEC to an address you do not own.
          </Notice>
        </div>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user public key, as found on your recovery KeyCard."
            Label="User Public Key"
            name="userKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user Key ID, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="User Key ID (optional)"
            name="userKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The backup public key for the wallet, as found on your recovery KeyCard."
            Label="Backup Public Key"
            name="backupKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your backup Key ID, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Backup Key ID (optional)"
            name="backupKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard."
            Label="BitGo Public Key"
            name="bitgoKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address your recovery transaction will send to."
            Label="Destination Address"
            name="recoveryDestination"
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
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An Api-Key Token from blockchair.com required for mainnet recoveries of this coin."
            Label="API Key"
            name="apiKey"
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
