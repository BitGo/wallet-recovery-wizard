import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

type StacksFormValues = {
  userKey: string;
  backupKey: string;
  bitgoKey: string;
  rootAddress: string;
  recoveryDestination: string;
  contractId?: string; // optional based on isToken
};

type StacksFormProps = {
  isToken: boolean;
  onSubmit: (
    values: StacksFormValues,
    formikHelpers: FormikHelpers<StacksFormValues>
  ) => void | Promise<void>;
};

export function StacksForm({ onSubmit, isToken }: StacksFormProps) {
  const schemaFields: Record<keyof StacksFormValues, Yup.AnySchema> = {
    userKey: Yup.string().required('Required'),
    backupKey: Yup.string().required('Required'),
    bitgoKey: Yup.string().required('Required'),
    rootAddress: Yup.string().required('Required'),
    recoveryDestination: Yup.string().required('Required'),
    contractId: isToken
      ? Yup.string().required('Token contract address is required')
      : Yup.string().notRequired(),
  };

  const validationSchema = Yup.object(schemaFields);
  const initialValues: StacksFormValues = {
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    rootAddress: '',
    recoveryDestination: '',
    ...(isToken ? { contractId: '' } : {}),
  };

  const formik = useFormik<StacksFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
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
            HelperText="The backup public key for the wallet, as found on your recovery KeyCard."
            Label="Backup Public Key"
            name="backupKey"
            Width="fill"
          />
        </div>
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
            HelperText="The root address of the wallet."
            Label="Root Address"
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
        { isToken && (
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="The contract id of the token to recover. This is unique to each token, in the format <contractAddress>.<contractId>"
              Label="Token Contract Id"
              name="contractId"
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
