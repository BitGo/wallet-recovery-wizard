import { Selectfield, Textarea, Textfield } from '../../../components';

export default function EthereumForm() {
  return (
    <>
      <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-pb-2">
        Self-managed hot wallet details
      </h4>
      <div className="tw-my-4">
        <Selectfield
          name="krsProvider"
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
        <Textfield
          name="apiKey"
          Label="API Key"
          HelperText="An API-Key Token from etherscan.com required for Ethereum Mainnet recoveries."
          placeholder="Enter API key..."
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          name="userKey"
          Label="Box A Value"
          HelperText="Your encrypted user key, as found on your BitGo recovery keycard."
          placeholder='Enter the "A: User Key" from your BitGo keycard...'
          rows={4}
        />
      </div>
      <div className="tw-mb-4">
        <Textarea
          name="backupKey"
          Label="Box B Value"
          HelperText="TEMP: This one needs to be changed depending on key recovery service."
          placeholder='Enter the "B: Backup Key" from your BitGo keycard...'
          rows={4}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="walletContractAddress"
          Width="fill"
          Label="Wallet Contract Address"
          HelperText="The ETH address of the wallet contract. This is also the wallet's base address."
          placeholder="Enter wallet contract address..."
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="walletPassphrase"
          Width="fill"
          Label="Wallet Passphrase"
          HelperText="The passphrase of the wallet."
          placeholder="Enter your wallet password..."
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="recoveryDestination"
          Width="fill"
          Label="Destination Address"
          HelperText="The address your recovery transaction will send to."
          placeholder="Enter destination address..."
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="gasLimit"
          Width="fill"
          Label="Gas limit"
          HelperText="Gas limit for the ETH transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas."
          defaultValue={500000}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="maxFeePerGas"
          Width="fill"
          Label="Max Fee Per Gas (Gwei)"
          HelperText="Max fee per gas for the ETH transaction. The default is 20 Gwei."
          defaultValue={20}
        />
      </div>
      <div className="tw-mb-4">
        <Textfield
          name="maxPriorityFeePerGas"
          Width="fill"
          Label="Max Priority Fee Per Gas (Gwei)"
          HelperText='"Tip" to the ETH miner. The default is 10 Gwei.'
          defaultValue={10}
        />
      </div>
    </>
  );
}
