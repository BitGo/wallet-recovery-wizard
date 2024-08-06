import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  serializedSignedTx: Yup.string().required(),
  signature: Yup.string().required(),
}).required();

export type SuiFormProps = {
  onSubmit: (
    values: SuiFormValues,
    formikHelpers: FormikHelpers<SuiFormValues>
  ) => void | Promise<void>;
};

type SuiFormValues = Yup.Asserts<typeof validationSchema>;

export function SuiForm({ onSubmit }: SuiFormProps) {
  const formik = useFormik<SuiFormValues>({
    onSubmit,
    initialValues: {
      serializedSignedTx: '',
      signature: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Transaction
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your built and signed recovery transaction in base64 format."
            Label="Serialized and Signed Recovery Transaction"
            name="serializedSignedTx"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Transaction signature in base64 format."
            Label="Signature"
            name="signature"
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
            {formik.isSubmitting ? 'Broadcasting...' : 'Broadcast Transaction'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
