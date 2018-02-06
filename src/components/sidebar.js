import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <div class="leftNavBar">
    <a href="">
      <div class="leftNav">
        <Link to='/keycard'><div class="navigation">KeyCard Recoveries</div></Link>
      </div>
    </a>
    {/*<a href="">
      <div class="leftNav">
        <div class="navigation">Legacy SafeHD Recoveries</div>
      </div>
    </a>*/}
    <a href="">
      <div class="leftNav">
        <Link to='/crosschain'><div class="navigation">Wrong Chain Recoveries</div></Link>
      </div>
    </a>
    {/*<a href="">
      <div class="leftNav">
        <div class="navigation">ERC20 Recoveries</div>
      </div>
    </a>
    <a href="">
      <div class="leftNav">
        <div class="navigation">Ledger &amp; SAFE Recoveries</div>
      </div>
    </a>*/}
  </div>
);

export default Sidebar;