import * as Yup from 'yup';
import { FormikProvider, Form, FormikHelpers, useFormik } from 'formik';
import {
  Button,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
  krsProvider: Yup.mixed()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  walletContractAddress: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  maxFeePerGas: Yup.string().required(),
  maxPriorityFeePerGas: Yup.string().required(),
});

export type EthereumFormProps = {
  onSubmit: (
    values: EthereumFormValues,
    formikHelpers: FormikHelpers<EthereumFormValues>
  ) => void | Promise<void>;
};

type EthereumFormValues = {
  apiKey: string;
  userKey: string;
  backupKey: string;
  walletContractAddress: string;
  walletPassphrase: string;
  recoveryDestination: string;
  krsProvider: string;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
};

export function EthereumForm({ onSubmit }: EthereumFormProps) {
  const formik = useFormik<EthereumFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      userKey: '',
      backupKey: '',
      walletContractAddress: '',
      walletPassphrase: '',
      recoveryDestination: '',
      krsProvider: '',
      gasLimit: '500000',
      maxFeePerGas: '20',
      maxPriorityFeePerGas: '10',
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
            name="krsProvider"
            Label="Key Recovery Service"
            HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
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
            name="userKey"
            Label="Box A Value"
            HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
            placeholder='Enter the "A: User Key" from your BitGo keycard...'
            rows={4}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            name="backupKey"
            Label="Box B Value"
            HelperText={backupKeyHelperText}
            placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
            rows={4}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="walletContractAddress"
            Width="fill"
            Label="Wallet Contract Address"
            HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
            placeholder="Enter wallet contract address..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="walletPassphrase"
            Width="fill"
            Label="Wallet Passphrase"
            HelperText="The passphrase of the wallet."
            placeholder="Enter your wallet password..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="recoveryDestination"
            Width="fill"
            Label="Destination Address"
            HelperText="The address your recovery transaction will send to."
            placeholder="Enter destination address..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="gasLimit"
            Width="fill"
            Label="Gas limit"
            HelperText="Gas limit for the ETH transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas."
            defaultValue={500000}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="maxFeePerGas"
            Width="fill"
            Label="Max Fee Per Gas (Gwei)"
            HelperText="Max fee per gas for the ETH transaction. The default is 20 Gwei."
            defaultValue={20}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="maxPriorityFeePerGas"
            Width="fill"
            Label="Max Priority Fee Per Gas (Gwei)"
            HelperText='"Tip" to the ETH miner. The default is 10 Gwei.'
            defaultValue={10}
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