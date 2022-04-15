import React, { Component } from 'react';
import Select from 'react-select';
import { InputField, CoinDropdown } from './form-components';
import { Alert, Form, Button, Row, Col, FormGroup, Label } from 'reactstrap';
import { Chain, Hardfork } from '@ethereumjs/common';
import { omit } from 'lodash';
import classNames from 'classnames';
import ErrorMessage from './error-message';
import * as BitGoJS from 'bitgo';
import * as Errors from 'bitgo/dist/src/errors';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';
import { isBlockChairKeyNeeded, recoverWithKeyPath, toWei, getDerivedXpub } from '../utils';
const fs = window.require('fs');
const formTooltips = tooltips.unsignedSweep;
const { dialog } = window.require('electron').remote;
const utxoLib = require('bitgo-utxo-lib');
import { alchemyApiKey } from '../../config/env';

class UnsignedSweep extends Component {
  state = {
    coin: 'btc',
    userKey: '',
    userKeyID: '',
    backupKey: '',
    backupKeyID: '',
    bitgoKey: '',
    rootAddress: '',
    walletContractAddress: '',
    tokenAddress: '',
    walletPassphrase: '',
    recoveryDestination: '',
    apiKey: '',
    scan: 20,
    krsProvider: null,
    env: 'test',
    gasLimit: 500000,
    // Below values is in gwei, and only a default value if users do not override
    gasPrice: 20,
    maxFeePerGas: 20,
    maxPriorityFeePerGas: 10,
  };

