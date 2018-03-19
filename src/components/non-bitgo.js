import React, { Component } from 'react';
import Select from 'react-select';
import { InputField, InputTextarea, CoinDropdown } from './form-components';
import { Form, Button, Row, Col, FormGroup, Label } from 'reactstrap';
import classNames from 'classnames';
import ErrorMessage from './error-message';

import recoverEth from 'tools/eth-backup-key-recovery';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

const formTooltips = tooltips.ethRecovery;

class NonBitGoRecoveryForm extends Component {
  state = {
    coin: 'eth',
    boxAValue: '',
    boxBValue: '',
    walletContractAddress: '',
    walletPassphrase: '',
    recoveryAddress: '',
    env: 'test'
  }

  recoveryTools = {
    eth: recoverEth
  }

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
    const recoveryTool = this.recoveryTools[this.state.coin];

    try {
      const sendResult = await recoveryTool(this.state);
      this.setState({ recovering: false, done: true, finalTx: sendResult.tx });
    } catch (e) {
      this.setState({ error: e.message, recovering: false });
    }
  }

  resetRecovery = () => {
    this.setState({
      boxAValue: '',
      boxBValue: '',
      walletContractAddress: '',
      walletPassphrase: '',
      recoveryAddress: '',
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
            name='boxAValue'
            onChange={this.updateRecoveryInfo('boxAValue')}
            value={this.state.boxAValue}
            tooltipText={formTooltips.boxAValue}
          />
          <InputTextarea
            label='Box B Value'
            name='boxBValue'
            onChange={this.updateRecoveryInfo('boxBValue')}
            value={this.state.boxBValue}
            tooltipText={formTooltips.boxBValue}
          />
          <InputField
            label='Wallet Contract Address'
            name='walletContractAddress'
            onChange={this.updateRecoveryInfo('walletContractAddress')}
            value={this.state.walletContractAddress}
            tooltipText={formTooltips.walletContractAddress}
          />
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
            name='recoveryAddress'
            onChange={this.updateRecoveryInfo('recoveryAddress')}
            value={this.state.recoveryAddress}
            tooltipText={formTooltips.recoveryAddress}
          />
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