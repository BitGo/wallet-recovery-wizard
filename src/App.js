import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import Dashboard from 'views/dashboard';
import Login from 'views/login';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-select/dist/react-select.css';
import './App.css';


class App extends Component {
  state = { isLoggedIn: false, loginBypass: false, bitgo: null };

  updateLoginState = (isLoggedIn) => (bitgoInstance) => {
    if (isLoggedIn && !bitgoInstance) {
      throw new Error('If logging in, please pass in an authenticated BitGoJS instance.');
    }

    this.setState({ isLoggedIn, bitgo: bitgoInstance, loginBypass: false });
  }

  updateLoginBypass = () => {
    this.setState({ loginBypass: true });
  }

  renderMain = (props) => {
    const { isLoggedIn, loginBypass, bitgo } = this.state;

    if (isLoggedIn || loginBypass) {
      return <Dashboard bitgo={bitgo} resetLogin={this.updateLoginState(false)} isLoggedIn={isLoggedIn} {...props} />;
    } else {
      return <Login finishLogin={this.updateLoginState(true)} bypassLogin={this.updateLoginBypass} {...props} />;
    }
  }

  render() {
    return (
      <Router>
          <Switch>
            <Route path='/' render={this.renderMain} />
            <Redirect to='/' />
          </Switch>
      </Router>
    )
  }
}

export default App;
