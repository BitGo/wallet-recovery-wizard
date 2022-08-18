import { Outlet, useNavigate } from 'react-router-dom';
import {
  MenuItem,
  SelectAutocomplete,
  BackToHomeHeader,
  Button,
  CryptocurrencyIcon,
} from '../../components';

const availableCoins = [
  {
    Title: 'BTC',
    Description: 'Bitcoin',
    Icon: <CryptocurrencyIcon Name="btc" Size="large" />,
    value: 'btc',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'BCH',
    Description: 'Bitcoin Cash',
    Icon: <CryptocurrencyIcon Name="bch" Size="large" />,
    value: 'bch',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'LTC',
    Description: 'Litecoin',
    Icon: <CryptocurrencyIcon Name="ltc" Size="large" />,
    value: 'ltc',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'XRP',
    Description: 'Ripple',
    Icon: <CryptocurrencyIcon Name="xrp" Size="large" />,
    value: 'xrp',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'XLM',
    Description: 'Stellar',
    Icon: <CryptocurrencyIcon Name="xlm" Size="large" />,
    value: 'xlm',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'DASH',
    Description: 'Dash',
    Icon: <CryptocurrencyIcon Name="dash" Size="large" />,
    value: 'dash',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'ZEC',
    Description: 'ZCash',
    Icon: <CryptocurrencyIcon Name="zec" Size="large" />,
    value: 'zec',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'BTG',
    Description: 'Bitcoin Gold',
    Icon: <CryptocurrencyIcon Name="btg" Size="large" />,
    value: 'btg',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'ETH',
    Description: 'Ethereum',
    Icon: <CryptocurrencyIcon Name="eth" Size="large" />,
    value: 'eth',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'ERC20',
    Description: 'ERC20 Token',
    Icon: <CryptocurrencyIcon Name="eth" Size="large" />,
    value: 'erc20',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'TRX',
    Description: 'Tron',
    Icon: <CryptocurrencyIcon Name="trx" Size="large" />,
    value: 'trx',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
  {
    Title: 'BTV',
    Description: 'Bitcoin SV',
    Icon: <CryptocurrencyIcon Name="bsv" Size="large" />,
    value: 'bsv',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'BCHA',
    Description: 'Bitcoin ABC',
    value: 'bcha',
    isAvailable: {
      prod: true,
      test: false,
    },
  },
  {
    Title: 'EOS',
    Description: 'Eos',
    Icon: <CryptocurrencyIcon Name="eos" Size="large" />,
    value: 'eos',
    isAvailable: {
      prod: true,
      test: true,
    },
  },
];

export default function NonBitGoRecovery() {
  const env = 'prod'; //TODO: Get the actual environment via sdk call or props from Home
  const navigate = useNavigate();

  return (
    <div className="tw-min-h-screen">
      <BackToHomeHeader Title="Non-BitGo Recovery" />
      <div className="tw-flex tw-items-center tw-max-w-screen-lg tw-mx-auto tw-px-8">
        <div className="tw-flex tw-flex-col tw-flex-grow tw-px-8 tw-pb-8 tw-pt-12 tw-box-border">
          <div className="tw-mb-8 tw-text-center tw-text-label-1 tw-gray-900">
            Use your self-managed hot wallet recovery key card to create and
            broadcast a transaction without relying on BitGo.
          </div>
          <div className="tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-pt-8 tw-pb-4 tw-px-8">
            <div className="tw-mb-8">
              <SelectAutocomplete
                Label="Currency"
                HelperText="Temp helper text"
                Width="fill"
                onChange={event => {
                  navigate(`/non-bitgo-recovery/${event.currentTarget.value}`);
                }}
              >
                {availableCoins.reduce((displayedCoins, coin) => {
                  if (coin.isAvailable[env]) {
                    displayedCoins.push(
                      <MenuItem
                        Title={coin.Title}
                        Description={coin.Description}
                        IconLeft={coin.Icon}
                        value={coin.value}
                        Tag="button"
                      />
                    );
                  }
                  return displayedCoins;
                }, [] as React.ReactElement[])}
              </SelectAutocomplete>
            </div>
            <Outlet />
          </div>
          <div className="tw-flex tw-justify-between">
            <div className="tw-my-4">
              <Button Variant="secondary" Width="hug">
                Cancel
              </Button>
            </div>
            <div className="tw-my-4">
              <Button Variant="primary" Width="hug">
                Recover Funds
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
