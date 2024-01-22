import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  gasPrice: Yup.number()
    .typeError('Gas price must be a number')
    .integer()
    .positive('Gas price must be a positive integer')
    .required(),
  recoveryDestination: Yup.string().required(),
  tokenContractAddress: Yup.string().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  walletContractAddress: Yup.string().required(),
}).required();

export type AvalancheCTokenFormProps = {
  onSubmit: (
    values: AvalancheCTokenFormValues,
    formikHelpers: FormikHelpers<AvalancheCTokenFormValues>
  ) => void | Promise<void>;
};

type AvalancheCTokenFormValues = Yup.Asserts<typeof validationSchema>;

export function AvalancheCTokenForm({ onSubmit }: AvalancheCTokenFormProps) {
  const formik = useFormik<AvalancheCTokenFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      backupKeyId: '',
      gasLimit: 500000,
      gasPrice: 30,
      recoveryDestination: '',
      tokenContractAddress: '',
      userKey: '',
      userKeyId: '',
      walletContractAddress: '',
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
            HelperText="The AVAXC address of the wallet contract. This is also the wallet's base address."
            Label="Wallet Contract Address"
            name="walletContractAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address of the smart contract of the token to recover. This is unique to each token, and is NOT your wallet address."
            Label="Token Contract Address"
            name="tokenContractAddress"
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
            HelperText="Gas limit for the AVAXC transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 unit of gas."
            Label="Gas Limit"
            name="gasLimit"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Gas price for the AVAXC transaction. The default is 30 Gwei."
            Label="Gas Price"
            name="gasPrice"
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
