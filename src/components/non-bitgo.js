import React, { Component } from 'react';
import Select from 'react-select';
import { InputField, InputTextarea, CoinDropdown, FieldTooltip } from './form-components';
import { Form, Button, Row, Col, FormGroup, Label } from 'reactstrap';
import classNames from 'classnames';
import ErrorMessage from './error-message';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';
import krsProviders from 'constants/krs-providers';

const formTooltips = tooltips.recovery;

class NonBitGoRecoveryForm extends Component {
  state = {
    coin: 'btc',
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    rootAddress: '',
    walletContractAddress: '',
    tokenAddress: '',
    walletPassphrase: '',
    recoveryDestination: '',
    scan: 20,
    krsProvider: null,
    env: 'test'
  };

  requiredParams = {
    btc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    bch: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    ltc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    btg: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    zec: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    dash: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    eth: ['userKey', 'backupKey', 'walletContractAddress', 'walletPassphrase', 'recoveryDestination'],
    xrp: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
    xlm: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
    token: ['userKey', 'backupKey', 'walletContractAddress', 'tokenContractAddress', 'walletPassphrase', 'recoveryDestination']
  };

  getCoinObject = () => {
    let coin;
    if (this.state.coin === 'token') {
      try {
        coin = this.props.bitgo.coin(this.state.tokenAddress);
      } catch (e) {
        // if we're here, the token address is malformed. let's set the coin to ETH so we can still validate addresses
        let coinTicker = this.state.env === 'test' ? 'teth' : 'eth';
        coin = this.props.bitgo.coin(coinTicker);
      }
    } else {
      let coinTicker = this.state.env === 'test' ? `t${this.state.coin}` : this.state.coin;
      coin = this.props.bitgo.coin(coinTicker);
    }

    return coin;
  }

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  }

  updateEnv = (option) => {
    this.setState({ env: option.value });
  }

  updateCoin = (option) => {
    this.setState({ coin: option.value });
  }

  updateKrs = (option) => {
    if (option === null) {
      this.setState({ krsProvider: null });
    } else {
      this.setState({ krsProvider: option.value });
    }
  }

  async performRecovery() {
    this.setState({ recovering: true, error: '' });

    let baseCoin = await this.getCoinObject();

    this.props.bitgo.env = this.state.env;

    const recoveryTool = baseCoin.recover;

    if (!recoveryTool) {
      this.setState({ error: `Recovery tool not found for ${this.state.coin}`, recovering: false });
      return;
    }

    try {
      // This is like _.pick
      const recoveryParams = [
        'userKey', 'backupKey', 'bitgoKey', 'rootAddress',
        'walletContractAddress', 'tokenAddress', 'walletPassphrase',
        'recoveryDestination', 'scan', 'krsProvider'
      ].reduce((obj, param) => {
        if (this.state[param]) {
          let value = this.state[param];

          return Object.assign(obj, { [param]: value })
        }

        return obj;
      }, {});

      const recovery = await baseCoin.recover(recoveryParams);
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
      rootAddress: '',
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
            <Col xs={5}>
              <CoinDropdown
                label='Wallet Type'
                name='coin'
                allowedCoins={recoveryCoins}
                onChange={this.updateCoin}
                value={this.state.coin}
              />
            </Col>
            <Col xs={4}>
              <FormGroup>
                <Label className='input-label'>
                  Key Recovery Service
                </Label>
                <FieldTooltip name='krs' text={formTooltips.krsProvider}/>
                <Select
                  type='select'
                  className='bitgo-select'
                  options={krsProviders}
                  onChange={this.updateKrs}
                  name='krsProvider'
                  value={this.state.krsProvider}
                  clearable={true}
                  searchable={false}
                  placeholder='None'
                />
              </FormGroup>
            </Col>
            <Col xs={3}>
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
          {this.requiredParams[this.state.coin].includes('userKey') &&
          <InputTextarea
            label='Box A Value'
            name='userKey'
            value={this.state.userKey}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.userKey}
            disallowWhiteSpace={true}
            format='json'
          />
          }

          {this.requiredParams[this.state.coin].includes('backupKey') &&
          [(this.state.krsProvider === null ?
              <InputTextarea
                label='Box B Value'
                name='backupKey'
                value={this.state.backupKey}
                onChange={this.updateRecoveryInfo}
                tooltipText={formTooltips.backupPrivateKey}
                disallowWhiteSpace={true}
                format='json'
              />
              :
              <InputField
                label='Box B Value'
                name='backupKey'
                value={this.state.backupKey}
                onChange={this.updateRecoveryInfo}
                tooltipText={formTooltips.backupPublicKey}
                disallowWhiteSpace={true}
                format='pub'
                coin={this.getCoinObject()}
              />
          )]
          }

          {this.requiredParams[this.state.coin].includes('bitgoKey') &&
          <InputField
            label='Box C Value'
            name='bitgoKey'
            value={this.state.bitgoKey}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.bitgoKey}
            disallowWhiteSpace={true}
            format='pub'
          />
          }

          {this.requiredParams[this.state.coin].includes('rootAddress') &&
          <InputField
            label='Root Address'
            name='rootAddress'
            value={this.state.rootAddress}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.rootAddress}
            disallowWhiteSpace={true}
            format='address'
            coin={this.getCoinObject()}
          />
          }

          {this.requiredParams[this.state.coin].includes('walletContractAddress') &&
          <InputField
            label='Wallet Contract Address'
            name='walletContractAddress'
            value={this.state.walletContractAddress}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.walletContractAddress}
            disallowWhiteSpace={true}
            format='address'
            coin={this.getCoinObject()}
          />
          }

          {this.requiredParams[this.state.coin].includes('tokenContractAddress') &&
          <InputField
            label='Token Contract Address'
            name='tokenAddress'
            value={this.state.tokenAddress}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.tokenAddress}
            disallowWhiteSpace={true}
            format='address'
            coin={this.getCoinObject()}
          />
          }

          {this.requiredParams[this.state.coin].includes('walletPassphrase') &&
          <InputField
            label='Wallet Passphrase'
            name='walletPassphrase'
            value={this.state.walletPassphrase}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.walletPassphrase}
            isPassword={true}
          />
          }

          {this.requiredParams[this.state.coin].includes('recoveryDestination') &&
          <InputField
            label='Destination Address'
            name='recoveryDestination'
            value={this.state.recoveryDestination}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.recoveryDestination}
            disallowWhiteSpace={true}
            format='address'
            coin={this.getCoinObject()}
          />
          }

          {this.requiredParams[this.state.coin].includes('scan') &&
          <InputField
            label='Address Scanning Factor'
            name='scan'
            value={this.state.scan}
            onChange={this.updateRecoveryInfo}
            tooltipText={formTooltips.scan}
            disallowWhiteSpace={true}
            format='number'
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
