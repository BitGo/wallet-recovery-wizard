import React, { Component } from 'react';
import ErrorMessage from 'components/error-message';

class Login extends Component {
  state = { username: '', password: '', otp: '', env: 'test' };

  updateField = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  async doLogin() {
    // Tell app we're making a login request (disable login button)
    this.setState({ loginInProgress: true });

    // Instantiate a bitgo instance
    const { username, password, otp, env = 'test' } = this.state;
    const bitgo = new window.BitGoJS.BitGo({ env });

    console.log('Logging in...');

    try {
      const authResponse = await bitgo.authenticate({ username, password, otp });
      bitgo.sessionInfo = authResponse;

      // Successfully logged in, so update the app (and give it bitgo instance)
      this.props.finishLogin(bitgo);
    } catch (e) {
      this.setState({ loginInProgress: false, error: 'There was an error logging in. Please check your username, password and OTP, and try again. '});
    }
  }

  render() {
    const { username, password, otp, error, loginInProgress } = this.state;
    const allFieldsSet = !!username && !!password && !!otp;
    const loginDisabled = loginInProgress || !allFieldsSet;

    return (
      <div className="login" align="center">
        <img src="https://www.bitgo.com/img/newDesign/BitGo-Header-Logo.3bd7c2af5bcac098.png" alt='' border="0" align="center" />
        <h1>Wallet Recovery Wizard</h1>

        <div className="loginBox">
          <form>
            <input type="text" placeholder="Email" onChange={this.updateField('username')} value={username} autoFocus />
            <input type="password" placeholder="Password" onChange={this.updateField('password')} value={password} />
            <input type="text" placeholder="2FA Code" name="otp" onChange={this.updateField('otp')} value={otp} />
          </form>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            onClick={this.doLogin.bind(this)}
            disabled={loginDisabled}
            className={loginDisabled ? 'disabled' : undefined}
          >
            {loginInProgress ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </div>
		  </div>
    );
  }
}

export default Login;