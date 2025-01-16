import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { allCoinMetas } from '~/helpers/config';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  commonKeyChain: Yup.string().required(),
  derivationPath: Yup.string(),
  derivationSeed: Yup.string(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  maxFeePerGas: Yup.number().required(),
  maxPriorityFeePerGas: Yup.number().required(),
  recoveryDestination: Yup.string().required(),
  walletContractAddress: Yup.string().required(),
  isTss: Yup.boolean(),
}).required();

export type EthLikeFormTSSProps = {
  coinName: string;
  onSubmit: (
    values: EthLikeFormTSSValues,
    formikHelpers: FormikHelpers<EthLikeFormTSSValues>
  ) => void | Promise<void>;
};

type EthLikeFormTSSValues = Yup.Asserts<typeof validationSchema>;

export function EthLikeFormTSS({ onSubmit, coinName }: EthLikeFormTSSProps) {
  const formik = useFormik<EthLikeFormTSSValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      commonKeyChain: '',
      derivationPath: '',
      derivationSeed: '',
      gasLimit: allCoinMetas[coinName]?.defaultGasLimitNum ?? 500000,
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
      recoveryDestination: '',
      walletContractAddress: '',
      isTss: true,
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
            HelperText="Your common key chain, as found on your recovery KeyCard."
            Label="Common Key Chain"
            name="commonKeyChain"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your key derivation path, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Key Derivation Path (optional)"
            name="derivationPath"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your key derivation seed, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Key Derivation Seed (optional)"
            name="derivationSeed"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="This is the wallet's base address."
            Label="Wallet Base Address"
            name="walletContractAddress"
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
            HelperText={`Gas limit for the ETH transaction. The value should be between ${
              allCoinMetas[coinName].minGasLimit ?? '30,000'
            } and 20,000,000. The default is ${
              allCoinMetas[coinName].defaultGasLimit ?? '500,000'
            } unit of gas.`}
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
            HelperText={`An Api-Key Token from ${
              allCoinMetas[coinName].ApiKeyProvider ?? 'etherscan.com'
            } required for recoveries.`}
            Label="API Key"
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
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
