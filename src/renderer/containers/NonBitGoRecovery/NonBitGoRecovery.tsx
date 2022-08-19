import * as React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import {
  AlertBanner,
  BackToHomeHeader,
  Button,
  Icon,
  RecoveryCoinsSelectAutocomplete,
} from '../../components';

export default function NonBitGoRecovery() {
  const params = useParams<'BitGoEnvironment'>();

  const alertState = React.useState<string | undefined>();
  const [alert] = alertState;

  const BitGoEnvironment = params.BitGoEnvironment;
  if (BitGoEnvironment !== 'prod' && BitGoEnvironment !== 'test') {
    throw new Error('BitGo Environment is not defined.');
  }

  const alertBanner = alert ? (
    <AlertBanner
      Variant="destructive"
      IconLeft={<Icon Name="warning-sign" Size="small" />}
    >
      {alert}
    </AlertBanner>
  ) : undefined;
  return (
    <div className="tw-min-h-screen">
      <div className="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-z-20">
        <BackToHomeHeader Title="Non-BitGo Recovery" />
        {alertBanner}
      </div>
      <div className="tw-flex tw-items-center tw-max-w-screen-lg tw-mx-auto tw-px-8">
        <div className="tw-flex tw-flex-col tw-flex-grow tw-px-8 tw-pb-8 tw-pt-12 tw-box-border">
          <div className="tw-mb-8 tw-text-center tw-text-label-1 tw-gray-900">
            Use your self-managed hot wallet recovery key card to create and
            broadcast a transaction without relying on BitGo.
          </div>
          <div className="tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-pt-8 tw-pb-4 tw-px-8">
            <div className="tw-mb-8">
              <RecoveryCoinsSelectAutocomplete
                BitGoEnvironment={BitGoEnvironment}
              />
            </div>
            <Outlet context={alertState}/>
          </div>
          <div className="tw-flex tw-flex-col-reverse sm:tw-justify-between sm:tw-flex-row tw-gap-1 tw-mt-4">
            <Button Variant="secondary" Width="hug" form="non-bitgo-recovery-form" type="reset">
              Cancel
            </Button>
            <Button Variant="primary" Width="hug" form="non-bitgo-recovery-form" type="submit">
              Recover Funds
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
