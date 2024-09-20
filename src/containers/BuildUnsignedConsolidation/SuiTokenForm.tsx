import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  packageId: Yup.string().required(),
  walletPassphrase: Yup.string(),
  startingScanIndex: Yup.number(),
  endingScanIndex: Yup.number().moreThan(
    Yup.ref('startingScanIndex'),
    'Ending scan index must be greater than starting scan index'
  ),
  seed: Yup.string(),
}).required();

export type SuiFormValues = Yup.Asserts<typeof validationSchema>;

export type SuiTokenFormValues = {
  onSubmit: (
    values: SuiFormValues,
    formikHelpers: FormikHelpers<SuiFormValues>
  ) => void | Promise<void>;
};

export function SuiTokenForm({ onSubmit }: SuiTokenFormValues) {
  const formik = useFormik<SuiFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      packageId: '',
      walletPassphrase: '',
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
            HelperText="Your user public key, as found on your recovery KeyCard. Required for hot wallets."
            Label="User Public Key (optional)"
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
            HelperText="The backup public key for the wallet, as found on your recovery KeyCard. Required for hot wallets."
            Label="Backup Public Key (optional)"
            name="backupKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikPasswordfield
            HelperText="Your wallet passphrase, required for hot wallets."
            Label="Wallet Passphrase (optional)"
            name="walletPassphrase"
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
            HelperText="The package ID of the SUI token to recover. This is unique to each token, and is NOT your wallet address."
            Label="Package Id"
            name="packageId"
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
