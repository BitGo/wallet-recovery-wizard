import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  bitgoKey: Yup.string().required('BitGo Key (commonKeychain) is required'),
  recoveryDestination: Yup.string()
    .required('Recovery Destination is required')
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
}).required();

export type IotaUnsignedSweepFormProps = {
  onSubmit: (
    values: IotaUnsignedSweepFormValues,
    formikHelpers: FormikHelpers<IotaUnsignedSweepFormValues>
  ) => void | Promise<void>;
  coinName: string;
};

type IotaUnsignedSweepFormValues = Yup.Asserts<typeof validationSchema>;

export function IotaForm({ onSubmit, coinName }: IotaUnsignedSweepFormProps) {
  const formik = useFormik<IotaUnsignedSweepFormValues>({
    onSubmit,
    initialValues: {
      bitgoKey: '',
      recoveryDestination: '',
      seed: '',
      fullnodeRpcUrl: '',
      scan: 20,
      startingScanIndex: 0,
    },
    validationSchema,
  });

  const defaultRpcUrl = coinName === 'tiota'
    ? 'https://api.testnet.iota.cafe'
    : 'https://api.iota.cafe';

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-Managed Cold / Custody Wallets
        </h4>
        <p className="tw-text-sm tw-text-gray-700 tw-mb-4">
          Build an unsigned recovery transaction for offline signing. Use this for cold wallets or custody wallets where signing happens in a separate system.
        </p>
        <div className="tw-mb-4">
          <FormikTextarea
            Label="Box C Value (BitGo Key / Common Keychain)"
            name="bitgoKey"
            HelperText="Enter the raw public key (commonKeychain) from Box C of your KeyCard. This should be a 128-character hex string."
            rows={3}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Recovery Destination Address"
            name="recoveryDestination"
            HelperText="The IOTA address where recovered funds will be sent (0x followed by 64 hex characters)."
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
            name="fullnodeRpcUrl"
            HelperText={`Leave empty to use default: ${defaultRpcUrl}`}
            placeholder={defaultRpcUrl}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Starting Scan Index"
            name="startingScanIndex"
            HelperText="The address index to start scanning from (default: 0)"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Address Scanning Factor"
            name="scan"
            HelperText="The number of addresses to scan for funds (default: 20). Recovery will stop at the first address with funds."
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
            {formik.isSubmitting ? 'Building Unsigned Transaction...' : 'Build Unsigned Sweep'}
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
