import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// import BitGoJS from 'bitgo';

import Sidebar from 'components/sidebar';
import Header from 'components/header';

import './dashboard.css';

class Dashboard extends Component {
  render() {
    return (
      <div class="wrapper">

        <Header />
        <Sidebar />

        <div class="content">
          <h1>What would you like to do?</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incidir adipiscing elit, sed do eidunt ut labore et dolore magna aliqua.</p>
            <Link to='/keycard'>
              <div class="optionBox">
                <h2>KeyCard Recoveries</h2>
                <p>Use your wallet's KeyCard to recover lost funds.</p>
              </div>
            </Link>
            <Link to='/crosschain'>
              <div class="optionBox">
                <h2>Wrong Chain Recoveries</h2>
                <p>Recover funds sent to the wrong chain, such as BTC sent to an LTC address.</p>
              </div>
            </Link>
		    </div>

	    </div>
    );
  }
}

export default Dashboard;