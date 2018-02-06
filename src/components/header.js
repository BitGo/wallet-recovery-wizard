import React, { Component } from 'react';
import userImage from 'images/User.png';

class Header extends Component {
  state = { username: '' }

  async componentWillMount() {
    const { bitgo } = this.props;
    const { username } = bitgo.sessionInfo.user;
    this.setState({ username });
  }

  async doLogout() {
    const { bitgo, onLogout } = this.props;

    try {
      await bitgo.logout();

      onLogout();
    } catch (e) {
      console.error('Error logging out', e);
    }
  }

  render() {
    const { username } = this.state;

    return (
      <div className="header">
        <div className="logo">
          <img src="https://test.bitgo.com/img/new_bitgo/logo.71b677f29e55836e.png" alt='' border="0" width="110" height="27" />
        </div>
        <div className="toolTitle">Wallet Recovery Wizard</div>
        <div className="user">
          {username} |
          <span className='logoutLink' onClick={this.doLogout.bind(this)}> Logout</span>
        </div>
        <div className="userIcon">
          <img src={userImage} border="0" width="30" height="30" alt='' />
        </div>
      </div>
    );
  }
}

export default Header;