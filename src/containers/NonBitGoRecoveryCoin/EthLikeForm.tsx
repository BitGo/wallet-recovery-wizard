import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';
import { allCoinMetas } from '~/helpers/config';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  isTss: Yup.boolean(),
  maxFeePerGas: Yup.number().required(),
  maxPriorityFeePerGas: Yup.number().required(),
  recoveryDestination: Yup.string().required(),
  userKey: Yup.string().required(),
  walletContractAddress: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
}).required();

export type EthLikeFormProps = {
  coinName: string;
  onSubmit: (
    values: EthereumFormValues,
    formikHelpers: FormikHelpers<EthereumFormValues>
  ) => void | Promise<void>;
};

type EthereumFormValues = Yup.Asserts<typeof validationSchema>;

export function EthereumForm({ onSubmit, coinName }: EthLikeFormProps) {
  const formik = useFormik<EthereumFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      backupKey: '',
      gasLimit: allCoinMetas[coinName]?.defaultGasLimitNum ?? 500000,
      krsProvider: '',
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
      recoveryDestination: '',
      isTss: false,
      userKey: '',
      walletContractAddress: '',
      walletPassphrase: '',
    },
    validationSchema,
  });

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your recovery KeyCard.'
      : 'The backup public key for the wallet, as found on your recovery KeyCard.';

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
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your recovery KeyCard."
            Label="Box A Value"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={backupKeyHelperText}
            Label="Box B Value"
            name="backupKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
            Label="Wallet Contract Address"
            name="walletContractAddress"
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
            HelperText={`An Api-Key Token from ${
              allCoinMetas[coinName].ApiKeyProvider ?? 'etherscan.com'
            } required for recoveries.`}
            Label="API Key"
            name="apiKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`Gas limit for the ETH transaction. The value should be between ${
              allCoinMetas[coinName].minGasLimit ?? '30,000'
            } and 20,000,000. The default is ${
              allCoinMetas[coinName].defaultGasLimit ?? '500,000'
            } unit of gas.`}
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
            HelperText='"Tip" to the ETH miner. This is by default 10 Gwei.'
            Label="Max Priority Fee Per Gas (Gwei)"
            name="maxPriorityFeePerGas"
            Width="fill"
          />
        </div>
        {allCoinMetas[coinName].isTssSupported && (
          <div className="tw-mb-4" role="group">
            <label>
              <Field type="checkbox" name="isTss" />
              Is TSS recovery?
            </label>
          </div>
        )}
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
