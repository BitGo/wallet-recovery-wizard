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
    recovering: false,
    submitted: null,
    twofa: '',
  };

  collectLog = (...args) => {
    const { logging } = this.state;
    const newLogging = logging.concat(args);
    this.setState({ logging: newLogging });
  };

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  };

  updateCheckbox = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.target.checked });
  };

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
      submitted: null,
      recovering: false,
      twofa: '',
    });
  };

  performRecovery = async () => {
    const { bitgo } = this.props;
    const { walletId, tokenAddress, recoveryAddress, passphrase, prv, twofa } = this.state;

    this.setState({ error: '', recovering: true });

    const coin = bitgo.getEnv() === 'prod' ? 'eth' : 'teth';
    await bitgo.unlock({ otp: twofa });
    try {
      const wallet = await bitgo.coin(coin).wallets().get({ id: walletId });
      const response = await wallet.recoverToken({
        tokenContractAddress: tokenAddress,
        recipient: recoveryAddress,
        walletPassphrase: passphrase,
        prv,
        broadcast: true,
      });

      if (response) {
        this.setState({ submitted: true });
        return;
      }
    } catch (e) {
      if (e.message === 'insufficient balance') {
        // this is terribly unhelpful
        e.message =
          'token recovery requires a balance of ETH in the wallet - please send any amount of ETH to the wallet and retry';
      } else if (e.message.includes('denied by policy')) {
        e.message =
          'Recovery denied by policy. Unsupported token recoveries require approval from a second admin on you wallet. Please use the BitGo website to add another admin to your wallet, then try again. If you have any questions, contact support@bitgo.com';
      }
      this.collectLog(e.message);
      this.setState({ error: e.message, recovering: false });
    }
  };

  saveTransaction = () => {
    const fileData = this.state.recoveryTx;
    const filePrefix = this.props.bitgo.getEnv() === 'prod' ? 'erc20' : 'terc20';
    const fileName = `${filePrefix}r-${fileData.halfSigned.operationHash.slice(2, 8)}-${moment().format(
      'YYYYMMDD'
    )}.signed.json`;

    const dialogParams = {
      filters: [
        {
          name: 'Custom File Type',
          extensions: ['json'],
        },
      ],
      defaultPath: '~/' + fileName,
    };

    // Retrieve the desired file path and file name
    const filePath = dialog.showSaveDialog(dialogParams);
    if (!filePath) {
      // TODO: The user exited the file creation process. What do we do?
      return;
    }

    try {
      fs.writeFileSync(filePath.filePath, JSON.stringify(fileData, null, 4), 'utf8');
    } catch (err) {
      console.log('error saving', err);
      this.setState({ error: 'There was a problem saving your recovery file. Please try again.' });
    }
  };

  render() {
    const coin = this.props.bitgo.getEnv() === 'prod' ? 'eth' : 'teth';

    return (
      <div>
        <h1 className="content-header">Unsupported Token Recoveries</h1>
        <p className="subtitle">
          This tool will help you recover ERC20 tokens that are not officially supported by BitGo.
        </p>
        <Alert color="warning">
          Unsupported tokens may only be recovered from a wallet&apos;s base address. Please contact{' '}
          <a href="mailto:support@bitgo.com">support@bitgo.com</a> to send tokens from a wallet&apos;s receive address
          to its base address.
        </Alert>
        <hr />
        <Form>
          <InputField
            label="Wallet ID"
            name="walletId"
            onChange={this.updateRecoveryInfo}
            value={this.state.walletId}
            tooltipText={formTooltips.walletId}
            disallowWhiteSpace={true}
          />
          <InputField
            label="Token Contract Address"
            name="tokenAddress"
            onChange={this.updateRecoveryInfo}
            value={this.state.tokenAddress}
            tooltipText={formTooltips.tokenAddress}
            disallowWhiteSpace={true}
            format="address"
            coin={this.props.bitgo.coin(coin)}
          />
          <InputField
            label="Destination Address"
            name="recoveryAddress"
            onChange={this.updateRecoveryInfo}
            value={this.state.recoveryAddress}
            tooltipText={formTooltips.recoveryAddress}
            disallowWhiteSpace={true}
            format="address"
            coin={this.props.bitgo.coin(coin)}
          />
          <InputField
            label="Wallet Passphrase"
            name="passphrase"
            onChange={this.updateRecoveryInfo}
            value={this.state.passphrase}
            tooltipText={formTooltips.passphrase}
            isPassword={true}
          />
          <InputField
            label="Private Key"
            name="prv"
            onChange={this.updateRecoveryInfo}
            value={this.state.prv}
            tooltipText={formTooltips.prv}
            isPassword={true}
            disallowWhiteSpace={true}
          />
          <InputField
            label="2FA Code"
            name="twofa"
            onChange={this.updateRecoveryInfo}
            value={this.state.twofa}
            tooltipText={formTooltips.twofa}
            isPassword={false}
          />
          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
          {this.state.submitted && (
            <p className="recovery-logging">
              Success! Token recovery transaction has been signed and sent to BitGo. The transaction now requires
              approval from another admin on your wallet. Please have another admin login to the website and approve the
              transaction. Since the token is unsupported, the transaction will appear to have a value of 0 ETH.
            </p>
          )}
          <Row>
            <Col xs={12}>
              {!this.state.submitted && !this.state.recovering && (
                <Button onClick={this.performRecovery} className="bitgo-button">
                  Recover Tokens
                </Button>
              )}
              {!this.state.submitted && this.state.recovering && (
                <Button disabled={true} className="bitgo-button">
                  Recovering...
                </Button>
              )}
              <Button onClick={this.resetRecovery} className="bitgo-button other">
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default UnsupportedTokenRecoveryForm;
