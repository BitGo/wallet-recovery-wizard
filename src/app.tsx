import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import RootRouter from './containers/root-router';
import { BitGoEnvironmentProvider } from './contexts/bitgo-environment';
import { SessionProvider } from './contexts/session';
import { LocaleProvider } from './contexts/locale';

import 'sanitize.css/sanitize.css';
import './styles/recovery-wizard.scss';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

const AppProvider: React.FC = ({ children }) => (
  <BitGoEnvironmentProvider>
    <SessionProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </SessionProvider>
  </BitGoEnvironmentProvider>
);

const App = () => (
  <AppProvider>
    <Router>
      <RootRouter />
    </Router>
  </AppProvider>
);

render(<App />, mainElement);
