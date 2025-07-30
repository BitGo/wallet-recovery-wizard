import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

type NearFormValues = {
  backupKey: string;
  bitgoKey: string;
  krsProvider: string;
  recoveryDestination: string;
  userKey: string;
  walletPassphrase: string;
  tokenContractAddress?: string;  // optional based on isToken
}

export type NearFormProps = {
  isToken: boolean;
  onSubmit: (
    values: NearFormValues,
    formikHelpers: FormikHelpers<NearFormValues>
  ) => void | Promise<void>;
};

export function NearForm({ onSubmit, isToken }: NearFormProps) {
  const schemaFields: Record<keyof NearFormValues, Yup.AnySchema> = {
    backupKey: Yup.string().required('Backup Key is required'),
    bitgoKey: Yup.string().required('BitGo Key is required'),
    krsProvider: Yup.string()
      .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
      .label('Key Recovery Service'),
    recoveryDestination: Yup.string().required('Recovery Destination is required'),
    userKey: Yup.string().required('User Key is required'),
    walletPassphrase: Yup.string().required('WalletPassphrase is required'),
    tokenContractAddress: isToken
      ? Yup.string().required('Token contract address is required')
      : Yup.string().notRequired(),
  };

  const validationSchema = Yup.object(schemaFields);

  const initialValues: NearFormValues = {
    backupKey: '',
    bitgoKey: '',
    krsProvider: '',
    recoveryDestination: '',
    userKey: '',
    walletPassphrase: '',
    ...(isToken ? { tokenContractAddress: '' } : {}),
  };

  const formik = useFormik<NearFormValues>({
    onSubmit,
    initialValues,
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
          <FormikPasswordfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
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
