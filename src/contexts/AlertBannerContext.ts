import * as React from 'react';

type AlertBannerContextValue = [
  string | undefined,
  React.Dispatch<React.SetStateAction<string | undefined>>
];

export const AlertBannerContext =
  React.createContext<AlertBannerContextValue | undefined>(undefined);

export const useAlertBanner = () => {
  const alertBanner = React.useContext(AlertBannerContext);

  if (alertBanner === undefined) {
    throw new Error('useAlertBanner must be used within a AlertBannerProvider');
  }

  return alertBanner;
};
