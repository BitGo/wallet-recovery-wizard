import * as React from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import {
  Button,
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

export default function EthereumForm() {
  const params = useParams<'BitGoEnvironment' | '*'>();
  const BitGoEnvironment = params.BitGoEnvironment;
  const coinTicker = BitGoEnvironment === 'prod' ? 'eth' : 'gteth';

  const [, setAlert] =
    useOutletContext<
      [
        string | undefined,
        React.Dispatch<React.SetStateAction<string | undefined>>
      ]
    >();

  const isRecovering = React.useRef(false);

  const [recover, recoverPayload] = useElectronCommand('recover');
  const [showSaveDialog, showSaveDialogPayload] =
    useElectronCommand('showSaveDialog');
  const [writeFile, writeFilePayload] = useElectronCommand('writeFile');
  const chainPayload = useElectronQuery('getChain', [coinTicker]);

  const isLoading =
    recoverPayload.state === 'loading' ||
    showSaveDialogPayload.state === 'loading' ||
    writeFilePayload.state === 'loading' ||
    chainPayload.state === 'loading';
  const recoverButtonLabel = isLoading ? 'Recovering...' : 'Recover Funds';

  React.useEffect(() => {
    if (recoverPayload.state === 'success') {
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

      const fileName =
        chainPayload.data + '-recovery-' + Date.now().toString() + '.json';
      const dialogParams = {
        filters: [
          {
            name: 'Custom File Type',
            extensions: ['json'],
          },
        ],
        defaultPath: `~/${fileName}`,
      };

      isRecovering.current = false;
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
      isRecovering.current = false;
    } else if (recoverPayload.state === 'loading') {
      isRecovering.current = true;
    }
  }, [recoverPayload, setAlert, showSaveDialog]);

  React.useEffect(() => {
    if (
      showSaveDialogPayload.state === 'success' &&
      recoverPayload.state === 'success' &&
      !isRecovering.current
    ) {
      //Removing recoverPayload as a dependency fixes stale showSaveDialogPayload.state
      if (showSaveDialogPayload.data.filePath) {
        writeFile(
          showSaveDialogPayload.data.filePath,
          JSON.stringify(recoverPayload.data, null, 2),
          { encoding: 'utf-8' }
        );
      }
    }
  }, [showSaveDialogPayload, recoverPayload, writeFile]);

  return (
    <Formik
      initialValues={{
        apiKey: '',
        userKey: '',
        backupKey: '',
        bitgoKey: '',
        walletContractAddress: '',
        walletPassphrase: '',
        recoveryDestination: '',
        gasLimit: '500000',
        maxFeePerGas: '20',
        maxPriorityFeePerGas: '10',
        krsProvider: '',
      }}
      validationSchema={validationSchema}
      onSubmit={async values => {
        recover(coinTicker, {
          ...values,
          ignoreAddressTypes: [],
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
          <FormikTextfield
            name="apiKey"
            Width="fill"
            Label="API Key"
            HelperText="An API-Key Token from etherscan.com required for Ethereum Mainnet recoveries."
            placeholder="Enter API key..."
          />
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
            name="walletContractAddress"
            Width="fill"
            Label="Wallet Contract Address"
            HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
            placeholder="Enter wallet contract address..."
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
            name="gasLimit"
            Width="fill"
            Label="Gas limit"
            HelperText="Gas limit for the ETH transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas."
            defaultValue={500000}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="maxFeePerGas"
            Width="fill"
            Label="Max Fee Per Gas (Gwei)"
            HelperText="Max fee per gas for the ETH transaction. The default is 20 Gwei."
            defaultValue={20}
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            name="maxPriorityFeePerGas"
            Width="fill"
            Label="Max Priority Fee Per Gas (Gwei)"
            HelperText='"Tip" to the ETH miner. The default is 10 Gwei.'
            defaultValue={10}
          />
        </div>
        <div className="tw-flex tw-flex-col-reverse sm:tw-justify-between sm:tw-flex-row tw-gap-1 tw-mt-4">
          <Button
            Variant="secondary"
            Width="hug"
            form="non-bitgo-recovery-form"
            type="reset"
          >
            Cancel
          </Button>
          <Button
            Variant="primary"
            Width="hug"
            form="non-bitgo-recovery-form"
            type="submit"
            Disabled={isLoading}
            disabled={isLoading}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              if (params['*'] === '') {
                event.preventDefault();
                setAlert('Please select a currency.');
              }
            }}
          >
            {recoverButtonLabel}
          </Button>
        </div>
      </Form>
    </Formik>
  );
}
