import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  gasLimit: Yup.number().required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  maxFeePerGas: Yup.number().required(),
  maxPriorityFeePerGas: Yup.number().required(),
  recoveryDestination: Yup.string().required(),
  tokenAddress: Yup.string().required(),
  userKey: Yup.string().required(),
  walletContractAddress: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
}).required();

export type ERC20FormProps = {
  onSubmit: (
    values: ERC20FormValues,
    formikHelpers: FormikHelpers<ERC20FormValues>
  ) => void | Promise<void>;
};

type ERC20FormValues = Yup.Asserts<typeof validationSchema>;

export function ERC20Form({ onSubmit }: ERC20FormProps) {
  const formik = useFormik<ERC20FormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      userKey: '',
      backupKey: '',
      tokenAddress: '',
      walletContractAddress: '',
      walletPassphrase: '',
      recoveryDestination: '',
      krsProvider: '',
      gasLimit: 500000,
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
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
          <FormikTextfield
            name="apiKey"
            Width="fill"
            Label="API Key"
            HelperText="An API-Key Token from etherscan.com required for Ethereum Mainnet recoveries."
            placeholder="Enter API key..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
            Label="Box A Value"
            name="userKey"
            placeholder='Enter the "A: User Key" from your BitGo keycard...'
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={backupKeyHelperText}
            Label="Box B Value"
            name="backupKey"
            placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
            rows={4}
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
            HelperText="Gas limit for the ETH transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas."
            Label="Gas limit"
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
            HelperText='"Tip" to the ETH miner. The default is 10 Gwei.'
            Label="Max Priority Fee Per Gas (Gwei)"
            name="maxPriorityFeePerGas"
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
