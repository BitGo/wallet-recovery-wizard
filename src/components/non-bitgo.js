import React, { Component } from 'react';
import Select from 'react-select';
import { CoinDropdown, FieldTooltip, InputField, InputTextarea } from '@src/components/form-components';
import { Alert, Button, Col, Form, FormGroup, Label, Row } from 'reactstrap';
import classNames from 'classnames';
import ErrorMessage from '@src/components/error-message';
import * as BitGoJS from 'bitgo/dist/browser/BitGoJS.min';

import tooltips from '@src/constants/tooltips';
import coinConfig from '@src/constants/coin-config';
import krsProviders from '@src/constants/krs-providers';
import { getRecoveryDebugInfo, isDev, recoverWithKeyPath } from '../utils';

const { clipboard } = window.require('electron');

const formTooltips = tooltips.recovery;
const { dialog } = window.require('electron').remote;
const fs = window.require('fs');

function getEmptyState() {
  return {
    userKey: '',
    backupKey: '',
    bitgoKey: '',
    coin: 'btc',
    walletContractAddress: '',
    rootAddress: '',
    tokenAddress: '',
    walletPassphrase: '',
    recoveryDestination: '',
    env: 'test',
    done: false,
    error: '',
    krsProvider: undefined,
    apiKey: '',
    scan: 20,
    gasPrice: 20, // this is in gwei, and only a default value if users do not override
    gasLimit: 500000,
  };
}

class NonBitGoRecoveryForm extends Component {
  state = getEmptyState();

  requiredParams = {
    btc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    bsv: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
    bch: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
    bcha: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan', 'apiKey'],
    ltc: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    btg: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    zec: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    dash: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination', 'scan'],
    eth: [
      'userKey',
      'backupKey',
      'walletContractAddress',
      'walletPassphrase',
      'recoveryDestination',
      'apiKey',
      'gasLimit',
      'gasPrice',
    ],
    xrp: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
    xlm: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
    trx: ['userKey', 'backupKey', 'bitgoKey', 'walletPassphrase', 'recoveryDestination'],
    token: [
      'userKey',
      'backupKey',
      'walletContractAddress',
      'tokenContractAddress',
      'walletPassphrase',
      'recoveryDestination',
      'apiKey',
    ],
    eos: ['userKey', 'backupKey', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  };

  async copyDebugInfo() {
    const { error } = this.state;

    let recoveryDebugInfo;

    try {
      recoveryDebugInfo = await getRecoveryDebugInfo(await this.getCoinObject(), this.getRecoveryParams());
    } catch (e) {
      console.error(`error gathering recovery debug info`, e);
      recoveryDebugInfo = e;
    }

    const errorInfo = {
      errorMessage: error && error.message,
      errorStack: error && error.stack,
      recoveryDebugInfo,
    };

    clipboard.writeText(JSON.stringify(errorInfo, null, 2));

    if (isDev()) {
      console.log('copied to clipboard:', errorInfo);
    }
  }

  getCoinObject = () => {
    this.props.bitgo._env = this.state.env;
    let bitgo = this.props.bitgo;
    let coin;

    if (this.state.apiKey && this.state.apiKey !== '') {
      bitgo = new BitGoJS.BitGo({ env: this.state.env, etherscanApiToken: this.state.apiKey });
    }

    if (this.state.coin === 'token') {
      try {
        coin = bitgo.coin(this.state.tokenAddress);
      } catch (e) {
        // if we're here, the token address is malformed. let's set the coin to ETH so we can still validate addresses
        const coinTicker = this.state.env === 'test' ? 'teth' : 'eth';
        coin = bitgo.coin(coinTicker);
      }
    } else {
      const coinTicker = this.state.env === 'test' ? `t${this.state.coin}` : this.state.coin;
      coin = bitgo.coin(coinTicker);
    }

    return coin;
  };

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  };

  updateEnv = (option) => {
    this.setState({ env: option.value });
  };

  updateCoin = (option) => {
    this.setState({ coin: option.value });
  };

  updateKrs = (option) => {
    if (option === null) {
      this.setState({ krsProvider: null });
    } else {
      this.setState({ krsProvider: option.value });
    }
  };

  getRecoveryParams() {
    // This is like _.pick
    return [
      'userKey',
      'backupKey',
      'bitgoKey',
      'rootAddress',
      'walletContractAddress',
      'tokenAddress',
      'walletPassphrase',
      'recoveryDestination',
      'scan',
      'krsProvider',
      'gasLimit',
      'gasPrice',
    ].reduce((obj, param) => {
      if (this.state[param]) {
        const value = this.state[param];

        return Object.assign(obj, { [param]: value });
      }
      return obj;
    }, {});
  }

