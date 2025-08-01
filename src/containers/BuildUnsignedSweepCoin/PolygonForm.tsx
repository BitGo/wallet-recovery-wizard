import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { allCoinMetas } from '~/helpers/config';

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
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  derivationSeed: Yup.string(),
  walletContractAddress: Yup.string().required(),
  isTss: Yup.boolean(),
}).required();

export type PolygonFormProps = {
  onSubmit: (
    values: PolygonFormValues,
    formikHelpers: FormikHelpers<PolygonFormValues>
  ) => void | Promise<void>;
  coinName: string; // Add coinName as a prop
};

type PolygonFormValues = Yup.Asserts<typeof validationSchema>;
export function PolygonForm({ onSubmit, coinName }: PolygonFormProps) {
  const formik = useFormik<PolygonFormValues>({
    onSubmit,
    initialValues: {
      apiKey: '',
      backupKey: '',
      backupKeyId: '',
      gasLimit: 500000,
      maxFeePerGas: 20,
      maxPriorityFeePerGas: 10,
      ...(coinName === 'bsc' || coinName === 'tbsc' ? { gasPrice: 20 } : {}),
      recoveryDestination: '',
      userKey: '',
      userKeyId: '',
      derivationSeed: '',
      walletContractAddress: '',
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
            HelperText={`The ${coinName} address of the wallet contract. This is also the wallet's base address.`}
            Label="Wallet Contract Address"
            name="walletContractAddress"
            Width="fill"
          />
        </div>
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
            HelperText={`Gas limit for the ${coinName} transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas.`}
            Label="Gas Limit"
            name="gasLimit"
            Width="fill"
          />
        </div>
        {coinName === 'polygon' || coinName === 'tpolygon' ? (
        <>
         <div className="tw-mb-4">
          <FormikTextfield
            HelperText={`Max fee per gas for the ${coinName} transaction. The default is ${
            coinName === 'polygon' ? '20 Gwei' : '15 Gwei'
          }.`}
          Label="Max Fee Per Gas (Gwei)"
          name="maxFeePerGas"
          Width="fill"
         />
        </div>
        <div className="tw-mb-4">
         <FormikTextfield
            HelperText={`"Tip" to the ${coinName} miner. This is by default ${
            coinName === 'polygon' ? '10 Gwei' : '5 Gwei'
         }.`}
         Label="Max Priority Fee Per Gas (Gwei)"
         name="maxPriorityFeePerGas"
         Width="fill"
        />
        </div>
        </>
        ) : (
        <div className="tw-mb-4">
         <FormikTextfield
           HelperText={`Gas price for the ${coinName} transaction. The value should be between 1 Gwei and 2,500 Gwei.`}
           Label="Gas Price (Gwei)"
           name="gasPrice"
           Width="fill"
         />
         </div>
       )}
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An Api-Key Token from etherscan.io required for Polygon Mainnet recoveries."
            Label="API Key"
            name="apiKey"
            Width="fill"
          />
        </div>
        {allCoinMetas[coinName]?.isTssSupported && (
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
