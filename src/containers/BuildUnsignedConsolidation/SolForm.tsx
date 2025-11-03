import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';
import { getWalletTypeLabels, WalletType } from './useWalletTypeLabels';
import { WalletTypeSelector } from './WalletTypeSelector';

const getValidationSchema = (walletType: WalletType) => Yup.object({
  walletType: Yup.string().oneOf(['cold', 'hot']).required(),
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: walletType === 'hot' ? Yup.string().required() : Yup.string(),
  apiKey: Yup.string().test(
      'not-url-or-alchemy', 
      'API key should not be a URL', 
      (value) => {
        if (!value) return true; // Skip validation if empty
        // Check it doesn't start with http:// or https:// and doesn't contain the word "alchemy"
        return !value.match(/^https?:\/\//i) && !value.toLowerCase().includes('alchemy');
      }
    ),
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

export type SolFormValues = Yup.Asserts<ReturnType<typeof getValidationSchema>>;

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
      walletType: 'cold' as WalletType,
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      apiKey: '',
      durableNonces: {
        publicKeys: '',
        secretKey: '',
      },
      startingScanIndex: 1,
      endingScanIndex: 21,
      seed: undefined,
    },
    validate: (values) => {
      try {
        getValidationSchema(values.walletType as WalletType).validateSync(values, { abortEarly: false });
        return {};
      } catch (error: any) {
        const errors: Record<string, string> = {};
        error.inner?.forEach((err: any) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        return errors;
      }
    },
  });

  const {
    userKeyLabel,
    userKeyHelperText,
    backupKeyLabel,
    backupKeyHelperText,
    bitgoKeyLabel,
    bitgoKeyHelperText,
    showWalletPassphrase,
  } = getWalletTypeLabels(formik.values.walletType as WalletType);

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold or Hot wallet details
        </h4>
        <WalletTypeSelector />
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={userKeyHelperText}
            Label={userKeyLabel}
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
            HelperText={backupKeyHelperText}
            Label={backupKeyLabel}
            name="backupKey"
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
            HelperText={bitgoKeyHelperText}
            Label={bitgoKeyLabel}
            name="bitgoKey"
            Width="fill"
          />
        </div>
        {showWalletPassphrase && (
          <div className="tw-mb-4">
            <FormikPasswordfield
              HelperText="The wallet passphrase that you set when creating the wallet."
              Label="Wallet Passphrase"
              name="walletPassphrase"
              Width="fill"
            />
          </div>
        )}
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
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An API Key Token from alchemy.com"
            Label="API Key (optional)"
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
            {formik.isSubmitting ? 'Consolidating...' : 'Consolidate Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
