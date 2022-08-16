import { Outlet, useNavigate } from 'react-router-dom';
import {
  MenuItem,
  SelectAutocomplete,
  BackToHomeHeader,
  Button,
  CryptocurrencyIcon,
} from '../../components';

export default function NonBitGoRecovery() {
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
                  navigate(`/non-bitgo-recovery/${event.currentTarget.value}`)
                }}
              >
                <MenuItem
                  Title="BTC"
                  Description="Bitcoin"
                  IconLeft={<CryptocurrencyIcon Name="btc" Size="large" />}
                  Tag="button"
                  value="btc"
                />
                <MenuItem
                  Title="ETH"
                  Description="Ethereum"
                  IconLeft={<CryptocurrencyIcon Name="eth" Size="large" />}
                  Tag="button"
                  value="eth"
                />
                <MenuItem
                  Title="XRP"
                  Description="Ripple"
                  IconLeft={<CryptocurrencyIcon Name="xrp" Size="large" />}
                  Tag="button"
                  value="xrp"
                />
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
