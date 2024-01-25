import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string().optional(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string().optional(),
  recoveryDestination: Yup.string().required(),
  rootAddress: Yup.string().required(),
  maxFee: Yup.number().optional(),
  startTime: Yup.number()
    .required()
    .min(Date.now() / 1000, 'Start time must be in the future'),
  nodeId: Yup.string().optional(),
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
      userKey: '',
      userKeyId: '',
      backupKey: '',
      backupKeyId: '',
      recoveryDestination: '',
      rootAddress: '',
      maxFee: undefined,
      nodeId: undefined,
      startTime: 0,
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-Managed Cold Wallet
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your public user key (box A on your KeyCard)"
            Label="Public User Key"
            name="userKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user key ID (check on your KeyCard). Note: most wallets don’t have this."
            Label="User Key ID (Optional)"
            name="userKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your public backup key (box B on your KeyCard)"
            Label="Backup Public Key"
            name="backupKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your backup key ID (check on your KeyCard). Note: most wallets don’t have this."
            Label="Backup Key ID (Optional"
            name="backupKeyId"
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
            HelperText="The recipient address for the recovery transaction. If a memo ID is required, append it to the address. For example: 0.0.1234?memoId=3"
            Label="Destination Address"
            name="recoveryDestination"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Specify when the recovery transaction starts, using a future UNIX timestamp in seconds. Once started, the validity window lasts for 180 seconds."
            Label="Validity Window Start Time"
            name="startTime"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The maximum fee that you’re willing to pay for the recovery transaction. Defaults to 10000000 tinybars (0.1 Hbar)"
            Label="Maximum Fee in Base Units (Optional)"
            name="maxFee"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The account ID of your preferred consensus node. If empty, defaults to node account ID 0.0.3."
            Label="Node Account ID (Optional)"
            name="nodeId"
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
            {formik.isSubmitting ? 'Building...' : 'Build Transaction'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
