import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { allCoinMetas } from '~/helpers/config';

const validationSchema = Yup.object({
  apiKey: Yup.string().required(),
  backupKey: Yup.string().when('isTss', {
    is: false,
    then: Yup.string().required(),
    otherwise: Yup.string().notRequired(),
  }),
  bitgoKey: Yup.string().when('isTss', {
    is: true,
    then: Yup.string().required(),
    otherwise: Yup.string().notRequired(),
  }),
  backupKeyId: Yup.string(),
  seed: Yup.string(),
  gasLimit: Yup.number()
    .typeError('Gas limit must be a number')
    .integer()
    .positive('Gas limit must be a positive integer')
    .required(),
  maxFeePerGas: Yup.number().required(),
  maxPriorityFeePerGas: Yup.number().required(),
  recoveryDestination: Yup.string().required(),
  userKey: Yup.string().when('isTss', {
    is: false,
    then: Yup.string().required(),
    otherwise: Yup.string().notRequired(),
  }),
  userKeyId: Yup.string(),
  walletContractAddress: Yup.string().required(),
  derivationSeed: Yup.string(),
  isTss: Yup.boolean(),
}).required();

export type EthLikeFormProps = {
  coinName: string;
  onSubmit: (
    values: EthLikeFormValues,
    formikHelpers: FormikHelpers<EthLikeFormValues>
  ) => void | Promise<void>;
};

type EthLikeFormValues = Yup.Asserts<typeof validationSchema>;

export function EthLikeForm({ onSubmit, coinName }: EthLikeFormProps) {
  const formik = useFormik<EthLikeFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      backupKey: '',
      backupKeyId: '',
      bitgoKey: '',
      seed: '',
      gasLimit: allCoinMetas[coinName]?.defaultGasLimitNum ?? 500000,
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
      recoveryDestination: '',
      userKey: '',
      userKeyId: '',
      walletContractAddress: '',
      derivationSeed: '',
      isTss: false,
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        {allCoinMetas[coinName].isTssSupported && (
          <div className="tw-mb-4" role="group">
            <label>
              <Field type="checkbox" name="isTss" />
              Is TSS recovery?
            </label>
          </div>
        )}
        {formik.values.isTss ? null : (
          <div>
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
                HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
                Label="Wallet Contract Address"
                name="walletContractAddress"
                Width="fill"
              />
            </div>
          </div>
        )}
        {formik.values.isTss ? (
          <div>
            <div className="tw-mb-4">
              <FormikTextfield
                HelperText="Your BitGo public key, also known as the common keychain public key."
                Label="BitGo Public Key"
                name="bitgoKey"
                Width="fill"
              />
            </div>
            <div className="tw-mb-4">
              <FormikTextfield
                HelperText="Your user seed as found on your KeyCard as Key ID. Most wallets will not have this and you can leave it blank."
                Label="Seed (optional)"
                name="seed"
                Width="fill"
              />
            </div>
          </div>
        ) : null
        }
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your derivation seed, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Derivation Seed (Optional)"
            name="derivationSeed"
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
