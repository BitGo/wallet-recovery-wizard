import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Sidebar from 'components/sidebar';
import Header from 'components/header';
import MainNav from 'components/main-nav';
import CrossChainRecoveryForm from 'components/cross-chain';
import NonBitGoRecoveryForm from 'components/non-bitgo';


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
                <Route exact path='/' render={(props) => <MainNav {...props} />} />
                <Route path='/crosschain' render={(props) => <CrossChainRecoveryForm bitgo={bitgo} {...props} />} />
                <Route path='/nonbitgo' render={(props) => <NonBitGoRecoveryForm {...props} />} />
              </Switch>
            </div>
        </div>
      </Router>
    );
  }
}

export default Dashboard;