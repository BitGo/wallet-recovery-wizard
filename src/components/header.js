import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import userImage from 'images/User.png';
import badgeLogo from 'images/badge_logo.png';

class Header extends Component {
  state = { username: '' };

  async componentWillMount() {
    if (this.props.isLoggedIn) {
      const { bitgo } = this.props;
      const { username } = bitgo.sessionInfo.user;
      this.setState({ username });
    }
  }

  async doLogout() {
    const { bitgo, resetLogin } = this.props;

    try {
      await bitgo.logout();

      resetLogin();
    } catch (e) {
      console.error('Error logging out', e);
    }
  }

  render() {
    const { isLoggedIn, resetLogin } = this.props;
    const { username } = this.state;

    return (
      <div className="header">
        <div className="logo">
          <img src={badgeLogo} alt="" border="0" width="110" height="27" />
        </div>
        <div className="toolTitle">
          <Link to="/">Wallet Recovery Wizard</Link>
        </div>
        {isLoggedIn && (
          <div className="user">
            {username} |
            <span className="logoutLink" onClick={this.doLogout.bind(this)}>
              {' '}
              Logout
            </span>
          </div>
        )}
        {!isLoggedIn && (
          <div className="user">
            <span className="logoutLink" onClick={resetLogin}>
              Login
            </span>
          </div>
        )}
        <div className="userIcon">
          <img src={userImage} border="0" width="30" height="30" alt="" className="profile-pic" />
        </div>
      </div>
    );
  }
}

export default Header;
