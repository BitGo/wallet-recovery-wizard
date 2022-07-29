import { EnvironmentName } from '@bitgo/sdk-core';
import { NetworkType } from '@bitgo/statics';
import { BitGo } from 'bitgo';
import React, { useContext } from 'react';

export const sessionStorageName = 'bitgo-session';
export const accessTokenStorageName = 'bitgo-access-token';

export type EnvironmentContextValue = {
  network: NetworkType;
  environment: EnvironmentName;
  bitgo: BitGo;
  setNetwork: (string: NetworkType) => void;
};

export const BitgoEnvironmentContext = React.createContext<EnvironmentContextValue | undefined>(undefined);

export function useBitGoEnvironment() {
  const bitgoEnvironmentContextValues = useContext(BitgoEnvironmentContext);
  if (bitgoEnvironmentContextValues === undefined) {
    throw new Error('useBitGoEnvironment can only be used within a BitGoEnvironmentProvider');
  }
  return bitgoEnvironmentContextValues;
}

export function BitGoEnvironmentProvider({ children }) {
  const [network, setNetwork] = React.useState(NetworkType.TESTNET);
  const environment: EnvironmentName = NetworkType.MAINNET ? 'prod' : 'test';

  const bitgo = React.useMemo(() => {
    const existingSession = window.sessionStorage.getItem(sessionStorageName);
    const existingToken = window.sessionStorage.getItem(accessTokenStorageName);
    const parsedSession = existingSession ? JSON.parse(existingSession) : undefined;
    const parsedToken: string = existingToken ? JSON.parse(existingToken) : undefined;

    return new BitGo({
      env: environment,
      accessToken: parsedSession && new Date(parsedSession.expires) > new Date() ? parsedToken : undefined,
    });
  }, [environment]);

  return (
    <BitgoEnvironmentContext.Provider
      value={React.useMemo(() => ({ bitgo, environment, network, setNetwork }), [network, environment, bitgo])}
    >
      {children}
    </BitgoEnvironmentContext.Provider>
  );
}
