import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string(),
  bitgoKey: Yup.string(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.number().required(),
  startingScanIndex: Yup.number().required(),
  userKey: Yup.string()
})

export type CosmosFormProps = {
  onSubmit: (
    values: CosmosFormValues,
    formikHelpers: FormikHelpers<CosmosFormValues>
  ) => void | Promise<void>;
};

type CosmosFormValues = Yup.Asserts<typeof validationSchema>;

export function CosmosForm({ onSubmit }: CosmosFormProps) {
  const formik = useFormik<CosmosFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      bitgoKey: '',
      recoveryDestination: '',
      scan: 20,
      startingScanIndex: 0,
      userKey: '',
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
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard."
            Label="BitGo Public Key"
            name="bitgoKey"
            Width="fill"
          />
        </div>
    
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The base address of the wallet (also known as root address)"
            Label="Base Address"
            name="rootAddress"
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
            HelperText="The amount of addresses without transactions to scan before stopping the tool."
            Label="Address Scanning Factor"
            name="scan"
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
