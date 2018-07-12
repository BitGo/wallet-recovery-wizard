import React, { Component } from 'react';
import { InputField } from './form-components';
import { Form, Button, Row, Col, Alert } from 'reactstrap';

import ErrorMessage from './error-message';

import tooltips from 'constants/tooltips';

import moment from 'moment';

const fs = window.require('fs');
const { dialog } = window.require('electron').remote;
const formTooltips = tooltips.unsupportedToken;

class UnsupportedTokenRecoveryForm extends Component {
  state = {
    walletId: '',
    tokenAddress: '',
    recoveryAddress: '',
    passphrase: '',
    prv: '',
    recoveryTx: null,
    logging: [''],
    error: '',
    recovering: false
  }

  collectLog = (...args) => {
    const { logging } = this.state;
    const newLogging = logging.concat(args);
    this.setState({ logging: newLogging });
  }

  updateRecoveryInfo = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  updateCheckbox = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.target.checked });
  }

  resetRecovery = () => {
    this.setState({
      walletId: '',
      tokenAddress: '',
      recoveryAddress: '',
      passphrase: '',
      prv: '',
      recoveryTx: null,
      logging: [''],
      error: '',
      recovering: false
    });
  }

  performRecovery = async () => {
    const { bitgo } = this.props;
    const {
      walletId,
      tokenAddress,
      recoveryAddress,
      passphrase,
      prv
    } = this.state;

    this.setState({ error: '', recovering: true });

    const coin = bitgo.env === 'prod' ? 'eth' : 'teth';

    try {
      const wallet = await bitgo.coin(coin).wallets().get({ id: walletId });
      const recoveryTx = await wallet.recoverToken({
        tokenContractAddress: tokenAddress,
        recipient: recoveryAddress,
        walletPassphrase: passphrase,
        prv: prv
      });

      if (!recoveryTx) {
        throw new Error('Half-signed recovery not found.');
      }

      if (recoveryTx.halfSigned.recipient.amount === '0') {
        throw new Error('Specified wallet\'s token balance on the base address is zero. Contact support@bitgo.com to forward tokens from a wallet\'s receive address.')
      }

      this.setState({ recoveryTx });
    } catch (e) {
      if (e.message === 'insufficient balance') { // this is terribly unhelpful
        e.message = 'token recovery requires a balance of ETH in the wallet - please send any amount of ETH to the wallet and retry'
      }
      this.collectLog(e.message);
      this.setState({ error: e.message, recovering: false });
    }
  }

  saveTransaction = () => {
    const fileData = this.state.recoveryTx;
    let fileName;
    const filePrefix = this.props.bitgo.env === 'prod' ? 'erc20' : 'terc20';

    fileName = `${filePrefix}r-${fileData.halfSigned.operationHash.slice(2,8)}-${moment().format('YYYYMMDD')}.signed.json`;

    const dialogParams = {
      filters: [{
        name: 'Custom File Type',
        extensions: ['json']
      }],
      defaultPath: '~/' + fileName
    };

    // Retrieve the desired file path and file name
    const filePath = dialog.showSaveDialog(dialogParams);
    if (!filePath) {
      // TODO: The user exited the file creation process. What do we do?
      return;
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(fileData, null, 4), 'utf8');
    } catch (err) {
      console.log('error saving', err);
      this.setState({ error: 'There was a problem saving your recovery file. Please try again.' });
    }
  }

  render() {
    return (
      <div>
        <h1 className='content-header'>Unsupported Token Recoveries</h1>
        <p className='subtitle'>This tool will help you recover ERC20 tokens that are not officially supported by BitGo.</p>
        <Alert color='warning'>
          Unsupported tokens may only be recovered from a wallet's base address. Please contact <a href='mailto:support@bitgo.com'>support@bitgo.com</a> to send tokens from a wallet's receive address to its base address.
        </Alert>
        <hr />
        <Form>
          <InputField
            label='Wallet ID'
            name='walletId'
            onChange={this.updateRecoveryInfo('walletId')}
            value={this.state.walletId}
            tooltipText={formTooltips.walletId}
          />
          <InputField
            label='Token Contract Address'
            name='tokenAddress'
            onChange={this.updateRecoveryInfo('tokenAddress')}
            value={this.state.tokenAddress}
            tooltipText={formTooltips.tokenAddress}
          />
          <InputField
            label='Destination Address'
            name='recoveryAddress'
            onChange={this.updateRecoveryInfo('recoveryAddress')}
            value={this.state.recoveryAddress}
            tooltipText={formTooltips.recoveryAddress}
          />
          <InputField
            label='Wallet Passphrase'
            name='passphrase'
            onChange={this.updateRecoveryInfo('passphrase')}
            value={this.state.passphrase}
            tooltipText={formTooltips.passphrase}
            isPassword={true}
          />
          <InputField
            label='Private Key'
            name='prv'
            onChange={this.updateRecoveryInfo('prv')}
            value={this.state.prv}
            tooltipText={formTooltips.prv}
            isPassword={true}
          />
          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
          {this.state.recoveryTx && <p className='recovery-logging'>Success! Token recovery transaction has been signed.</p>}
          <Row>
            <Col xs={12}>
              {!this.state.recoveryTx && !this.state.recovering &&
                <Button onClick={this.performRecovery} className='bitgo-button'>
                  Recover Tokens
                </Button>
              }
              {!this.state.recoveryTx && this.state.recovering &&
                <Button disabled={true} className='bitgo-button'>
                  Recovering...
                </Button>
              }
              {this.state.recoveryTx &&
                <Button onClick={this.saveTransaction} className='bitgo-button'>
                  Save Transaction
                </Button>
              }
              <Button onClick={this.resetRecovery} className='bitgo-button other'>
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

export default UnsupportedTokenRecoveryForm;
