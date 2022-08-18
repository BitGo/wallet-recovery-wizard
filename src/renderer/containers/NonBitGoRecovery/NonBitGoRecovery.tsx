import { Outlet } from 'react-router-dom';
import {
  BackToHomeHeader,
  Button,
  RecoveryCoinsSelectAutocomplete
} from '../../components';

export type NonBitGoRecoveryProps = {
  BitGoEnvironment: "prod" | "test"
};

export default function NonBitGoRecovery({BitGoEnvironment} : NonBitGoRecoveryProps) {

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
              <RecoveryCoinsSelectAutocomplete BitGoEnvironment={BitGoEnvironment} />
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
