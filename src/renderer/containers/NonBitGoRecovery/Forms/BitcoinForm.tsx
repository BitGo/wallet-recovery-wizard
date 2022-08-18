import {
  Icon,
  Notice,
  Selectfield,
  Textarea,
  Textfield,
} from '../../../components';

export default function BitcoinForm() {
  return (
    <>
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
          Label="Key Recovery Service"
          HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
        >
          <option value="none">None</option>
          <option value="keyternal">Keyternal</option>
          <option value="bitGoKRS">BitGo KRS</option>
          <option value="coincover">Coincover</option>
        </Selectfield>
      </div>
      <div className="tw-mb-4">
        <Textarea
          Label="API Key"
          HelperText="An API-Key Token from etherscan.com required for Ethereum Mainnet recoveries."
          placeholder="Enter API key..."
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          Label="Box A Value"
          HelperText="An API-Key Token required to fetch information from the external service and perform recoveries."
          placeholder='Enter the "A: User Key" from your BitGo keycard...'
          rows={4}
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          Label="Box B Value"
          HelperText="TEMP: This one needs to be changed depending on key recovery service."
          placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
          rows={4}
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          Label="Box C Value"
          HelperText="The BitGo public key for the wallet, as found on your BitGo recovery keycard."
          placeholder='Enter the "C: BitGo Public Key" from your BitGo keycard...'
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          Width="fill"
          Label="Wallet Passphrase"
          HelperText="The passphrase of the wallet."
          placeholder="Enter your wallet password..."
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          Width="fill"
          Label="Destination Address"
          HelperText="The address your recovery transaction will send to."
          placeholder="Enter destination address..."
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          Label="Address Scanning Factor"
          HelperText="The amount of addresses without transactions to scan before stopping the tool."
          Width="hug"
          size={3}
          defaultValue={20}
        />
      </div>
    </>
  );
}
