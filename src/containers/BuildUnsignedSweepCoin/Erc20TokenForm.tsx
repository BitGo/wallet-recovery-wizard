import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextarea, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  maxFeePerGas: Yup.number().required(),
  maxPriorityFeePerGas: Yup.number().required(),
  recoveryDestination: Yup.string().required(),
  tokenAddress: Yup.string().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  walletContractAddress: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
}).required();

export type Erc20TokenFormProps = {
  onSubmit: (
    values: Erc20TokenFormValues,
    formikHelpers: FormikHelpers<Erc20TokenFormValues>
  ) => void | Promise<void>;
};

type Erc20TokenFormValues = Yup.Asserts<typeof validationSchema>;

export function Erc20TokenForm({ onSubmit }: Erc20TokenFormProps) {
  const formik = useFormik<Erc20TokenFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      backupKey: '',
      backupKeyId: '',
      gasLimit: 500000,
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
      recoveryDestination: '',
      tokenAddress: '',
      userKey: '',
      userKeyId: '',
      walletContractAddress: '',
      walletPassphrase: '',
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
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
            Label="User Public Key"
            name="userKey"
            placeholder='Enter the "A: User Key" from your BitGo keycard...'
            rows={4}
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
          <FormikTextarea
            HelperText="Your encrypted backup key, as found on your BitGo recovery keycard."
            Label="Backup Public Key"
            name="backupKey"
            placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your backup Key ID, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Backup Key ID (optional)"
            name="userKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
            Label="Wallet Contract Address"
            name="walletContractAddress"
            placeholder="Enter wallet contract address..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address of the smart contract of the token to recover. This is unique to each token and is NOT your wallet address."
            Label="Token Contract Address"
            name="tokenAddress"
            placeholder="Enter wallet contract address..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            placeholder="Enter your wallet password..."
            type="password"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address your recovery transaction will send to."
            Label="Destination Address"
            name="recoveryDestination"
            placeholder="Enter destination address..."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Gas limit for the ETH transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 unit of gas."
            Label="Gas Limit"
            name="gasLimit"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Max fee per gas for the ETH transaction. The default is 20 Gwei."
            Label="Max Fee Per Gas (Gwei)"
            name="maxFeePerGas"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText='"Tip" to the ETH miner. This is by default 10 Gwei.'
            Label="Max Priority Fee Per Gas (Gwei)"
            name="maxPriorityFeePerGas"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An Api-Key Token from etherscan.com required for Ethereum Mainnet recoveries."
            Label="API Key"
            name="apiKey"
            placeholder="Enter API key..."
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
