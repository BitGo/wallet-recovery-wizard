import React, { Component, Fragment } from 'react';

import { CoinDropdown, InputField, MultiInputField } from './form-components';

import ErrorMessage from './error-message';

import { Form, Row, Col, Label, Input, Button } from 'reactstrap';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

import moment from 'moment';
import jszip from 'jszip';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';

const fs = window.require('fs');
const { dialog } = window.require('electron').remote;
const formTooltips = tooltips.crossChain;

class CrossChainRecoveryForm extends Component {
  state = {
    sourceCoin: 'btc',
    recoveryCoin: 'ltc',
    wallet: '',
    txids: [''],
    unspent: '',
    address: '',
    signed: true,
    recoveryAddress: '',
    passphrase: '',
    prv: '',
    recoveryTxs: [],
    logging: [''],
  };

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  };

  updateCheckbox = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.target.checked });
  };

  updateSelect = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.value });

    if (fieldName === 'sourceCoin') {
      const recoveryCoins = coinConfig.allCoins[option.value].supportedRecoveries;

      if (!recoveryCoins.includes(this.state.recoveryCoin)) {
        this.setState({ recoveryCoin: recoveryCoins[0] });
      }
    }
  };

  updateTxids = (index) => (value) => {
    const txids = this.state.txids;
    txids[index] = value;
    this.setState({ txids });
  };

  addBlankTxid = () => {
    const txids = this.state.txids;
    txids.push('');
    this.setState({ txids });
  };

  removeTxid = (index) => () => {
    const txids = this.state.txids;
    txids.splice(index, 1);
    this.setState({ txids });
  };

  resetRecovery = () => {
    this.setState({
      sourceCoin: 'btc',
      recoveryCoin: 'ltc',
      wallet: '',
      txids: [''],
      unspent: '',
      address: '',
      recoveryAddress: '',
      signed: true,
      passphrase: '',
      prv: '',
      recoveryTxs: [],
      logging: [''],
      error: '',
    });
  };

  getFileName = (index) => {
    if (this.state.signed) {
      return `${this.state.recoveryTxs[index].sourceCoin}r-${this.state.txids[index].slice(0, 6)}-${moment().format(
        'YYYYMMDD'
      )}.signed.json`;
    } else {
      return `${this.state.recoveryTxs[index].coin}r-${this.state.txids[index].slice(0, 6)}-${moment().format(
        'YYYYMMDD'
      )}.unsigned.json`;
    }
  };

  performRecovery = async () => {
    const { bitgo } = this.props;
    const { wallet, txids, recoveryAddress, signed, passphrase, prv } = this.state;

    const sourceCoin = bitgo.getEnv() === 'prod' ? this.state.sourceCoin : 't' + this.state.sourceCoin;
    const recoveryCoin = bitgo.getEnv() === 'prod' ? this.state.recoveryCoin : 't' + this.state.recoveryCoin;

    this.setState({ error: '' });

    const basecoin = bitgo.coin(sourceCoin);

    for (const txid of txids) {
      try {
        // Do not pass the default empty string to the SDK or it will try to use it as a valid xprv
        const xprv = _.isEmpty(prv) ? undefined : prv;
        const recoveryTx = await basecoin.recoverFromWrongChain({
          txid: txid,
          recoveryAddress: recoveryAddress,
          wallet: wallet,
          coin: bitgo.coin(recoveryCoin),
          signed: signed,
          walletPassphrase: passphrase,
          xprv,
        });

        let recoveryTxs = this.state.recoveryTxs;
        recoveryTxs.push(recoveryTx);

        // it's possible to have duplicate transactions if multiple wrong chain txs were on the same address. let's not
        // give support any more recoveries than they need :)
        recoveryTxs = _.uniqBy(recoveryTxs, 'txHex');

        this.setState({ recoveryTxs });
      } catch (e) {
        const err = `${e.message}`;
        this.collectLog(err);
        this.setState({ error: err });
      }
    }
  };

  saveSingleTransaction = async () => {
    const transaction = this.state.recoveryTxs[0];

    const fileName = this.getFileName(0);

    const dialogParams = {
      filters: [
        {
          name: 'Custom File Type',
          extensions: ['json'],
        },
      ],
      defaultPath: '~/' + fileName,
    };

    const filePath = await dialog.showSaveDialog(dialogParams);
    if (!filePath) {
      // TODO: The user exited the file creation process. What do we do?
      return;
    }

    try {
      fs.writeFileSync(filePath.filePath, JSON.stringify(transaction, null, 4), 'utf8');
    } catch (err) {
      console.log('error saving', err);
      this.setState({ error: 'There was a problem saving your recovery file. Please try again.' });
    }
  };

  saveMultipleTransactions = async () => {
    const transactions = this.state.recoveryTxs;

    const zip = new jszip();

    _.forEach(transactions, (transaction, index) => {
      const fileName = this.getFileName(index);

      zip.file(fileName, JSON.stringify(transaction, null, 4));
    });

    const zipName = `${this.state.sourceCoin}-recoveries-${this.state.wallet.slice(0, 6)}`;

    const dialogParams = {
      filters: [
        {
          name: 'Custom File Type',
          extensions: ['zip'],
        },
      ],
      defaultPath: '~/' + zipName,
    };

    const filePath = dialog.showSaveDialog(dialogParams);
    if (!filePath) {
      // TODO: The user exited the file creation process. What do we do?
      return;
    }

    try {
      await zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(filePath.filePath));
    } catch (err) {
      console.log('error saving', err);
      this.setState({ error: 'There was a problem saving your recovery file. Please try again.' });
    }
  };

  saveTransactions = async () => {
    if (this.state.recoveryTxs.length === 1) {
      await this.saveSingleTransaction();
    } else {
      await this.saveMultipleTransactions();
    }
  };

  collectLog = (...args) => {
    const { logging } = this.state;
    const newLogging = logging.concat(args);
    this.setState({ logging: newLogging });
  };

  render() {
    return (
      <div>
        <h1 className="content-header">Wrong Chain Recoveries</h1>
        <p className="subtitle">
          This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain.
        </p>
        <hr />
        {this.state.recoveryTxs.length === 0 && (
          <RecoveryTxForm
            formState={this.state}
            bitgo={this.props.bitgo}
            updateRecoveryInfo={this.updateRecoveryInfo}
            updateCheckbox={this.updateCheckbox}
            updateSelect={this.updateSelect}
            updateTxids={this.updateTxids}
            addBlankTxid={this.addBlankTxid}
            removeTxid={this.removeTxid}
            performRecovery={this.performRecovery}
            resetRecovery={this.resetRecovery}
          />
        )}
        {this.state.recoveryTxs.length > 0 && this.state.signed && (
          <ConfirmTxSigned
            txDetails={this.state.recoveryTxs}
            error={this.state.error}
            bitgo={this.props.bitgo}
            saveTransactions={this.saveTransactions}
            resetRecovery={this.resetRecovery}
          />
        )}
        {this.state.recoveryTxs.length > 0 && !this.state.signed && (
          <ConfirmTxUnsigned
            txDetails={this.state.recoveryTxs}
            error={this.state.error}
            bitgo={this.props.bitgo}
            saveTransactions={this.saveTransactions}
            resetRecovery={this.resetRecovery}
          />
        )}
      </div>
    );
  }
}

