import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <div className="leftNavBar">
    <div className="leftNav">
      <Link to='/keycard'><div className="navigation">KeyCard Recoveries</div></Link>
    </div>
    {/*<a href="">
      <div className="leftNav">
        <div className="navigation">Legacy SafeHD Recoveries</div>
      </div>
    </a>*/}
    <div className="leftNav">
      <Link to='/crosschain'><div className="navigation">Wrong Chain Recoveries</div></Link>
    </div>
    {/*<a href="">
      <div className="leftNav">
        <div className="navigation">ERC20 Recoveries</div>
      </div>
    </a>
    <a href="">
      <div className="leftNav">
        <div className="navigation">Ledger &amp; SAFE Recoveries</div>
      </div>
    </a>*/}
  </div>
);

export default Sidebar;