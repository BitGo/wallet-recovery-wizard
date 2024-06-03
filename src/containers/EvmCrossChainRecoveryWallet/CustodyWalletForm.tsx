import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';
import { EvmCrossChainRecoveryBaseForm } from './EvmCrossChainRecoveryBaseForm';

const validationSchema = Yup.object({
  recoveryDestination: Yup.string().required(),
  tokenContractAddress: Yup.string(),
  wrongChain: Yup.string().required(),
  intendedChain: Yup.string().required(),
  walletId: Yup.string().required(),
}).required();

export type FormProps = {
  onSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => void | Promise<void>;
};

type FormValues = Yup.Asserts<typeof validationSchema>;

export function CustodyWalletForm({ onSubmit }: FormProps) {
  const formik = useFormik<FormValues>({
    onSubmit,
    initialValues: {
      recoveryDestination: '',
      tokenContractAddress: undefined,
      wrongChain: '',
      intendedChain: '',
      walletId: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Bitgo managed custody wallet details
        </h4>
        <EvmCrossChainRecoveryBaseForm formik={formik} />
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The identifier of the wallet of the intendend chain."
            Label="Wallet ID*"
            name="walletId"
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
