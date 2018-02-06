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

import './dashboard.css';


class Dashboard extends Component {
  render() {
    return (
      <div className="wrapper">

        <Header />
        <Sidebar />

        <Router>
          <Switch>
            <Route path='/' component={MainNav} />
          </Switch>
        </Router>



	    </div>
    );
  }
}

export default Dashboard;