  async performRecoveryWithParams(baseCoin, recoveryParams) {
    if ((this.state.coin === 'bsv' || this.state.coin === 'bch' || this.state.coin === 'bcha') && this.state.apiKey) {
      recoveryParams.apiKey = this.state.apiKey;
    }

    if (!coinConfig.allCoins[this.state.coin].recoverP2wsh) {
      recoveryParams.ignoreAddressTypes = ['p2wsh'];
    }

    if (recoveryParams.gasLimit) {
      if (recoveryParams.gasLimit <= 0 || recoveryParams.gasLimit !== parseInt(recoveryParams.gasLimit, 10)) {
        throw new Error('Gas limit must be a positive integer');
      }
    }

    if (recoveryParams.gasPrice) {
      if (recoveryParams.gasPrice <= 0 || recoveryParams.gasPrice !== parseInt(recoveryParams.gasPrice, 10)) {
        throw new Error('Gas price must be a positive integer');
      }
      // convert the units back to wei, since that is the unit that backend uses
      recoveryParams.gasPrice = recoveryParams.gasPrice * 10 ** 9;
    }
    const recovery = await recoverWithKeyPath(baseCoin, recoveryParams);

    const recoveryTx = recovery.transactionHex || recovery.txHex || recovery.tx || recovery.transaction;

    if (!recoveryTx) {
      throw new Error('Fully-signed recovery transaction not detected.');
    }

    const fileName = baseCoin.getChain() + '-recovery-' + Date.now().toString() + '.json';
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
    const filePath = await dialog.showSaveDialog(dialogParams);
    if (!filePath) {
      // TODO: The user exited the file creation process. What do we do?
      return;
    }

    fs.writeFileSync(filePath.filePath, JSON.stringify(recovery, null, 4), 'utf8');

    this.setState({ recovering: false, done: true, finalFilename: [filePath.filePath] });
    if (this.state.coin === 'eos') {
      const now = new Date();
      const sevenHoursFromNow = new Date(now.getTime() + 7 * 60 * 60 * 1000).toLocaleTimeString({
        hour: '2-digit',
        minute: '2-digit',
      });
      const eightHoursFromNow = new Date(now.getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString({
        hour: '2-digit',
        minute: '2-digit',
      });
      alert(
        `In seven hours, you will have an one-hour window to broadcast your EOS transaction: from ${sevenHoursFromNow} to ${eightHoursFromNow}.` +
          `For more information, please visit https://github.com/BitGo/wallet-recovery-wizard/blob/master/EOS.md.`
      );
    } else {
      alert(
        'We recommend that you use a third-party API to decode your txHex' +
          'and verify its accuracy before broadcasting.'
      );
    }
  }

  async performRecovery() {
    this.setState({ recovering: true, error: null });

    const baseCoin = await this.getCoinObject();

    const recoveryTool = baseCoin.recover;

    if (!recoveryTool) {
      this.setState({
        error: new Error(`Recovery tool not found for ${this.state.coin}`),
        recovering: false,
      });
      return;
    }

    try {
      await this.performRecoveryWithParams(baseCoin, this.getRecoveryParams());
    } catch (e) {
      this.setState({ error: e, recovering: false });
    }
  }

  resetRecovery = () => {
    this.setState(getEmptyState());
  };

  render() {
    const recoveryCoins = coinConfig.supportedRecoveries.nonBitGo[this.state.env];
    const { isLoggedIn } = this.props;
    let warning;
    if (coinConfig.allCoins[this.state.coin].replayableNetworks) {
      const replayWarning = tooltips.replayTxWarning(this.state.coin);
      warning = (
        <Alert color="danger">
          <p>{replayWarning}</p>
        </Alert>
      );
    }
    return (
      <div className={classNames(isLoggedIn || 'content-centered')}>
        <h1 className="content-header">Non-BitGo Recovery</h1>
        <p className="subtitle">
          This tool will help you use your recovery KeyCard to build and send a transaction that does not rely on BitGo
          APIs.
        </p>
        {warning}
        <hr />
        <Form>
          <Row>
            <Col xs={5}>
              <CoinDropdown
                label="Coin Name"
                name="coin"
                allowedCoins={recoveryCoins}
                onChange={this.updateCoin}
                value={this.state.coin}
              />
            </Col>
            <Col xs={4}>
              <FormGroup>
                <Label className="input-label">Key Recovery Service</Label>
                <FieldTooltip name="krs" text={formTooltips.krsProvider} />
                <Select
                  type="select"
                  className="bitgo-select"
                  options={krsProviders}
                  onChange={this.updateKrs}
                  name="krsProvider"
                  value={this.state.krsProvider}
                  clearable={true}
                  searchable={false}
                  placeholder="None"
                />
              </FormGroup>
            </Col>
            <Col xs={3}>
              <FormGroup>
                <Label className="input-label">Environment</Label>
                <Select
                  type="select"
                  className="bitgo-select"
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
          {this.requiredParams[this.state.coin].includes('userKey') && (
            <InputTextarea
              label="Box A Value"
              name="userKey"
              value={this.state.userKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.userKey}
              disallowWhiteSpace={true}
              format="json"
            />
          )}

          {this.requiredParams[this.state.coin].includes('backupKey') && [
            this.state.krsProvider ? (
              <InputField
                label="Box B Value"
                name="backupKey"
                value={this.state.backupKey}
                onChange={this.updateRecoveryInfo}
                tooltipText={formTooltips.backupPublicKey}
                disallowWhiteSpace={true}
                format="pub"
                coin={this.getCoinObject()}
              />
            ) : (
              <InputTextarea
                label="Box B Value"
                name="backupKey"
                value={this.state.backupKey}
                onChange={this.updateRecoveryInfo}
                tooltipText={formTooltips.backupPrivateKey}
                disallowWhiteSpace={true}
                format="json"
              />
            ),
          ]}

          {this.requiredParams[this.state.coin].includes('bitgoKey') && (
            <InputField
              label="Box C Value"
              name="bitgoKey"
              value={this.state.bitgoKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.bitgoKey}
              disallowWhiteSpace={true}
              format="pub"
            />
          )}

          {this.requiredParams[this.state.coin].includes('rootAddress') && (
            <InputField
              label="Root Address"
              name="rootAddress"
              value={this.state.rootAddress}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.rootAddress}
              disallowWhiteSpace={true}
              format="address"
              coin={this.getCoinObject()}
            />
          )}

          {this.requiredParams[this.state.coin].includes('walletContractAddress') && (
            <InputField
              label="Wallet Contract Address"
              name="walletContractAddress"
              value={this.state.walletContractAddress}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.walletContractAddress}
              disallowWhiteSpace={true}
              format="address"
              coin={this.getCoinObject()}
            />
          )}

          {this.requiredParams[this.state.coin].includes('tokenContractAddress') && (
            <InputField
              label="Token Contract Address"
              name="tokenAddress"
              value={this.state.tokenAddress}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.tokenAddress}
              disallowWhiteSpace={true}
              format="address"
              coin={this.getCoinObject()}
            />
          )}

