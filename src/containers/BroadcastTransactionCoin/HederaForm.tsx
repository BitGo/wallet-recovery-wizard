import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  serializedSignedTx: Yup.string().required(),
  startTime: Yup.number()
    .optional()
    .min(Date.now() / 1000, 'Start time must be in the future'),
}).required();

export type HederaFormProps = {
  onSubmit: (
    values: HederaFormValues,
    formikHelpers: FormikHelpers<HederaFormValues>
  ) => void | Promise<void>;
};

type HederaFormValues = Yup.Asserts<typeof validationSchema>;

export function HederaForm({ onSubmit }: HederaFormProps) {
  const formik = useFormik<HederaFormValues>({
    onSubmit,
    initialValues: {
      serializedSignedTx: '',
      startTime: undefined,
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
            HelperText="Your built and signed recovery transaction."
            Label="Serialized and Signed Recovery Transaction"
            name="serializedSignedTx"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="If you specified a Validity Window Start Time when building the recovery transaction, you must enter the UNIX timestamp here."
            Label="Validity Window Start Time (Optional)"
            name="startTime"
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
