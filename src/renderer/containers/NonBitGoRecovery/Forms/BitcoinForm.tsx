import * as Yup from 'yup';
import { useFormik } from 'formik';
import {
  Icon,
  Notice,
  Selectfield,
  Textarea,
  Textfield,
} from '../../../components';
import { useOutletContext } from 'react-router-dom';

const validationSchema = Yup.object({
  krsProvider: Yup.string().required(),
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.string().required(),
});

export default function BitcoinForm() {
  const [, setAlert] =
    useOutletContext<
      [
        string | undefined,
        React.Dispatch<React.SetStateAction<string | undefined>>
      ]
    >();

  const { handleSubmit, handleChange, handleBlur, touched, errors } = useFormik({
    initialValues: {
      krsProvider: '',
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      recoveryDestination: '',
      scan: '20',
    },
    validationSchema,
    async onSubmit() {
      setAlert("WARNING!");
    },
  });

  return (
    <form onSubmit={handleSubmit}
      onReset={() => setAlert(undefined)}
    id="non-bitgo-recovery-form"
    >
      <div className="tw-mb-8">
        <Notice
          Variant="Secondary"
          IconLeft={<Icon Name="warning-sign" Size="small" />}
        >
          Temp text.
        </Notice>
      </div>
      <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-pb-2">
        Self-managed hot wallet details
      </h4>
      <div className="tw-my-4">
        <Selectfield
          Invalid={touched.krsProvider && !!errors.krsProvider}
          name="krsProvider"
          Label="Key Recovery Service"
          HelperText={touched.krsProvider && errors.krsProvider ? errors.krsProvider : "The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">None</option>
          <option value="keyternal">Keyternal</option>
          <option value="bitgoKRSv2">BitGo KRS</option>
          <option value="dai">Coincover</option>
        </Selectfield>
      </div>
      <div className="tw-mb-4">
        <Textarea
          name="userKey"
          Label="Box A Value"
          HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
          placeholder='Enter the "A: User Key" from your BitGo keycard...'
          rows={4}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          name="backupKey"
          Label="Box B Value"
          HelperText="TEMP: This one needs to be changed depending on key recovery service."
          placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
          rows={4}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          name="bitgoKey"
          Label="Box C Value"
          HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
          placeholder='Enter the "C: BitGo Public Key" from your BitGo keycard...'
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="walletPassphrase"
          Width="fill"
          Label="Wallet Passphrase"
          HelperText="The passphrase of the wallet."
          placeholder="Enter your wallet password..."
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="recoveryDestination"
          Width="fill"
          Label="Destination Address"
          HelperText="The address your recovery transaction will send to."
          placeholder="Enter destination address..."
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="scan"
          Label="Address Scanning Factor"
          HelperText="The amount of addresses without transactions to scan before stopping the tool."
          Width="fill"
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </form>
  );
}