          {this.requiredParams[this.state.coin].includes('walletPassphrase') && (
            <InputField
              label="Wallet Passphrase"
              name="walletPassphrase"
              value={this.state.walletPassphrase}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.walletPassphrase}
              isPassword={true}
            />
          )}

          {this.requiredParams[this.state.coin].includes('recoveryDestination') && (
            <InputField
              label="Destination Address"
              name="recoveryDestination"
              value={this.state.recoveryDestination}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.recoveryDestination}
              disallowWhiteSpace={true}
              format="address"
              coin={this.getCoinObject()}
            />
          )}

          {this.requiredParams[this.state.coin].includes('scan') && (
            <InputField
              label="Address Scanning Factor"
              name="scan"
              value={this.state.scan}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.scan}
              disallowWhiteSpace={true}
              format="number"
            />
          )}

          {this.requiredParams[this.state.coin].includes('apiKey') && (
            <InputField
              label="API Key"
              name="apiKey"
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.apiKey(this.state.coin)}
              disallowWhiteSpace={true}
              placeholder="None"
            />
          )}

          {this.requiredParams[this.state.coin].includes('gasLimit') && (
            <InputField
              label="Gas Limit"
              name="gasLimit"
              value={this.state.gasLimit}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.gasLimit}
              disallowWhiteSpace={true}
              format="number"
            />
          )}

          {this.requiredParams[this.state.coin].includes('gasPrice') && (
            <InputField
              label="Gas Price (Gwei)"
              name="gasPrice"
              value={this.state.gasPrice}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.gasPrice}
              disallowWhiteSpace={true}
              format="number"
            />
          )}

          {this.state.error && <ErrorMessage>{this.state.error.message}</ErrorMessage>}
          {this.state.done && (
            <p className="recovery-logging">
              Completed constructing recovery transaction. Saved recovery file: {this.state.finalFilename}
            </p>
          )}
          {!this.state.done && (
            <Button onClick={this.performRecovery.bind(this)} disabled={this.state.recovering} className="bitgo-button">
              {this.state.recovering ? 'Recovering...' : 'Recover Funds'}
            </Button>
          )}
          {this.state.done && (
            <Button onClick={this.resetRecovery} className="bitgo-button">
              Perform Another Recovery
            </Button>
          )}

          <Button onClick={this.copyDebugInfo.bind(this)} className="bitgo-button other">
            Copy Debug Information
          </Button>
        </Form>
      </div>
    );
  }
}

export default NonBitGoRecoveryForm;
