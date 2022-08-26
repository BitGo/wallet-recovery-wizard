import clsx from 'clsx';
import { Link, useParams } from 'react-router-dom';
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
    Title: 'ERC',
    Description: 'ERC20 Token',
    Icon: 'eth',
    value: 'erc',
  },
  {
    Title: 'TRX',
    Description: 'Tron',
    Icon: 'trx',
    value: 'trx',
  },
  {
    Title: 'BSV',
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
    Title: 'TBTC',
    Description: 'Testnet Bitcoin',
    Icon: 'btc',
    value: 'tbtc',
  },
  {
    Title: 'TXRP',
    Description: 'Testnet Ripple',
    Icon: 'xrp',
    value: 'txrp',
  },
  {
    Title: 'TXLM',
    Description: 'Testnet Stellar',
    Icon: 'xlm',
    value: 'txlm',
  },
  {
    Title: 'GTETH',
    Description: 'Goerli Testnet Ethereum',
    Icon: 'eth',
    value: 'gteth',
  },
  {
    Title: 'GTERC',
    Description: 'Goerli Testnet ERC20 Token',
    Icon: 'eth',
    value: 'gterc',
  },
  {
    Title: 'TTRX',
    Description: 'Testnet Tron',
    Icon: 'trx',
    value: 'ttrx',
  },
  {
    Title: 'TEOS',
    Description: 'Testnet Eos',
    Icon: 'eos',
    value: 'teos',
  },
] as const;

export type CoinsSelectAutocompleteProps = {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export function CoinsSelectAutocomplete({
  onChange,
}: CoinsSelectAutocompleteProps) {
  const { env = 'test' } = useParams<'env'>();
  const envTitle = env === 'prod' ? 'Mainnet' : 'Testnet';
  const data = env === 'prod' ? prod : test;
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
            <span className="tw-font-semibold">{envTitle}</span>. &nbsp;
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
      onChange={onChange}
    >
      {children}
    </SelectAutocomplete>
  );
}
