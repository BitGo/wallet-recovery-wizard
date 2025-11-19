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

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  recoveryDestination: Yup.string().required(),
  jettonMasterContract: Yup.string().required(
    'Jetton master contract is required'
  ),
  senderJettonAddress: Yup.string().required(
    'Sender Jetton address is required'
  ),
  userKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  apiKey: Yup.string().required('API Key is required'),
}).required();

export type TonTokenFormProps = {
  onSubmit: (
    values: TonTokenFormValues,
    formikHelpers: FormikHelpers<TonTokenFormValues>
  ) => void | Promise<void>;
};

type TonTokenFormValues = Yup.Asserts<typeof validationSchema>;

export function TonTokenForm({ onSubmit }: TonTokenFormProps) {
  const formik = useFormik<TonTokenFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      bitgoKey: '',
      krsProvider: '',
      recoveryDestination: '',
      jettonMasterContract: '',
      senderJettonAddress: '',
      userKey: '',
      walletPassphrase: '',
      apiKey: '',
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
            HelperText="The Jetton master contract address. This is the main contract address for the token."
            Label="Jetton Master Contract"
            name="jettonMasterContract"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The sender's Jetton wallet address. This is the Jetton address associated with your wallet."
            Label="Sender Jetton Address"
            name="senderJettonAddress"
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
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An API Key from toncenter.com"
            Label="API Key"
            name="apiKey"
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
