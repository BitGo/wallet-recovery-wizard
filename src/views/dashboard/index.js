import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

// import BitGoJS from 'bitgo';

import Sidebar from 'components/sidebar';
import Header from 'components/header';
import MainNav from 'components/main-nav';
import CrossChainRecoveryForm from 'components/cross-chain';

class Dashboard extends Component {
  render() {
    const { onLogout, bitgo } = this.props;

    return (
      <Router>
        <div className="wrapper">

            <Header onLogout={onLogout} bitgo={bitgo} />
            <Sidebar />

            <div className='content'>
              <Switch>
                <Route exact path='/' component={MainNav} />
                <Route path='/crosschain' component={CrossChainRecoveryForm} />
              </Switch>
            </div>
        </div>
      </Router>
    );
  }
}

export default Dashboard;