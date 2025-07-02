import { CoinMetadata } from '~/helpers/config';
import { CryptocurrencyIcon, CryptocurrencyIconNew } from '../CryptocurrencyIcon';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectAutocompleteItem } from '../SelectAutocomplete/SelectAutocompleteItem';

export type CoinsSelectAutocompleteProps = {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  coins: readonly CoinMetadata[];
  selectedCoin?: string;
  helperText?: React.ReactNode;
};

export function CoinsSelectAutocomplete({
  onChange,
  coins,
  selectedCoin,
  helperText,
}: CoinsSelectAutocompleteProps) {
  const children = coins.map(coin => (
    <SelectAutocompleteItem
      key={coin.value}
      Title={coin.Title}
      Description={coin.Description}
      IconLeft={
        coin.Icon ? (
          <CryptocurrencyIconNew Name={coin.Icon} Size="large" />
        ) : undefined
      }
      value={coin.value}
      Tag="button"
    />
  ));

  return (
    <SelectAutocomplete
      Label="Currency"
      HelperText={helperText}
      Width="fill"
      value={selectedCoin}
      onChange={onChange}
    >
      {children}
    </SelectAutocomplete>
  );
}
