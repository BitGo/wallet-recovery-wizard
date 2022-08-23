import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { CryptocurrencyIcon } from '../CryptocurrencyIcon';
import { SelectAutocomplete } from '../SelectAutocomplete';
import { SelectAutocompleteItem } from '../SelectAutocomplete/SelectAutocompleteItem';

const prod = [
  {
    Title: 'BTC',
    Description: 'Bitcoin',
    Icon: 'btc',
    value: 'btc',
  },
  {
    Title: 'BCH',
    Description: 'Bitcoin Cash',
    Icon: 'bch',
    value: 'bch',
  },
  {
    Title: 'LTC',
    Description: 'Litecoin',
    Icon: 'ltc',
    value: 'ltc',
  },
  {
    Title: 'XRP',
    Description: 'Ripple',
    Icon: 'xrp',
    value: 'xrp',
  },
  {
    Title: 'XLM',
    Description: 'Stellar',
    Icon: 'xlm',
    value: 'xlm',
  },
  {
    Title: 'DASH',
    Description: 'Dash',
    Icon: 'dash',
    value: 'dash',
  },
  {
    Title: 'ZEC',
    Description: 'ZCash',
    Icon: 'zec',
    value: 'zec',
  },
  {
    Title: 'BTG',
    Description: 'Bitcoin Gold',
    Icon: 'btg',
    value: 'btg',
  },
  {
    Title: 'ETH',
    Description: 'Ethereum',
    Icon: 'eth',
    value: 'eth',
  },
  {
    Title: 'ERC20',
    Description: 'ERC20 Token',
    Icon: 'eth',
    value: 'erc20',
  },
  {
    Title: 'TRX',
    Description: 'Tron',
    Icon: 'trx',
    value: 'trx',
  },
  {
    Title: 'BTV',
    Description: 'Bitcoin SV',
    Icon: 'bsv',
    value: 'bsv',
  },
  {
    Title: 'BCHA',
    Description: 'Bitcoin ABC',
    value: 'bcha',
    Icon: undefined,
  },
  {
    Title: 'EOS',
    Description: 'Eos',
    Icon: 'eos',
    value: 'eos',
  },
] as const;

const test = [
  {
    Title: 'BTC',
    Description: 'Bitcoin',
    Icon: 'btc',
    value: 'btc',
  },
  {
    Title: 'XRP',
    Description: 'Ripple',
    Icon: 'xrp',
    value: 'xrp',
  },
  {
    Title: 'XLM',
    Description: 'Stellar',
    Icon: 'xlm',
    value: 'xlm',
  },
  {
    Title: 'ETH',
    Description: 'Ethereum',
    Icon: 'eth',
    value: 'eth',
  },
  {
    Title: 'ERC20',
    Description: 'ERC20 Token',
    Icon: 'eth',
    value: 'erc20',
  },
  {
    Title: 'TRX',
    Description: 'Tron',
    Icon: 'trx',
    value: 'trx',
  },
  {
    Title: 'EOS',
    Description: 'Eos',
    Icon: 'eos',
    value: 'eos',
  },
] as const;

export type RecoveryCoinsSelectAutocompleteProps = {
  BitGoEnvironment: 'prod' | 'test';
};

export function RecoveryCoinsSelectAutocomplete({
  BitGoEnvironment,
}: RecoveryCoinsSelectAutocompleteProps) {
  const navigate = useNavigate();
  const BitGoEnvironmentTitle =
    BitGoEnvironment === 'prod' ? 'Mainnet' : 'Testnet';
  const data = BitGoEnvironment === 'prod' ? prod : test;
  const children = data.map(coin => (
    <SelectAutocompleteItem
      key={coin.value}
      Title={coin.Title}
      Description={coin.Description}
      IconLeft={
        coin.Icon ? (
          <CryptocurrencyIcon Name={coin.Icon} Size="large" />
        ) : undefined
      }
      value={coin.value}
      Tag="button"
    />
  ));

  return (
    <SelectAutocomplete
      Label="Currency"
      HelperText={
        <div>
          <span className="tw-text-gray-700">
            Current environment: &nbsp;
            <span className="tw-font-semibold">{BitGoEnvironmentTitle}</span>.
            &nbsp;
          </span>
          <Link
            to="/"
            className={clsx('tw-text-blue-200', 'hover:tw-underline')}
          >
            Go back to change &rarr;
          </Link>
        </div>
      }
      Width="fill"
      onChange={event => {
        navigate(
          `/non-bitgo-recovery/${BitGoEnvironment}/${event.currentTarget.value}`
        );
      }}
    >
      {children}
    </SelectAutocomplete>
  );
}