  displayedParams = {
    btc: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan'],
    bsv: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    bcha: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    bch: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    ltc: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    btg: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    zec: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    dash: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan', 'apiKey'],
    eth: [
      'userKey',
      'userKeyID',
      'backupKey',
      'backupKeyID',
      'walletContractAddress',
      'walletPassphrase',
      'recoveryDestination',
      'apiKey',
      'gasLimit',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ],
    xrp: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'rootAddress', 'recoveryDestination'],
    xlm: ['userKey', 'backupKey', 'rootAddress', 'recoveryDestination'],
    token: [
      'userKey',
      'userKeyID',
      'backupKey',
      'backupKeyID',
      'walletContractAddress',
      'tokenContractAddress',
      'recoveryDestination',
      'apiKey',
      'gasLimit',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ],
    trx: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'bitgoKey', 'recoveryDestination', 'scan'],
    eos: ['userKey', 'userKeyID', 'backupKey', 'backupKeyID', 'rootAddress', 'walletPassphrase', 'recoveryDestination'],
  };

  getCoinObject = () => {
    this.props.bitgo._env = this.state.env;
    let coin;
    let bitgo = this.props.bitgo;
    if (this.state.apiKey && this.state.apiKey !== '') {
      bitgo = new BitGoJS.BitGo({ env: this.state.env, etherscanApiToken: this.state.apiKey });
    }
    if (this.state.coin === 'token') {
      try {
        // Token addresses are lowercase in bitgo statics
        coin = bitgo.coin(this.state.tokenAddress.toLowerCase());
      } catch (e) {
        // if we're here, the token address is malformed. let's set the coin to ETH so we can still validate addresses
        const coinTicker = this.state.env === 'test' ? 'gteth' : 'eth';
        coin = bitgo.coin(coinTicker);
      }
    } else {
      let coinTicker = this.state.env === 'test' ? `t${this.state.coin}` : this.state.coin;
      // Goerli testnet is denoted by gteth which is different from our normal convention of denoting
      // test coins
      coinTicker = this.state.coin === 'eth' && this.state.env === 'test' ? `g${coinTicker}` : coinTicker;
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

  isDerivationPath = (derivationId, keyName) => {
    const derivationPathMessage =
      'Is the provided value a Derivation Path or a Seed?\n' + keyName + ': ' + derivationId + '\n';

    if (derivationId.length > 2 && derivationId.indexOf('m/') === 0) {
      const response = dialog.showMessageBox({
        type: 'question',
        buttons: ['Derivation Path', 'Seed'],
        title: 'Derivation Path?',
        message: derivationPathMessage,
      });

      return response === 0;
    }

    return false;
  };

  deriveKeyByPath = (key, path) => {
    try {
      const node = utxoLib.HDNode.fromBase58(key);
      const derivedNode = node.derivePath(path);
      return derivedNode.toBase58();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // If the user and/or backup keys are derived with a KeyID, we need to derive the proper key from that
  updateKeysFromIDs = (basecoin, recoveryParams) => {
    const keyInfo = [
      {
        id: recoveryParams.userKeyID,
        key: recoveryParams.userKey,
        description: 'User Key ID',
        name: 'userKey',
      },
      {
        id: recoveryParams.backupKeyID,
        key: recoveryParams.backupKey,
        description: 'Backup Key ID',
        name: 'backupKey',
      },
    ];

    keyInfo.forEach((keyObj) => {
      if (keyObj.id && keyObj.id !== '') {
        if (this.isDerivationPath(keyObj.id, keyObj.description)) {
          recoveryParams[keyObj.name] = this.deriveKeyByPath(keyObj.key, keyObj.id);
        } else {
          const response = basecoin.deriveKeyWithSeed({ key: keyObj.key, seed: keyObj.id });
          recoveryParams[keyObj.name] = response.key;
        }
        // once we've derived the key, then delete the keyID so we don't pass it through to the SDK
        delete recoveryParams[keyObj.name + 'ID'];
      }
    });
  };

  async performRecovery() {
    this.setState({ recovering: true, error: '' });

    const baseCoin = await this.getCoinObject();

    const recoveryTool = baseCoin.recover;

    if (!recoveryTool) {
      this.setState({ error: `Recovery tool not found for ${this.state.coin}`, recovering: false });
      return;
    }

    try {
      // This is like _.pick
      let recoveryParams = [
        'userKey',
        'userKeyID',
        'backupKey',
        'backupKeyID',
        'bitgoKey',
        'rootAddress',
        'walletContractAddress',
        'walletPassphrase',
        'tokenAddress',
        'recoveryDestination',
        'scan',
        'gasLimit',
        'gasPrice',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
      ].reduce((obj, param) => {
        if (this.state[param]) {
          const value = this.state[param];

          return Object.assign(obj, { [param]: value });
        }

        return obj;
      }, {});

      if (recoveryParams.gasLimit) {
        if (recoveryParams.gasLimit <= 0 || recoveryParams.gasLimit !== parseInt(recoveryParams.gasLimit, 10)) {
          throw new Error('Gas limit must be a positive integer');
        }
      } else {
        const network = recoveryParams.env === 'test' ? 'goerli' : 'mainnet';
        const url = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;
        const data = { jsonrpc: '2.0', method: 'eth_estimateGas', params: [{ from: recoveryParams.rootAddress, to: recoveryParams.recoveryDestination }], id: 1 };
        fetch(url, {
          body: JSON.stringify(data),
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        })
          .then(response => {
            if (response.status === 200) {
              recoveryParams.gasLimit = response.result;
            } else {
              throw new Error('Error fetching gas estimate from Alchemy');
            }
          })
          .catch(error => {
            console.error(error);
          });
      }

      if (this.state.coin === 'eth' || this.state.coin === 'token') {
        recoveryParams = {
          ...recoveryParams,
          eip1559: {
            maxFeePerGas: toWei(recoveryParams.maxFeePerGas),
            maxPriorityFeePerGas: toWei(recoveryParams.maxPriorityFeePerGas),
          },
          replayProtectionOptions: {
            chain: this.state.env === 'prod' ? Chain.Mainnet : Chain.Goerli,
            hardfork: Hardfork.London,
          },
        };
        recoveryParams = omit(recoveryParams, ['gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas']);
      } else if (recoveryParams.gasPrice) {
        if (recoveryParams.gasPrice <= 0 || recoveryParams.gasPrice !== parseInt(recoveryParams.gasPrice, 10)) {
          throw new Error('Gas price must be a positive integer');
        }
        recoveryParams.gasPrice = toWei(recoveryParams.gasPrice);
      }

      if (
        isBlockChairKeyNeeded(this.state.coin)
        && this.state.apiKey) {
        recoveryParams.apiKey = this.state.apiKey;
      }

      this.updateKeysFromIDs(baseCoin, recoveryParams);

      const recoveryPrebuild = await recoverWithKeyPath(baseCoin, recoveryParams);

      // If key derivation path is defined, we will use that to give the derivated xpubs instead of the master xpubs
      const userXpub = this.state['userKeyID'] ? getDerivedXpub(baseCoin, this.state['userKey'], this.state['userKeyID'])?.key : this.state['userKey'];
      const backupXpub = this.state['backupKeyID'] ? getDerivedXpub(baseCoin, this.state['backupKey'], this.state['backupKeyID'])?.key : this.state['backupKey'];
      recoveryPrebuild.xpubsWithDerivationPath = {
        user: { xpub: userXpub, derivedFromParentWithSeed: this.state['userKeyID'] },
        backup: { xpub: backupXpub, derivedFromParentWithSeed: this.state['backupKeyID'] },
        bitgo: { xpub: this.state['bitgoKey'] },
      };

      // Keeping the pubs key intact to ensure people who use old
      // OVC < v4.2.1 won't be blocked. This will be deprecated
      // in future
      recoveryPrebuild.pubs = [
        userXpub,
        backupXpub,
        this.state['bitgoKey'],
      ];

      if (!recoveryPrebuild) {
        throw new Errors.ErrorNoInputToRecover();
      }

      const fileName = baseCoin.getChain() + '-unsigned-sweep-' + Date.now().toString() + '.json';
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

      fs.writeFileSync(filePath.filePath, JSON.stringify(recoveryPrebuild, null, 4), 'utf8');
      this.setState({ recovering: false, done: true, finalFilename: filePath.filePath });
      alert(
        'We recommend that you use a third-party API to decode your txHex' +
          'and verify its accuracy before broadcasting.'
      );
    } catch (e) {
      console.error(e);
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
      error: '',
    });
  };

  render() {
    const recoveryCoins = coinConfig.supportedRecoveries.unsignedSweep[this.state.env];
    const { isLoggedIn } = this.props;
    let warning;
    if (coinConfig.allCoins[this.state.coin].replayableNetworks) {
      const replayWarningText = tooltips.replayTxWarning(this.state.coin);
      warning = (
        <Alert color="danger">
          <p>{replayWarningText}</p>
        </Alert>
      );
    }
    return (
      <div className={classNames(isLoggedIn || 'content-centered')}>
        <h1 className="content-header">Build Unsigned Sweep</h1>
        <p className="subtitle">
          This tool will construct an unsigned sweep transaction on the wallet you specify without using BitGo.
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
          {this.displayedParams[this.state.coin].includes('userKey') && (
            <InputField
              label="User Public Key"
              name="userKey"
              value={this.state.userKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.userKey}
              disallowWhiteSpace={true}
              format="pub"
            />
          )}

          {this.displayedParams[this.state.coin].includes('userKeyID') && (
            <InputField
              label="User Key ID (optional)"
              name="userKeyID"
              value={this.state.userKeyID}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.userKeyID}
              disallowWhiteSpace={false}
            />
          )}

          {this.displayedParams[this.state.coin].includes('backupKey') && (
            <InputField
              label="Backup Public Key"
              name="backupKey"
              value={this.state.backupKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.backupPublicKey}
              disallowWhiteSpace={true}
              format="pub"
            />
          )}

          {this.displayedParams[this.state.coin].includes('backupKeyID') && (
            <InputField
              label="Backup Key ID (optional)"
              name="backupKeyID"
              value={this.state.backupKeyID}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.backupKeyID}
              disallowWhiteSpace={false}
            />
          )}

          {this.displayedParams[this.state.coin].includes('bitgoKey') && (
            <InputField
              label="BitGo Public Key"
              name="bitgoKey"
              value={this.state.bitgoKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.bitgoKey}
              disallowWhiteSpace={true}
              format="pub"
            />
          )}

          {this.displayedParams[this.state.coin].includes('rootAddress') && (
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

          {this.displayedParams[this.state.coin].includes('walletContractAddress') && (
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

          {this.displayedParams[this.state.coin].includes('tokenContractAddress') && (
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

          {this.displayedParams[this.state.coin].includes('walletPassphrase') && (
            <InputField
              label="Wallet Passphrase"
              name="walletPassphrase"
              value={this.state.walletPassphrase}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.walletPassphrase}
              isPassword={true}
            />
          )}

          {this.displayedParams[this.state.coin].includes('recoveryDestination') && (
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

          {this.displayedParams[this.state.coin].includes('scan') && (
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

          {this.displayedParams[this.state.coin].includes('gasPrice') && (
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

          {this.displayedParams[this.state.coin].includes('gasLimit') && (
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

          {this.displayedParams[this.state.coin].includes('maxFeePerGas') && (
            <InputField
              label="Max Fee Per Gas (Gwei)"
              name="maxFeePerGas"
              value={this.state.maxFeePerGas}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.maxFeePerGas}
              disallowWhiteSpace={true}
              format="number"
            />
          )}

          {this.displayedParams[this.state.coin].includes('maxPriorityFeePerGas') && (
            <InputField
              label="Max Priority Fee Per Gas (Gwei)"
              name="maxPriorityFeePerGas"
              value={this.state.maxPriorityFeePerGas}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.maxPriorityFeePerGas}
              disallowWhiteSpace={true}
              format="number"
            />
          )}

          {this.displayedParams[this.state.coin].includes('apiKey') && (
            <InputField
              label="API Key"
              name="apiKey"
              value={this.state.apiKey}
              onChange={this.updateRecoveryInfo}
              tooltipText={formTooltips.apiKey(this.state.coin)}
              disallowWhiteSpace={true}
              placeholder="None"
            />
          )}

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
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
        </Form>
      </div>
    );
  }
}

export default UnsignedSweep;
