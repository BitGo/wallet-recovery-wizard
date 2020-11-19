import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import Sidebar from 'components/sidebar';
import Header from 'components/header';
import MainNav from 'components/main-nav';
import nav from 'constants/nav';

class Dashboard extends Component {
  _getRoute = ({ url, NavComponent, needsLogin }) => {
    const { isLoggedIn, bitgo } = this.props;

    if (needsLogin && !isLoggedIn) {
      return <Redirect from={url} to="/" key={url} />;
    }

    // Push all components to the right if logged in (to make room for sidebar)
    // Otherwise, center them
    const contentStyle = {
      marginLeft: isLoggedIn ? '330px' : 'auto',
      marginRight: isLoggedIn ? '100px' : 'auto',
      flexGrow: isLoggedIn ? 1 : undefined,
    };

    return (
      <Route
        path={url}
        key={url}
        render={(props) => (
          <div style={contentStyle}>
            <NavComponent bitgo={bitgo} isLoggedIn={isLoggedIn} {...props} />
          </div>
        )}
      />
    );
  };

  render() {
    const { isLoggedIn, resetLogin, bitgo } = this.props;
    const { main: navElements } = nav;

    return (
      <Router>
        <div className="wrapper">
          <Header resetLogin={resetLogin} bitgo={bitgo} isLoggedIn={isLoggedIn} />

          <div className="content">
            <Sidebar isLoggedIn={isLoggedIn} />
            <Switch>
              {navElements.map(this._getRoute)}
              <Route path="/" render={(props) => <MainNav {...props} isLoggedIn={isLoggedIn} />} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default Dashboard;
