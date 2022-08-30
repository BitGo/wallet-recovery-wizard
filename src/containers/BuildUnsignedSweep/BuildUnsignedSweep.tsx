import * as React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  AlertBanner,
  BackToHomeHeader,
  CoinsSelectAutocomplete,
  Icon,
} from '~/components';
import { AlertBannerContext } from '~/contexts';
import { BuildUnsignedSweepIndex } from './BuildUnsignedSweepIndex';
import { Coin } from './Coin';

export default function NonBitGoRecovery() {
  const { env } = useParams<'env' | 'coin'>();
  const navigate = useNavigate();

  const alertState = React.useState<string | undefined>();
  const [alert] = alertState;

  if (env !== 'prod' && env !== 'test') {
    throw new Error('env is not defined.');
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
        <BackToHomeHeader Title="Build Unsigned Sweep" />
        {alertBanner}
      </div>
      <div className="tw-flex tw-items-center tw-max-w-screen-lg tw-mx-auto tw-px-8">
        <div className="tw-flex tw-flex-col tw-flex-grow tw-px-8 tw-pb-8 tw-pt-12 tw-box-border">
          <div className="tw-mb-8 tw-text-center tw-text-label-1 tw-gray-900">
            This tool will construct an unsigned sweep transaction on the wallet
            you specify without using BitGo.
          </div>
          <div className="tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-pt-8 tw-pb-4 tw-px-8">
            <div className="tw-mb-8">
              <CoinsSelectAutocomplete
                onChange={event => {
                  navigate(
                    `/${env}/build-unsigned-sweep/${event.currentTarget.value}`
                  );
                }}
              />
            </div>
            <AlertBannerContext.Provider value={alertState}>
              <Routes>
                <Route index element={<BuildUnsignedSweepIndex />} />
                <Route path=":coin" element={<Coin />} />
              </Routes>
            </AlertBannerContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
