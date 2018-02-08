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
    const { isLoggedIn, resetLogin, bitgo } = this.props;

    return (
      <Router>
        <div className="wrapper">

            <Header resetLogin={resetLogin} bitgo={bitgo} isLoggedIn={isLoggedIn} />
            <Sidebar isLoggedIn={isLoggedIn} />

            <div className='content'>
              <Switch>
                <Route exact path='/' render={(props) => <MainNav {...props} isLoggedIn={isLoggedIn} />} />
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