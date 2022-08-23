import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import {
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '../../../components';
import { useOutletContext, useParams } from 'react-router-dom';
import { useElectronCommand, useElectronQuery } from '../../../hooks';

const validationSchema = Yup.object({
  krsProvider: Yup.mixed()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.string().required(),
});

export default function BitcoinForm() {
  const params = useParams<'BitGoEnvironment'>();
  const BitGoEnvironment = params.BitGoEnvironment;
  const coinTicker = BitGoEnvironment === 'prod' ? 'btc' : 'tbtc';

  const [, setAlert] =
    useOutletContext<
      [
        string | undefined,
        React.Dispatch<React.SetStateAction<string | undefined>>
      ]
    >();

  const [recover, recoverPayload] = useElectronCommand('recover');
  const [showSaveDialog, showSaveDialogPayload] = useElectronCommand('showSaveDialog');
  const [writeFile, writeFilePayload] = useElectronCommand('writeFile');
  const chainPayload = useElectronQuery('getChain', [coinTicker]);

  React.useEffect(() => {
    if (recoverPayload.state === 'success') {
      console.log(`type: ${typeof recoverPayload.data} data: ${recoverPayload.data}`);
      let recoveryTransaction;
      if ('txHex' in recoverPayload.data) {
        recoveryTransaction = recoverPayload.data.txHex;
      } else if ('transactionHex' in recoverPayload.data) {
        recoveryTransaction = recoverPayload.data.transactionHex;
      }

      if (!recoveryTransaction) {
        setAlert('Fully-signed recovery transaction not detected.');
        return;
      }

      const fileName = chainPayload.data + '-recovery-' + Date.now().toString() + '.json';
      const dialogParams = {
        filters: [
          {
            name: 'Custom File Type',
            extensions: ['json'],
          },
        ],
        defaultPath: `~/${fileName}`,
      };

      showSaveDialog(dialogParams);

    } else if (
      recoverPayload.state === 'failure' &&
      recoverPayload.error instanceof Error
    ) {
      setAlert(
        recoverPayload.error.message.replace(
          "Error invoking remote method 'recover': ",
          ''
        )
      );
    }
  }, [recoverPayload, setAlert, showSaveDialog]);

  React.useEffect(() => {
    if (showSaveDialogPayload.state === 'success' && recoverPayload.state === 'success') {
      if (showSaveDialogPayload.data.filePath) {
        writeFile(showSaveDialogPayload.data.filePath, JSON.stringify(recoverPayload.data, null, 2), {encoding: 'utf-8'});
      }
    }
  }, [showSaveDialogPayload, writeFile, recoverPayload])

  return (
    <Formik
      initialValues={{
        userKey: '',
        backupKey: '',
        bitgoKey: '',
        walletPassphrase: '',
        recoveryDestination: '',
        scan: '20',
        krsProvider: '',
      }}
      validationSchema={validationSchema}
      onSubmit={async values => {
        console.log(values);
        recover(coinTicker, {
          ...values,
          scan: Number(values.scan),
          ignoreAddressTypes: ['p2wsh'],
        });
      }}
    >
      <Form id="non-bitgo-recovery-form">
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
          <FormikSelectfield
            name="krsProvider"
            Label="Key Recovery Service"
            HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
          >
            <option value="">None</option>
            <option value="keyternal">Keyternal</option>
            <option value="bitgoKRSv2">BitGo KRS</option>
            <option value="dai">Coincover</option>
          </FormikSelectfield>
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            name="userKey"
            Label="Box A Value"
            HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
            placeholder='Enter the "A: User Key" from your BitGo keycard...'
            rows={4}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            name="backupKey"
            Label="Box B Value"
            HelperText="TEMP: This one needs to be changed depending on key recovery service."
            placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
            rows={4}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="bitgoKey"
            Label="Box C Value"
            HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
            placeholder='Enter the "C: BitGo Public Key" from your BitGo keycard...'
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="walletPassphrase"
            Width="fill"
            Label="Wallet Passphrase"
            HelperText="The passphrase of the wallet."
            placeholder="Enter your wallet password..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="recoveryDestination"
            Width="fill"
            Label="Destination Address"
            HelperText="The address your recovery transaction will send to."
            placeholder="Enter destination address..."
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="scan"
            Label="Address Scanning Factor"
            HelperText="The amount of addresses without transactions to scan before stopping the tool."
            Width="fill"
          />
        </div>
      </Form>
    </Formik>
  );
}
