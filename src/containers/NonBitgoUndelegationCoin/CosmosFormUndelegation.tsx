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
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  walletPassphrase: Yup.string().required(),
  delegatorAddress: Yup.string().required(),
  sourceValidator: Yup.string().required(),
  destinationValidator: Yup.string().required(),
  amount: Yup.string().required(),
}).required();

export type CosmosFormProps = {
  onSubmit: (
    values: CosmosFormValues,
    formikHelpers: FormikHelpers<CosmosFormValues>
  ) => void | Promise<void>;
};

type CosmosFormValues = Yup.Asserts<typeof validationSchema>;

export function CosmosFormUndelegation({ onSubmit }: CosmosFormProps) {
  const formik = useFormik<CosmosFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      bitgoKey: '',
      krsProvider: '',
      userKey: '',
      walletPassphrase: '',
      delegatorAddress: '',
      sourceValidator: '',
      destinationValidator: '',
      amount: '',
    },
    validationSchema,
  });

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your BitGo recovery keycard.'
      : 'The backup public key for the wallet, as found on your BitGo recovery keycard.';

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed hot wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikSelectfield
            HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
            Label="Key Recovery Service"
            name="krsProvider"
            Width="fill"
          >
            <option value="">None</option>
            <option value="keyternal">Keyternal</option>
            <option value="bitgoKRSv2">BitGo KRS</option>
            <option value="dai">Coincover</option>
          </FormikSelectfield>
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your recovery KeyCard."
            Label="Box A Value"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={backupKeyHelperText}
            Label="Box B Value"
            name="backupKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard."
            Label="Box C Value"
            name="bitgoKey"
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            type="password"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Delegator Address"
            name="delegatorAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Source Validator"
            name="sourceValidator"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            Label="Destination Validator"
            name="destinationValidator"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield Label="Amount" name="amount" Width="fill" />
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
            {formik.isSubmitting ? 'Undelegating...' : 'Undelegate'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
