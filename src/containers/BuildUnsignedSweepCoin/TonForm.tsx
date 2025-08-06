import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  recoveryDestination: Yup.string().required('Recovery Destination is required'),
  apiKey: Yup.string().required('API Key is required'),
  bitgoKey: Yup.string().required('BitGo Key is required'),
  userKey: Yup.string(), // Optional
  backupKey: Yup.string()
}).required();

export type UnsignedSweepFormProps = {
  onSubmit: (
    values: UnsignedSweepFormValues,
    formikHelpers: FormikHelpers<UnsignedSweepFormValues>
  ) => void | Promise<void>;
};

type UnsignedSweepFormValues = Yup.Asserts<typeof validationSchema>;

export function TonForm({ onSubmit }: UnsignedSweepFormProps) {
  const formik = useFormik<UnsignedSweepFormValues>({
    onSubmit,
    initialValues: {
      recoveryDestination: '',
      apiKey: '',
      bitgoKey: '',
      userKey: '',
      backupKey: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-Managed Cold Wallets
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            Label="Recovery Destination"
            name="recoveryDestination"
            HelperText="The address where the recovered funds will be sent."
            rows={1}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="API Key"
            name="apiKey"
            HelperText="The API key for accessing the recovery service."
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="BitGo Key"
            name="bitgoKey"
            HelperText="The BitGo key for the wallet."
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
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
