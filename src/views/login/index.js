import React, { Component, Fragment } from 'react';
import ErrorMessage from 'components/error-message';
import HeaderLogo from 'images/header_logo.png';
import Select from 'react-select';
import classNames from 'classnames';


const BitGoJS = window.require('bitgo');

class Login extends Component {
  state = { username: '', password: '', otp: '', env: '' };

  updateField = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  updateEnv = (env) => {
    this.setState({ env: env.value });
  }

  async doLogin() {
    // Tell app we're making a login request (disable login button)
    this.setState({ loginInProgress: true });

    // Instantiate a bitgo instance
    const { username, password, otp, env = 'test' } = this.state;
    const bitgo = new BitGoJS.BitGo({ env });

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

  goToNonBitGo() {
    this.props.bypassLogin();
  }

  render() {
    const { username, password, otp, env, error, loginInProgress } = this.state;
    const allFieldsSet = !!username && !!password && !!otp;
    const loginDisabled = loginInProgress || !allFieldsSet;
    const needsLogin = env === 'prod' || env === 'test';

    const loginOptions = [
      {
        label: '- Select Environment -',
        value: '',
        disabled: true
      },
      {
        label: 'Testnet',
        value: 'test'
      },
      {
        label: 'Mainnet',
        value: 'prod'
      },
      {
        label: 'Non-BitGo Recoveries',
        value: 'none'
      }
    ];

    return (
      <div className="login" align="center">
        <img src={HeaderLogo} alt='' border="0" align="center" />
        <h1 className='dubberdub-title'>Wallet Recovery Wizard</h1>
        <div className="loginBox">
          <form>
            <Select
              type='select'
              className='loginBox-select bitgo-select'
              options={loginOptions}
              onChange={this.updateEnv}
              name={'env'}
              value={env}
              clearable={false}
              searchable={false}
            />
            {needsLogin &&
              <Fragment>
                <input type="text" placeholder="Email" onChange={this.updateField('username')} value={username} autoFocus />
                <input type="password" placeholder="Password" onChange={this.updateField('password')} value={password} />
                <input type="text" placeholder="2FA Code" name="otp" onChange={this.updateField('otp')} value={otp} />
              </Fragment>
            }
          </form>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {needsLogin &&
            <button
              onClick={this.doLogin.bind(this)}
              disabled={loginDisabled}
              className={classNames('bitgo-button', loginDisabled && 'disabled')}
            >
              {loginInProgress ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          }
          {env === 'none' &&
            <button
              className='bitgo-button'
              onClick={this.goToNonBitGo.bind(this)}
            >
              CONTINUE
            </button>
          }
        </div>
		  </div>
    );
  }
}

export default Login;