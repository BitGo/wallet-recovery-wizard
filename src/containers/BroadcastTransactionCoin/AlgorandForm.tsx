import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  serializedSignedTx: Yup.string().required(),
  nodeParams: Yup.object({
    token: Yup.string().required(),
    baseServer: Yup.string().required(),
    port: Yup.number().required(),
  }),
}).required();

export type AlgorandFormProps = {
  onSubmit: (
    values: AlgorandFormValues,
    formikHelpers: FormikHelpers<AlgorandFormValues>
  ) => void | Promise<void>;
};

type AlgorandFormValues = Yup.Asserts<typeof validationSchema>;

export function AlgorandForm({ onSubmit }: AlgorandFormProps) {
  const formik = useFormik<AlgorandFormValues>({
    onSubmit,
    initialValues: {
      serializedSignedTx: '',
      nodeParams: {
        token: '',
        baseServer: '',
        port: 8443,
      },
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
        <Form>
          <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
            Node Parameters
          </h4>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Token of the Algorand node you are connecting to."
              Label="Algorand token"
              name="nodeParams.token"
              Width="fill"
            />
          </div>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Server address of the Algorand node you are connecting to."
              Label="Node Server Address"
              name="nodeParams.baseServer"
              Width="fill"
            />
          </div>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Port of the Algorand node you are connecting to."
              Label="Port"
              name="nodeParams.port"
              Width="fill"
            />
          </div>
        </Form>
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
