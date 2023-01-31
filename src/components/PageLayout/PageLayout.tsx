import * as React from 'react';
import { AlertBanner, BackToHomeHeader, Icon } from '~/components';
import { AlertBannerContext } from '~/contexts';

export type PageLayoutProps = {
  Title: string;
  Description: string;
};

export function PageLayout({
  Title,
  Description,
  children,
}: React.PropsWithChildren<PageLayoutProps>) {
  const alertState = React.useState<string | undefined>();
  const [alert] = alertState;

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
        <BackToHomeHeader Title={Title} />
        {alertBanner}
      </div>
      <div className="tw-flex tw-items-center tw-max-w-screen-lg tw-mx-auto tw-px-8">
        <div className="tw-flex tw-flex-col tw-flex-grow tw-px-8 tw-pb-8 tw-pt-12 tw-box-border">
          <div className="tw-mb-8 tw-text-center tw-text-label-1 tw-gray-900">
            {Description}
          </div>
          <div className="tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-pt-8 tw-pb-4 tw-px-8">
            <AlertBannerContext.Provider value={alertState}>
              {children}
            </AlertBannerContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}
