import React, { useContext } from 'react';

import { useBitGoEnvironment } from './bitgo-environment';
import { AppToaster } from '../modules/lumina/components/toaster/toaster';

export const sessionStorageName = 'bitgo-session';
export const userStorageName = 'bitgo-user';

const existingUser = window.sessionStorage.getItem(userStorageName);
const existingSession = window.sessionStorage.getItem(sessionStorageName);
const parsedSession = existingSession ? JSON.parse(existingSession) : null;
const parsedUser = existingUser ? JSON.parse(existingUser) : null;

// TODO(louis): cannot find response type for https://app.bitgo-test.com/api/auth/v1/session in Bitgo SDK, but in common - "@bitgo/common-interface/dist/src/client-models/login-response/login-response.model.d.ts"
export interface BitgoSession {
  client: string;
  created: string;
  expires: string;
  id: string;
  ip: string;
  ipRestrict: string[];
  isExtensible: false;
  label: string;
  origin: string;
  scope: string[];
  user: string;
}

export interface BitgoUser {
  agreements: unknown;
  allowedCoins: string[];
  country: string;
  currency: unknown;
  disableReset2FA: boolean;
  ecdhKeychain: string;
  email: unknown;
  enterprises: unknown;
  featureFlags: string[];
  forceResetPassword: boolean;
  id: string;
  identity: unknown;
  isActive: boolean;
  lastLogin: string;
  name: unknown;
  otpDevices: unknown;
  phone: unknown;
  portfolioTaxOrgPermissions: unknown;
  rateLimits: unknown;
  referrer: unknown;
  signupDomain: string;
  timezone: string;
  username: string;
}

export type SessionProviderProps = {
  session: BitgoSession;
  setSession: (session: BitgoSession) => void;
  user: BitgoUser;
  setUser: (user: BitgoUser) => void;
  endSession: () => Promise<void>;
};

export const SessionContext = React.createContext<SessionProviderProps>({} as SessionProviderProps);

export function useSession() {
  return useContext<SessionProviderProps>(SessionContext);
}

export function SessionProvider({ children }) {
  const [session, setSession] = React.useState<BitgoSession>(parsedSession);
  const [user, setUser] = React.useState<BitgoUser>(parsedUser);
  const { bitgo } = useBitGoEnvironment();

  const endSession = React.useCallback(async () => {
    window.sessionStorage.clear();
    try {
      const session = await bitgo.session();
      // Logout invalidates the access token and so we don't want to invalidate
      // the user's access token if they used that to auth. The only way to tell
      // if the access token was used for authenticating is to check if there's a
      // label on the session. If no label is present then the user used
      // credentials to log in.
      if (!session.label) {
        await this.bitgoSDK.logout();
      }
      AppToaster.show({
        message: "You've been logged out.",
      });
    } catch (e) {
      console.error('Error logging out', e);
      throw e;
    }
  }, [bitgo]);

  return (
    <SessionContext.Provider
      value={React.useMemo(() => ({ session, setSession, user, setUser, endSession }), [session, user, endSession])}
    >
      {children}
    </SessionContext.Provider>
  );
}
