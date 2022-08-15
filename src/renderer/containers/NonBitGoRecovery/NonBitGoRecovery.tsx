import {
  Icon,
  MenuItem,
  SelectAutocomplete,
  BackToHomeHeader,
  Button,
} from '../../components';

export default function NonBitGoRecovery() {
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
              >
                <MenuItem
                  Title="Menu Item 1"
                  Description="Testnet Bitcoin"
                  IconLeft={<Icon Name="download" Size="large" />}
                  Tag="button"
                  value="1"
                />
                <MenuItem Title="Ethereum" />
              </SelectAutocomplete>
            </div>
            <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-pb-2">
              Self-managed hot wallet details
            </h4>
            <p className="tw-text-center tw-text-label-2 tw-font-medium tw-py-8 tw-border tw-border-dashed tw-my-4 tw-rounded tw-text-gray-700 tw-border-gray-700">
              Please select a currency above.
            </p>
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
