import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { EvmCrossChainRecoveryBaseForm } from './EvmCrossChainRecoveryBaseForm';

const validationSchema = Yup.object({
  bitgoFeeAddress: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  walletContractAddress: Yup.string().required(),
  tokenContractAddress: Yup.string(),
  apiKey: Yup.string().required(),
  wrongChain: Yup.string().required(),
  intendedChain: Yup.string().required(),
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
      recoveryDestination: '',
      userKey: '',
      userKeyId: '',
      walletContractAddress: '',
      tokenContractAddress: undefined,
      apiKey: '',
      wrongChain: '',
      intendedChain: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        <EvmCrossChainRecoveryBaseForm formik={formik} />
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
