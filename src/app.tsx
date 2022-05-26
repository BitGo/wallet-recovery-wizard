import { NetworkType } from '@bitgo/statics';
import { EnvironmentName } from 'bitgo';
import React, { useMemo, useState } from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { HashRouter as Router } from 'react-router-dom';
import 'sanitize.css/sanitize.css';
import messages_en from '../lang/en.json';
import messages_ja from '../lang/ja.json';
import { ApplicationContext, BitgoSession, BitgoUser } from './components/contexts/application-context';
import RootRouter from './containers/root-router';
import { BitgoSDKOfflineWrapper } from './pkg/bitgo/bitgo-sdk-offline-wrapper';
import './styles/recovery-wizard.scss';

export const sessionStorageName = 'bitgo-session';
export const userStorageName = 'bitgo-user';
export const accessTokenStorageName = 'bitgo-access-token';

const existingUser = window.sessionStorage.getItem(userStorageName);
const existingSession = window.sessionStorage.getItem(sessionStorageName);
const existingToken = window.sessionStorage.getItem(accessTokenStorageName);
const parsedSession: BitgoSession = existingSession ? JSON.parse(existingSession) : null;
const parsedUser: BitgoUser = existingUser ? JSON.parse(existingUser) : null;
const parsedToken: string = existingToken ? JSON.parse(existingToken) : null;

const initialNetworkType: NetworkType = NetworkType.TESTNET;
const initialEnv: EnvironmentName = 'test';
const initialLocale = navigator.language.split(/[-_]/)[0];
// TODO(louis): missing token, check src/App.js in old WRW
const initialBitGo = new BitgoSDKOfflineWrapper({
  env: initialEnv,
  accessToken: parsedSession && new Date(parsedSession.expires) > new Date() ? parsedToken : null,
});

const messages = {
  ja: messages_ja,
  en: messages_en,
};

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

const App = () => {
  const [locale, setLocale] = useState(initialLocale);
  const [network, setNetwork] = useState<NetworkType>(initialNetworkType);
  // TODO(louis): expiration to consider packages/shared/src/helpers/sessionStore.ts in Lumina
  const [session, setSession] = useState<BitgoSession>(parsedSession);
  const [user, setUser] = useState<BitgoUser>(parsedUser);
  const [bitgoSDKOfflineWrapper, setBitgoSDKOfflineWrapper] = useState(initialBitGo);
  const applicationContext = useMemo(
    () => ({
      bitgoSDKOfflineWrapper,
      setBitgoSDKOfflineWrapper,
      locale,
      setLocale,
      network,
      setNetwork,
      session,
      setSession,
      user,
      setUser,
    }),
    [locale, setLocale, network, setNetwork, setSession, session, setUser, user]
  );

  return (
    <ApplicationContext.Provider value={applicationContext}>
      <IntlProvider defaultLocale="en" locale={locale} messages={messages[locale]}>
        <Router>
          <RootRouter />
        </Router>
      </IntlProvider>
    </ApplicationContext.Provider>
  );
};

render(<App />, mainElement);
