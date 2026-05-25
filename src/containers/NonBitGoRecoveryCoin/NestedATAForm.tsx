import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  nestedAtaAddress: Yup.string().required(),
  ownerAtaAddress: Yup.string().required(),
  tokenMintAddress: Yup.string().required(),
  apiKey: Yup.string().test(
    'not-url-or-alchemy',
    'API key should not be a URL',
    (value) => {
      if (!value) return true;
      return !value.match(/^https?:\/\//i) && !value.toLowerCase().includes('alchemy');
    }
  ),
}).required();

export type NestedATAFormProps = {
  onSubmit: (
    values: NestedATAFormValues,
    formikHelpers: FormikHelpers<NestedATAFormValues>
  ) => void | Promise<void>;
};

type NestedATAFormValues = Yup.Asserts<typeof validationSchema>;

export function NestedATAForm({ onSubmit }: NestedATAFormProps) {
  const formik = useFormik<NestedATAFormValues>({
    onSubmit,
    initialValues: {
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      recoveryDestination: '',
      nestedAtaAddress: '',
      ownerAtaAddress: '',
      tokenMintAddress: '',
      apiKey: '',
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
            This flow recovers tokens stuck in a nested Associated Token Account
            (an ATA whose owner is another ATA). The transaction will be signed
            and broadcast immediately.
          </Notice>
        </div>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Wallet KeyCard details
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your recovery KeyCard (Box A)."
            Label="Box A Value"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted backup key, as found on your recovery KeyCard (Box B)."
            Label="Box B Value"
            name="backupKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard (Box C)."
            Label="Box C Value"
            name="bitgoKey"
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikPasswordfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            Width="fill"
          />
        </div>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4 tw-mt-6">
          Recovery addresses
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The root address of your wallet (shown on your BitGo dashboard)."
            Label="Wallet Root Address"
            name="recoveryDestination"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The nested ATA address that holds the stuck tokens."
            Label="Nested ATA Address"
            name="nestedAtaAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The owner ATA address (tokens will be moved here)."
            Label="Owner ATA Address"
            name="ownerAtaAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The token mint address for the stuck token."
            Label="Token Mint Address"
            name="tokenMintAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An API Key Token from alchemy.com (optional)."
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
            {formik.isSubmitting ? 'Recovering...' : 'Recover Tokens'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
