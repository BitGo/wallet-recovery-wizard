import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import Dashboard from '@src/views/dashboard';
import Login from '@src/views/login';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-select/dist/react-select.css';
import '@src/App.css';

const { BitGo } = window.require('bitgo');

function getBitgoInstanceFromEnv() {
  const env = process.env['REACT_APP_BITGO_ENV'];
  const token = process.env['REACT_APP_BITGO_TOKEN'];
  if (!token || !env) {
    return undefined;
  }
  return new BitGo({ env, accessToken: token });
}

class App extends Component {
  constructor() {
    super();
    const bitgo = getBitgoInstanceFromEnv();
    this.state = bitgo
      ? { isLoggedIn: false, loginBypass: true, bitgo }
      : { isLoggedIn: false, loginBypass: false, bitgo: null };
  }

  updateLoginState = (isLoggedIn) => (bitgoInstance, utxoLibInstance) => {
    if (isLoggedIn && !bitgoInstance) {
      throw new Error('If logging in, please pass in an authenticated BitGoJS instance.');
    }

    if (bitgoInstance) {
      bitgoInstance.utxoLib = utxoLibInstance;
    }

    this.setState({ isLoggedIn, bitgo: bitgoInstance, loginBypass: false });
  };

  updateLoginBypass = (bitgoInstance) => {
    this.setState({ loginBypass: true, bitgo: bitgoInstance });
  };

  renderMain = (props) => {
    const { isLoggedIn, loginBypass, bitgo } = this.state;

    if (isLoggedIn || loginBypass) {
      return <Dashboard bitgo={bitgo} resetLogin={this.updateLoginState(false)} isLoggedIn={isLoggedIn} {...props} />;
    } else {
      return <Login finishLogin={this.updateLoginState(true)} bypassLogin={this.updateLoginBypass} {...props} />;
    }
  };

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" render={this.renderMain} />
          <Redirect to="/" />
        </Switch>
      </Router>
    );
  }
}

export default App;
