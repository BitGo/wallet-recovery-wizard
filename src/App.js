import React, { Component } from 'react';

import Dashboard from 'views/dashboard';
import Login from 'views/login';

import 'bootstrap/dist/css/bootstrap.css';
import './App.css';


class App extends Component {
  state = { isLoggedIn: false, bitgo: null };

  updateLoginState = (isLoggedIn) => (bitgoInstance) => {
    if (isLoggedIn && !bitgoInstance) {
      throw new Error('If logging in, please pass in an authenticated BitGoJS instance.');
    }

    this.setState({ isLoggedIn, bitgo: bitgoInstance });
  }

  render() {
    const { isLoggedIn, bitgo } = this.state;

    if (isLoggedIn) {
      return <Dashboard bitgo={bitgo} onLogout={this.updateLoginState(false)} />;
    } else {
      return <Login finishLogin={this.updateLoginState(true)} />;
    }
  }
}

export default App;
