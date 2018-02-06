import React from 'react';
import { Link } from 'react-router-dom';

const MainNav = () => (
  <div className="content">
    <h1>What would you like to do?</h1>
    {/*<Link to='/keycard'>
      <div className="optionBox">
        <h2>KeyCard Recoveries</h2>
        <p>Use your wallet's KeyCard to recover lost funds.</p>
      </div>
    </Link>*/}
    <Link to='/crosschain'>
      <div className="optionBox">
        <h2>Wrong Chain Recoveries</h2>
        <p>Recover funds sent to the wrong chain, such as BTC sent to an LTC address.</p>
      </div>
    </Link>
  </div>
);

export default MainNav;