import { WalletMetadata } from '~/helpers/config';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectAutocompleteItem } from '../SelectAutocomplete/SelectAutocompleteItem';

export type WalletsSelectAutocompleteProps = {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  wallets: readonly WalletMetadata[];
  selectedWallet?: string;
  helperText?: React.ReactNode;
};

export function WalletTypeSelect({
  onChange,
  wallets,
  selectedWallet,
  helperText,
}: WalletsSelectAutocompleteProps) {
  const children = wallets.map(wallet => (
    <SelectAutocompleteItem
      key={wallet.value}
      Title={wallet.Title}
      Description={wallet.Description}
      value={wallet.value}
      Tag="button"
    />
  ));

  return (
    <SelectAutocomplete
      Label="Wallet"
      HelperText={helperText}
      Width="fill"
      value={selectedWallet}
      onChange={onChange}
    >
      {children}
    </SelectAutocomplete>
  );
}
