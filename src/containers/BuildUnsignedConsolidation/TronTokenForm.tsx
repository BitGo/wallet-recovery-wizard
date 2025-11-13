import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Button, FormikPasswordfield, FormikTextfield } from '~/components';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { getWalletTypeLabels, WalletType } from './useWalletTypeLabels';
import { WalletTypeSelector } from './WalletTypeSelector';

const validationSchema = Yup.object({
  walletType: Yup.string().oneOf(['cold', 'hot']).required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(), // seed
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().when('walletType', {
    is: 'hot',
    then: (schema) => schema.required('Wallet passphrase is required for hot wallets'),
    otherwise: (schema) => schema,
  }),
  tokenContractAddress: Yup.string().required(),
  startingScanIndex: Yup.number().required(),
  endingScanIndex: Yup.number().required().moreThan(
    Yup.ref('startingScanIndex'),
    'Ending scan index must be greater than starting scan index'
  ),
}).required();

export type TronFormValues =  Yup.Asserts<typeof validationSchema>;

export type TronFormProps = {
  onSubmit: (
    values: TronFormValues,
    formikHelpers: FormikHelpers<TronFormValues>
  ) => void | Promise<void>;
}

export function TronTokenForm({ onSubmit }: TronFormProps) {
  const formik = useFormik<TronFormValues>({
    onSubmit,
    initialValues: {
      walletType: 'cold' as WalletType,
      backupKey: '',
      backupKeyId: '',
      bitgoKey: '',
      walletPassphrase: '',
      startingScanIndex: 1,
      tokenContractAddress: '',
      endingScanIndex: 21,
      userKey: '',
      userKeyId: '',
    },
    validationSchema,
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
          <FormikTextfield
            HelperText={userKeyHelperText}
            Label={userKeyLabel}
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
            HelperText={backupKeyHelperText}
            Label={backupKeyLabel}
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
            HelperText="The address of the smart contract of the token to consolidate. This is unique to each token, and is NOT your wallet address."
            Label="Token Contract Address"
            name="tokenContractAddress"
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
  )
}
