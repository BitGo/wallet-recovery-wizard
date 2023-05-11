import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { EvmCrossChainRecoveryBaseForm } from './EvmCrossChainRecoveryBaseForm';

const validationSchema = Yup.object({
  bitgoFeeAddress: Yup.string().required(),
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
  walletContractAddress: Yup.string().required(),
  tokenContractAddress: Yup.string(),
  apiKey: Yup.string().required(),
}).required();

export type FormProps = {
  onSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => void | Promise<void>;
};

type FormValues = Yup.Asserts<typeof validationSchema>;

export function ColdWalletForm({ onSubmit }: FormProps) {
  const formik = useFormik<FormValues>({
    onSubmit,
    initialValues: {
      bitgoFeeAddress: '',
      gasLimit: 500000,
      maxFeePerGas: 500,
      maxPriorityFeePerGas: 50,
      recoveryDestination: '',
      userKey: '',
      userKeyId: '',
      walletContractAddress: '',
      tokenContractAddress: '',
      apiKey: '',
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
            Label="User Public Key*"
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
        <EvmCrossChainRecoveryBaseForm/>
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
