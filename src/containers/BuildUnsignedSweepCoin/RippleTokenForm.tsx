import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  recoveryDestination: Yup.string().required(),
  rootAddress: Yup.string().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  issuerAddress: Yup.string().required(),
  currencyCode: Yup.string().required(),
}).required();

export type RippleTokenFormProps = {
  onSubmit: (
    values: RippleTokenFormValues,
    formikHelpers: FormikHelpers<RippleTokenFormValues>
  ) => void | Promise<void>;
};

type RippleTokenFormValues = Yup.Asserts<typeof validationSchema>;

export function RippleTokenForm({ onSubmit }: RippleTokenFormProps) {
  const formik = useFormik<RippleTokenFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      backupKeyId: '',
      recoveryDestination: '',
      rootAddress: '',
      userKey: '',
      userKeyId: '',
      issuerAddress: '',
      currencyCode: '',
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
            HelperText="The root address of the wallet."
            Label="Root Address"
            name="rootAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The issuer address of the token."
            Label="Token Issuer Address"
            name="issuerAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Token Currency Code"
            Label="Token Currency Code"
            name="currencyCode"
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
