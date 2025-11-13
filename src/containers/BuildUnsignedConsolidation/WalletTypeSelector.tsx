import { FormikSelectfield } from '~/components';

export function WalletTypeSelector() {
  return (
    <div className="tw-mb-4">
      <FormikSelectfield
        HelperText="Select the type of wallet you are recovering from."
        Label="Wallet Type"
        name="walletType"
        Width="fill"
      >
        <option value="cold">Cold Wallet (Self-managed)</option>
        <option value="hot">Hot Wallet (Self-managed)</option>
      </FormikSelectfield>
    </div>
  );
}

