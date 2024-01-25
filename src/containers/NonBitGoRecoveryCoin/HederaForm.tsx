import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextarea, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  rootAddress: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  maxFee: Yup.number().optional(),
  nodeId: Yup.string().optional(),
  startTime: Yup.number()
    .optional()
    // Date.now() is in miliseconds, so we convert to seconds with Xms / 1000 = Ys
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
      userKey: '',
      backupKey: '',
      rootAddress: '',
      walletPassphrase: '',
      recoveryDestination: '',
      maxFee: undefined,
      nodeId: undefined,
      startTime: undefined,
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-Managed Hot Wallet
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key (box A of the KeyCard)."
            Label="Encrypted User Key"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted backup key (box B of the KeyCard)."
            Label="Encrypted Backup Key"
            name="backupKey"
            rows={4}
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
            HelperText="Your wallet passphrase."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            type="password"
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
            HelperText="Specify when the recovery transaction starts, using a future UNIX timestamp in seconds. Once started, the validity window lasts for 180 seconds. Defaults to the current time."
            Label="Validity Window Start Time (Optional)"
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
