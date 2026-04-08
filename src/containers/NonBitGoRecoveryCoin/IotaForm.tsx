import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

interface IotaFormProps {
  onSubmit: (values: IotaFormValues, formikHelpers: FormikHelpers<IotaFormValues>) => void | Promise<void>;
  coinName: string;
}

export interface IotaFormValues {
  userKey: string;
  backupKey: string;
  bitgoKey: string;
  walletPassphrase: string;
  recoveryDestination: string;
  seed?: string;
  fullnodeRpcUrl: string;
  scan: number;
  startingScanIndex: number;
}

export function IotaForm({ onSubmit, coinName }: IotaFormProps) {
  const formik = useFormik<IotaFormValues>({
    initialValues: {
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      recoveryDestination: '',
      seed: '',
      fullnodeRpcUrl: '',
      scan: 20,
      startingScanIndex: 0,
    },
    validationSchema: Yup.object({
      userKey: Yup.string().required('User key is required'),
      backupKey: Yup.string().required('Backup key is required'),
      bitgoKey: Yup.string().required('BitGo key is required'),
      walletPassphrase: Yup.string().required('Wallet passphrase is required to decrypt keys'),
      recoveryDestination: Yup.string()
        .required('Recovery destination is required')
        .matches(/^0x[a-fA-F0-9]{64}$/, 'Invalid IOTA address format (must be 0x followed by 64 hex characters)'),
      seed: Yup.string(),
      fullnodeRpcUrl: Yup.string().url('Invalid URL format'),
      scan: Yup.number()
        .required('Address scanning factor is required')
        .min(1, 'Must scan at least 1 address')
        .max(100, 'Cannot scan more than 100 addresses at once'),
      startingScanIndex: Yup.number()
        .required('Starting scan index is required')
        .min(0, 'Starting index must be 0 or greater'),
    }),
    onSubmit,
  });

  const defaultRpcUrl = coinName === 'tiota'
    ? 'https://api.testnet.iota.cafe'
    : 'https://api.iota.cafe';

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-4">
          <FormikTextarea
            Label="Box A Value (User Key)"
            HelperText="Enter the encrypted user key from Box A of your KeyCard (JSON format with iv, cipher, ct fields)"
            name="userKey"
            placeholder="Encrypted User Key from KeyCard (JSON)"
            rows={3}
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextarea
            Label="Box B Value (Backup Key)"
            HelperText="Enter the encrypted backup key from Box B of your KeyCard (JSON format with iv, cipher, ct fields)"
            name="backupKey"
            placeholder="Encrypted Backup Key from KeyCard (JSON)"
            rows={3}
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextarea
            Label="Box C Value (BitGo Key / Common Keychain)"
            HelperText="Enter the raw public key (commonKeychain) from Box C. This should be a 128-character hex string."
            name="bitgoKey"
            placeholder="Common Keychain / BitGo Public Key (128 hex chars)"
            rows={3}
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikPasswordfield
            Label="Wallet Passphrase"
            HelperText="Required to decrypt user and backup keys from the KeyCard"
            name="walletPassphrase"
            placeholder="Enter wallet passphrase to decrypt keys"
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextfield
            Label="Recovery Destination Address"
            HelperText="The IOTA address where recovered funds will be sent"
            name="recoveryDestination"
            placeholder="0x..."
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextfield
            Label="Seed (optional)"
            HelperText="Your user seed as found on your KeyCard as Key ID. Most wallets will not have this and you can leave it blank."
            name="seed"
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextfield
            Label="Fullnode RPC URL (optional)"
            HelperText={`Leave empty to use default: ${defaultRpcUrl}`}
            name="fullnodeRpcUrl"
            placeholder={defaultRpcUrl}
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextfield
            Label="Starting Scan Index"
            HelperText="The address index to start scanning from (default: 0)"
            name="startingScanIndex"
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextfield
            Label="Address Scanning Factor"
            HelperText="The number of addresses to scan for funds (default: 20). Recovery will stop at the first address with funds."
            name="scan"
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
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Recovering Funds...' : 'Recover Funds'}
          </Button>
        </div>
        {formik.isSubmitting && (
          <div className="tw-text-sm tw-text-gray-700 tw-mt-2 tw-text-center">
            This may take a few moments while we fetch objects and build the transaction...
          </div>
        )}
      </Form>
    </FormikProvider>
  );
}