class RecoveryTxForm extends Component {
  render() {
    const {
      formState,
      bitgo,
      updateRecoveryInfo,
      updateCheckbox,
      updateSelect,
      updateTxids,
      addBlankTxid,
      removeTxid,
      performRecovery,
      resetRecovery,
    } = this.props;
    const { sourceCoin, recoveryCoin, logging, error } = formState;
    const allCoins = coinConfig.supportedRecoveries.crossChain;
    const recoveryCoins = coinConfig.allCoins[sourceCoin].supportedRecoveries;

    return (
      <Form>
        <Row>
          <Col xs={3}>
            <CoinDropdown
              label="Source Coin"
              name="sourceCoin"
              allowedCoins={allCoins}
              onChange={updateSelect('sourceCoin')}
              value={sourceCoin}
              tooltipText={formTooltips.sourceCoin()}
            />
          </Col>
          <Col xs={3}>
            <CoinDropdown
              label="Destination Coin"
              name="recoveryCoin"
              allowedCoins={recoveryCoins}
              onChange={updateSelect('recoveryCoin')}
              value={recoveryCoin}
              tooltipText={formTooltips.destinationCoin()}
            />
          </Col>
          <Col xs={3} style={{ display: 'flex', alignItems: 'center' }}>
            <Label check>
              <br />
              <Input type="checkbox" onChange={updateCheckbox('signed')} checked={formState.signed} /> Sign Transaction
            </Label>
          </Col>
        </Row>
        <Fragment>
          <InputField
            label="Wallet ID"
            name="wallet"
            value={formState.wallet}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.wallet(formState.recoveryCoin)}
            disallowWhiteSpace={true}
          />
          <MultiInputField
            label="Transaction IDs"
            name="txids"
            values={formState.txids}
            onChange={updateTxids}
            addField={addBlankTxid}
            removeField={removeTxid}
            tooltipText={formTooltips.txid(formState.sourceCoin)}
            disallowWhiteSpace={true}
          />
          <InputField
            label="Destination Address"
            name="recoveryAddress"
            value={formState.recoveryAddress}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.recoveryAddress(formState.sourceCoin)}
            disallowWhiteSpace={true}
            format="address"
            coin={bitgo.coin(bitgo.getEnv() === 'prod' ? formState.sourceCoin : 't' + formState.sourceCoin)}
          />
          {formState.signed && (
            <InputField
              label="Wallet Passphrase"
              name="passphrase"
              value={formState.passphrase}
              onChange={updateRecoveryInfo}
              tooltipText={formTooltips.passphrase(formState.recoveryCoin)}
              isPassword={true}
            />
          )}
          {formState.signed && (
            <InputField
              label="Private Key"
              name="prv"
              value={formState.prv}
              onChange={updateRecoveryInfo}
              tooltipText={formTooltips.prv(formState.recoveryCoin)}
              isPassword={true}
              disallowWhiteSpace={true}
            />
          )}
        </Fragment>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error &&
          logging.map((logLine, index) => (
            <p className="recovery-logging" key={index}>
              {logLine}
            </p>
          ))}
        <Row>
          <Col xs={12}>
            <Button onClick={performRecovery} className={'bitgo-button'}>
              Recover Funds
            </Button>
            <Button onClick={resetRecovery} className={'bitgo-button other'}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

