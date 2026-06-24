import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';
import { allCoinMetas } from '~/helpers/config';

const validationSchema = Yup.object({
  isTss: Yup.boolean().default(false),
  krsProvider: Yup.string()
    .default('')
    .oneOf(['', 'keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  userKey: Yup.string().required(),
  backupKey: Yup.string()
    .default('')
    .when('isTss', {
      is: true,
      then: (schema) => schema,
      otherwise: (schema) => schema.required(),
    }),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
}).required();

export type TronFormProps = {
  onSubmit: (
    values: TronFormValues,
    formikHelpers: FormikHelpers<TronFormValues>
  ) => void | Promise<void>;
  coinName: string;
};

type TronFormValues = Yup.Asserts<typeof validationSchema>;

export function TronForm({ onSubmit, coinName }: TronFormProps) {
  const formik = useFormik<TronFormValues>({
    onSubmit,
    initialValues: {
      isTss: false,
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      recoveryDestination: '',
      krsProvider: '',
    },
    validationSchema,
  });

  const isTss = formik.values.isTss;

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your recovery KeyCard.'
      : 'The backup public key for the wallet, as found on your recovery KeyCard.';

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed hot wallet details
        </h4>
        {allCoinMetas[coinName]?.isTssSupported && (
          <div className="tw-mb-4" role="group">
            <label>
              <Field type="checkbox" name="isTss" />
              {' '}Is TSS recovery?
            </label>
          </div>
        )}
        {!isTss && (
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
        )}
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={
              isTss
                ? 'Your encrypted MPC user key (Box A), as found on your recovery KeyCard.'
                : 'Your encrypted user key, as found on your recovery KeyCard.'
            }
            Label="Box A Value"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        {!isTss && (
          <div className="tw-mb-4">
            <FormikTextarea
              HelperText={backupKeyHelperText}
              Label="Box B Value"
              name="backupKey"
              rows={4}
              Width="fill"
            />
          </div>
        )}
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={
              isTss
                ? 'The common keychain (compressed secp256k1 public key, 66 hex chars) from Box C of your recovery KeyCard.'
                : 'The BitGo public key for the wallet, as found on your recovery KeyCard.'
            }
            Label={isTss ? 'Common Keychain (Box C)' : 'Box C Value'}
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
