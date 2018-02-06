import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <div className="logo">
          <img src="https://test.bitgo.com/img/new_bitgo/logo.71b677f29e55836e.png" border="0" width="110" height="27" />
        </div>
        <div className="toolTitle">Wallet Recovery Wizard</div>
        <div className="user">example@email.com</div>
        <div className="userIcon">
          <img src="images/User.png" border="0" width="30" height="30" />
        </div>
      </div>
    );
  }
}

export default Header;