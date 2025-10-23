import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextarea, FormikTextfield } from '~/components';

type VetFormValues = {
  bitgoKey: string;
  recoveryDestination: string;
  tokenContractAddress?: string;  // optional based on isToken
}

export type VetFormProps = {
  isToken: boolean;
  onSubmit: (
    values: VetFormValues,
    formikHelpers: FormikHelpers<VetFormValues>
  ) => void | Promise<void>;
};

export function VetForm({ onSubmit, isToken }: VetFormProps) {
  const schemaFields: Record<keyof VetFormValues, Yup.AnySchema> = {
    bitgoKey: Yup.string().required('BitGo Key is required'),
    recoveryDestination: Yup.string().required('Recovery Destination is required'),
    tokenContractAddress: isToken
      ? Yup.string().required('Token contract address is required')
      : Yup.string().notRequired(),
  };

  const validationSchema = Yup.object(schemaFields);
  const initialValues: VetFormValues = {
    bitgoKey: '',
    recoveryDestination: '',
    ...(isToken ? { tokenContractAddress: '' } : {}),
  };

  const formik = useFormik<VetFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self Custody Cold Wallets
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard."
            Label="BitGo Key"
            name="bitgoKey"
            rows={1}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The address your recovery transaction will send to."
            Label="Recovery Destination"
            name="recoveryDestination"
            Width="fill"
          />
        </div>
        { isToken && (
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="The contract address of the token to recover. This is unique to each token"
              Label="Token Contract Address"
              name="tokenContractAddress"
              Width="fill"
            />
          </div>
        )
        }
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
