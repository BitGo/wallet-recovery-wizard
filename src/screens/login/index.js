import React, { Component } from 'react';

// import BitGoJS from 'bitgo';

import './login.css';
import Input from 'components/input';
import ErrorMessage from 'components/error-message';

class LoginScreen extends Component {
  state = { username: '', password: '', otp: '', env: 'prod' };

  handleLogin() {
    const bitgo = new BitGoJS.BitGo({ env: this.state.env });
    try {
      await bitgo.authenticate({
        username: this.state.usernme,
        password: this.state.password,
        otp: this.state.otp
      });
    } catch (e) {
      this.setState({ error: e });
    }
  }

  updateField = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  render() {
    const { username, password, otp, error } = this.state;
    const canLogin = !!username && !!password && !!otp;

    return (
      <div className='login-container'>
        <Input label='Email Address' onUpdate={this.updateField('username')} value={username} />
        <Input label='Password' onUpdate={this.updateField('password')} value={password} password />
        <Input label='2FA Code' onUpdate={this.updateField('otp')} value={otp} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <button onClick={this.handleLogin} disabled={canLogin}>Log In</button>
      </div>
    );
  }
}

export default LoginScreen;