class ConfirmTxSigned extends Component {
  render() {
    const { txDetails, error, bitgo } = this.props;
    let recoveryAmount = 0;

    for (const tx of txDetails) {
      recoveryAmount += tx.recoveryAmount;
    }

    return (
      <div>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Source Coin:
          </Col>
          <Col xs={5}>
            {bitgo.coin(txDetails[0].sourceCoin).getFullName()} ({txDetails[0].sourceCoin.toUpperCase()})
          </Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Recovery Coin:
          </Col>
          <Col xs={5}>
            {bitgo.coin(txDetails[0].recoveryCoin).getFullName()} ({txDetails[0].recoveryCoin.toUpperCase()})
          </Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Wallet:
          </Col>
          <Col xs={5}>{txDetails[0].walletId}</Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Amount to Recover:
          </Col>
          <Col xs={5}>
            {new BigNumber(recoveryAmount).times(1e-8).toFixed(8)} {txDetails[0].sourceCoin.toUpperCase()}
          </Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Destination Address:
          </Col>
          <Col xs={5}>{txDetails[0].recoveryAddress}</Col>
        </Row>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Row>
          <Col xs={12}>
            <Button onClick={this.props.saveTransactions} className="bitgo-button">
              Save Recovery Transaction
            </Button>
            <Button onClick={this.props.resetRecovery} className="bitgo-button other">
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

class ConfirmTxUnsigned extends Component {
  render() {
    const { txDetails, error, bitgo } = this.props;
    let recoveryAmount = 0;

    for (const tx of txDetails) {
      recoveryAmount += tx.amount;
    }

    return (
      <div>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Source Coin:
          </Col>
          <Col xs={5}>
            {bitgo.coin(txDetails[0].coin).getFullName()} ({txDetails[0].coin.toUpperCase()})
          </Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Wallet:
          </Col>
          <Col xs={5}>{txDetails[0].walletId}</Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Amount to Recover:
          </Col>
          <Col xs={5}>
            {new BigNumber(recoveryAmount).times(1e-8).toFixed(8)} {txDetails[0].coin.toUpperCase()}
          </Col>
        </Row>
        <Row>
          <Col xs={3} className="confirm-tx-field">
            Destination Address:
          </Col>
          <Col xs={5}>{txDetails[0].address}</Col>
        </Row>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Row>
          <Col xs={12}>
            <Button onClick={this.props.saveTransactions} className="bitgo-button">
              Save Recovery Transaction
            </Button>
            <Button onClick={this.props.resetRecovery} className="bitgo-button other">
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CrossChainRecoveryForm;
