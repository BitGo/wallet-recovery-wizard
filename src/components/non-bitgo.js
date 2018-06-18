import React, { Component } from 'react';
import Select from 'react-select';
import { InputField, InputTextarea, CoinDropdown } from './form-components';
import { Form, Button, Row, Col, FormGroup, Label } from 'reactstrap';
import classNames from 'classnames';
import ErrorMessage from './error-message';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

const formTooltips = tooltips.recovery;

class NonBitGoRecoveryForm extends Component {
  state = {
    coin: 'eth',
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    rootAddress: '',
    walletContractAddress: '',
    tokenAddress: '',
    walletPassphrase: '',
    recoveryDestination: '',
    scan: 20,
    env: 'test'
  };

  updateRecoveryInfo = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  updateEnv = (option) => {
    this.setState({ env: option.value });
  }

  updateCoin = (option) => {
    this.setState({ coin: option.value });
  }

  async performRecovery() {
    this.setState({ recovering: true, error: '' });

    let coin;
    let baseCoin;

    if (this.state.coin === 'token') {
      try {
        coin = this.state.tokenAddress;
        baseCoin = await this.props.bitgo.token(coin);
      } catch (e) {
        this.setState({ error: e.message, recovering: false });
        return;
      }
    } else {
      coin = this.state.env === 'test' ? `t${this.state.coin}` : this.state.coin;
      baseCoin = this.props.bitgo.coin(coin);
    }

    this.props.bitgo.env = this.state.env;

    const recoveryTool = baseCoin.recover;

    if (!recoveryTool) {
      this.setState({ error: `Recovery tool not found for ${coin}`, recovering: false });
      return;
    }

    try {
      // This is like _.pick
      const recoveryParams = [
        'userKey', 'backupKey', 'bitgoKey', 'rootAddress',
        'walletContractAddress', 'tokenAddress', 'walletPassphrase',
        'recoveryDestination', 'scan'
      ].reduce((obj, param) => {
        if (!!this.state[param]) {
          let value = this.state[param];

          if (param === 'userKey' || param === 'backupKey') {
            // remove whitespace
            value = value.replace(/\\/g, '');
          }

          return Object.assign(obj, { [param]: value })
        }

        return obj;
      }, {});

      const recovery = await this.props.bitgo.coin(coin).recover(recoveryParams);
      const recoveryTx = recovery.transactionHex || recovery.txHex || recovery.tx;

      if (!recoveryTx) {
        throw new Error('Fully-signed recovery transaction not detected.');
      }

      this.setState({ recovering: false, done: true, finalTx: recoveryTx });
    } catch (e) {
      this.setState({ error: e.message, recovering: false });
    }
  }

  resetRecovery = () => {
    this.setState({
      userKey: '',
      backupKey: '',
      walletContractAddress: '',
      tokenAddress: '',
      walletPassphrase: '',
      recoveryDestination: '',
      env: 'test',
      done: false,
      error: ''
    })
  }

  render() {
    const recoveryCoins = coinConfig.supportedRecoveries.nonBitGo;
    const { isLoggedIn } = this.props;

    return (
      <div className={classNames(isLoggedIn || 'content-centered')}>
        <h1 className='content-header'>Non-BitGo Recovery</h1>
        <p className='subtitle'>This tool will help you use your recovery KeyCard to build and send a transaction that does not rely on BitGo APIs.</p>
        <hr />
        <Form>
          <Row>
            <Col xs={6}>
              <CoinDropdown
                label='Wallet Type'
                name='coin'
                allowedCoins={recoveryCoins}
                onChange={this.updateCoin}
                value={this.state.coin}
              />
            </Col>
            <Col xs={6}>
              <FormGroup>
                <Label className='input-label'>
                  Environment
                </Label>
                <Select
                  type='select'
                  className='bitgo-select'
                  options={coinConfig.allCoins[this.state.coin].envOptions}
                  onChange={this.updateEnv}
                  name={'env'}
                  value={this.state.env}
                  clearable={false}
                  searchable={false}
                />
              </FormGroup>
            </Col>
          </Row>
          <InputTextarea
            label='Box A Value'
            name='userKey'
            onChange={this.updateRecoveryInfo('userKey')}
            value={this.state.userKey}
            tooltipText={formTooltips.userKey}
          />
          <InputTextarea
            label='Box B Value'
            name='backupKey'
            onChange={this.updateRecoveryInfo('backupKey')}
            value={this.state.backupKey}
            tooltipText={formTooltips.backupKey}
          />
          {!['xrp', 'eth', 'token'].includes(this.state.coin) &&
            <InputField
              label='Box C Value'
              name='bitgoKey'
              onChange={this.updateRecoveryInfo('bitgoKey')}
              value={this.state.bitgoKey}
              tooltipText={formTooltips.bitgoKey}
            />
          }
          {this.state.coin === 'xrp' &&
            <InputField
              label='Root Address'
              name='rootAddress'
              onChange={this.updateRecoveryInfo('rootAddress')}
              value={this.state.rootAddress}
              tooltipText={formTooltips.rootAddress}
            />
          }
          {['eth', 'token'].includes(this.state.coin) &&
            <InputField
              label='Wallet Contract Address'
              name='walletContractAddress'
              onChange={this.updateRecoveryInfo('walletContractAddress')}
              value={this.state.walletContractAddress}
              tooltipText={formTooltips.walletContractAddress}
            />
          }
          {this.state.coin === 'token' &&
          <InputField
            label='Token Contract Address'
            name='tokenAddress'
            onChange={this.updateRecoveryInfo('tokenAddress')}
            value={this.state.tokenAddress}
            tooltipText={formTooltips.tokenAddress}
          />
          }
          <InputField
            label='Wallet Passphrase'
            name='walletPassphrase'
            onChange={this.updateRecoveryInfo('walletPassphrase')}
            value={this.state.walletPassphrase}
            isPassword={true}
            tooltipText={formTooltips.walletPassphrase}
          />
          <InputField
            label='Destination Address'
            name='recoveryDestination'
            onChange={this.updateRecoveryInfo('recoveryDestination')}
            value={this.state.recoveryDestination}
            tooltipText={formTooltips.recoveryDestination}
          />
          {!['xrp', 'eth', 'token'].includes(this.state.coin) &&
            <InputField
              label='Address Scanning Factor'
              name='scan'
              onChange={this.updateRecoveryInfo('scan')}
              value={this.state.scan}
              tooltipText={formTooltips.scan}
            />
          }
          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
          {this.state.done && <p className='recovery-logging'>Completed constructing recovery transaction. Transaction Hex: <span className='tx-hex'>{this.state.finalTx}</span></p>}
          {!this.state.done &&
            <Button onClick={this.performRecovery.bind(this)} disabled={this.state.recovering} className='bitgo-button'>
              {this.state.recovering ? 'Recovering...' : 'Recover Funds'}
            </Button>
          }
          {this.state.done &&
            <Button onClick={this.resetRecovery} className='bitgo-button'>
              Perform Another Recovery
            </Button>
          }
        </Form>
      </div>
    )
  }
}

export default NonBitGoRecoveryForm;
