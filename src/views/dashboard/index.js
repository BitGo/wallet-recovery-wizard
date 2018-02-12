import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import Sidebar from 'components/sidebar';
import Header from 'components/header';
import MainNav from 'components/main-nav';
import nav from 'constants/nav';

class Dashboard extends Component {
  _getRoute = ({ url, NavComponent, needsLogin }) => {
    const { isLoggedIn, bitgo } = this.props;

    if (needsLogin && !isLoggedIn) {
      return <Redirect from={url} to='/' key={url} />
    }

    return <Route path={url} key={url} render={(props) => <NavComponent bitgo={bitgo} {...props} />} />;
  }

  render() {
    const { isLoggedIn, resetLogin, bitgo, location } = this.props;
    const { main: navElements } = nav;

    return (
      <Router>
        <div className="wrapper">

            <Header resetLogin={resetLogin} bitgo={bitgo} isLoggedIn={isLoggedIn} />
            <Sidebar isLoggedIn={isLoggedIn} />

            <div className='content'>
              <Switch>
                <Route exact path='/' render={(props) => <MainNav {...props} isLoggedIn={isLoggedIn} />} />
                {navElements.map(this._getRoute)}
              </Switch>
            </div>
        </div>
      </Router>
    );
  }
}

export default Dashboard;