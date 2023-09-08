import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Button, FormikTextarea, FormikTextfield } from '~/components';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  userKey: Yup.string(),
  backupKey: Yup.string(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string(),
  durableNonces: Yup.object({
    // TODO: Figure out how to transform this into a string array via Yup
    publicKeys: Yup.string().required(),
    secretKey: Yup.string().required(),
  }).required(),
  startingScanIndex: Yup.number(),
  endingScanIndex: Yup.number().moreThan(
    Yup.ref('startingScanIndex'),
    'Ending scan index must be greater than starting scan index'
  ),
  seed: Yup.string(),
}).required();

export type SolFormValues = Yup.Asserts<typeof validationSchema>;

export type SolFormProps = {
  onSubmit: (
    values: SolFormValues,
    formikHelpers: FormikHelpers<SolFormValues>
  ) => void | Promise<void>;
};

export function SolForm({ onSubmit }: SolFormProps) {
  const formik = useFormik<SolFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      durableNonces: {
        publicKeys: '',
        secretKey: '',
      },
      startingScanIndex: 1,
      endingScanIndex: 21,
      seed: undefined,
    },
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold or Hot wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your user public key, as found on your recovery KeyCard."
            Label="User Public Key"
            name="userKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user seed as found on your KeyCard as Key ID. Most wallets will not have this and you can leave it blank."
            Label="Seed (optional)"
            name="seed"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The backup public key for the wallet, as found on your recovery KeyCard."
            Label="Backup Public Key"
            name="backupKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your wallet passphrase, required for hot wallets."
            Label="Wallet Passphrase (optional)"
            name="walletPassphrase"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Public Keys for your durable Nonces"
            Label="Public Keys (comma separated)"
            name="durableNonces.publicKeys"
            Width="fill"
            value={formik.values.durableNonces.publicKeys}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Secret Key for your durable Nonces"
            Label="Secret Key"
            name="durableNonces.secretKey"
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
            HelperText="The starting index (inclusive) of addresses to consolidate"
            Label="Starting Scan Index"
            name="startingScanIndex"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The ending index (exclusive) of addresses to consolidate"
            Label="Ending Scan Index"
            name="endingScanIndex"
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
            {formik.isSubmitting ? 'Consolidating...' : 'Consolidate Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
