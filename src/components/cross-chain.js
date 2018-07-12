import React, { Component, Fragment } from 'react';

import {
  CoinDropdown,
  InputField
} from './form-components';

import ErrorMessage from './error-message';

import {
  Form,
  Row,
  Col,
  Label,
  Input,
  Button
} from 'reactstrap';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

import moment from 'moment';

const fs = window.require('fs');
const { dialog } = window.require('electron').remote;
const formTooltips = tooltips.crossChain;

class CrossChainRecoveryForm extends Component {
  state = {
    sourceCoin: 'btc',
    recoveryCoin: 'ltc',
    wallet: '',
    txid: '',
    unspent: '',
    address: '',
    signed: true,
    recoveryAddress: '',
    passphrase: '',
    prv: '',
    recoveryTx: null,
    logging: ['']
  }

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  }

  updateCheckbox = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.target.checked });
  }

  updateSelect = (fieldName) => (option) => {
    this.setState({ [fieldName]: option.value });

    if (fieldName === 'sourceCoin') {
      const recoveryCoins = coinConfig.allCoins[option.value].supportedRecoveries;

      if (!recoveryCoins.includes(this.state.recoveryCoin)) {
        this.setState({ recoveryCoin: recoveryCoins[0] });
      }
    }
  }

  resetRecovery = () => {
    this.setState({
      sourceCoin: 'btc',
      recoveryCoin: 'ltc',
      wallet: '',
      txid: '',
      unspent: '',
      address: '',
      recoveryAddress: '',
      signed: true,
      passphrase: '',
      prv: '',
      recoveryTx: null,
      logging: [''],
      error: ''
    });
  }

  performRecovery = async () => {
    const { bitgo } = this.props;
    const {
      wallet,
      txid,
      recoveryAddress,
      signed,
      passphrase,
      prv
    } = this.state;

    const sourceCoin = bitgo.env === 'prod' ? this.state.sourceCoin : 't' + this.state.sourceCoin;
    const recoveryCoin = bitgo.env === 'prod' ? this.state.recoveryCoin : 't' + this.state.recoveryCoin;

    this.setState({ error: '' });

    try {
      const recoveryTx = await bitgo.coin(sourceCoin).recoverFromWrongChain({
        txid: txid,
        recoveryAddress: recoveryAddress,
        wallet: wallet,
        coin: bitgo.coin(recoveryCoin),
        signed: signed,
        walletPassphrase: passphrase,
        xprv: prv
      });

      this.setState({ recoveryTx: recoveryTx });
    } catch (e) {
      this.collectLog(e.message);
      this.setState({ error: e.message });
    }
  }

  saveTransaction = () => {
    const fileData = this.state.recoveryTx;
    let fileName;

    if (this.state.signed) {
      fileName = `${fileData.sourceCoin}r-${this.state.txid.slice(0, 6)}-${moment().format('YYYYMMDD')}.signed.json`;
    } else {
      fileName = `${fileData.coin}r-${this.state.txid.slice(0, 6)}-${moment().format('YYYYMMDD')}.unsigned.json`;
    }

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

  collectLog = (...args) => {
    const { logging } = this.state;
    const newLogging = logging.concat(args);
    this.setState({ logging: newLogging });
  }

  render() {
    return (
      <div>
        <h1 className='content-header'>Wrong Chain Recoveries</h1>
        <p className='subtitle'>This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain.</p>
        <hr />
        {this.state.recoveryTx === null &&
        <RecoveryTxForm formState={this.state}
                        bitgo={this.props.bitgo}
                        updateRecoveryInfo={this.updateRecoveryInfo}
                        updateCheckbox={this.updateCheckbox}
                        updateSelect={this.updateSelect}
                        performRecovery={this.performRecovery}
                        resetRecovery={this.resetRecovery} />
        }
        {(this.state.recoveryTx !== null && this.state.signed) &&
        <ConfirmTxSigned txDetails={this.state.recoveryTx}
                         error={this.state.error}
                         saveTransaction={this.saveTransaction}
                         resetRecovery={this.resetRecovery} />
        }
        {(this.state.recoveryTx !== null && !this.state.signed) &&
        <ConfirmTxUnsigned txDetails={this.state.recoveryTx}
                           error={this.state.error}
                           saveTransaction={this.saveTransaction}
                           resetRecovery={this.resetRecovery}/>
        }
      </div>
    );
  }
}

class RecoveryTxForm extends Component {
  render() {
    const { formState, bitgo, updateRecoveryInfo, updateCheckbox, updateSelect, performRecovery, resetRecovery } = this.props;
    const { sourceCoin, recoveryCoin, logging, error } = formState;
    const allCoins = coinConfig.supportedRecoveries.crossChain;
    const recoveryCoins = coinConfig.allCoins[sourceCoin].supportedRecoveries;

    return (
      <Form>
        <Row>
          <Col xs={3}>
            <CoinDropdown
              label='Source Coin'
              name='sourceCoin'
              allowedCoins={allCoins}
              onChange={updateSelect('sourceCoin')}
              value={sourceCoin}
              tooltipText={formTooltips.sourceCoin()}
            />
          </Col>
          <Col xs={3}>
            <CoinDropdown
              label='Destination Coin'
              name='recoveryCoin'
              allowedCoins={recoveryCoins}
              onChange={updateSelect('recoveryCoin')}
              value={recoveryCoin}
              tooltipText={formTooltips.destinationCoin()}
            />
          </Col>
          <Col xs={3} style={{display: 'flex', alignItems: 'center'}}>
            <Label check>
              <br/>
              <Input type='checkbox' onChange={updateCheckbox('signed')} checked={formState.signed} /> Sign Transaction
            </Label>
          </Col>
        </Row>
        <Fragment>
          <InputField
            label='Wallet ID'
            name='wallet'
            value={formState.wallet}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.wallet(formState.recoveryCoin)}
            disallowWhiteSpace={true}
          />
          <InputField
            label='Transaction ID'
            name='txid'
            value={formState.txid}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.txid(formState.sourceCoin)}
            disallowWhiteSpace={true}
          />
          <InputField
            label='Destination Address'
            name='recoveryAddress'
            value={formState.recoveryAddress}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.recoveryAddress(formState.sourceCoin)}
            disallowWhiteSpace={true}
            format='address'
            coin={bitgo.coin(formState.sourceCoin)}
          />
          {formState.signed &&
          <InputField
            label='Wallet Passphrase'
            name='passphrase'
            value={formState.passphrase}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.passphrase(formState.recoveryCoin)}
            isPassword={true}
          />
          }
          {formState.signed &&
          <InputField
            label='Private Key'
            name='prv'
            value={formState.prv}
            onChange={updateRecoveryInfo}
            tooltipText={formTooltips.prv(formState.recoveryCoin)}
            isPassword={true}
            disallowWhiteSpace={true}
            />
          }
        </Fragment>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && logging.map((logLine, index) => <p className='recovery-logging' key={index}>{logLine}</p>)}
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
    const { txDetails, error } = this.props;

    return (
      <div>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Source Coin:</Col>
          <Col xs={5}>{coinConfig.allCoins[txDetails.sourceCoin].fullName} ({txDetails.sourceCoin.toUpperCase()})</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Recovery Coin:</Col>
          <Col xs={5}>{coinConfig.allCoins[txDetails.recoveryCoin].fullName} ({txDetails.recoveryCoin.toUpperCase()})</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Wallet:</Col>
          <Col xs={5}>{txDetails.walletId}</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Amount to Recover:</Col>
          <Col xs={5}>{txDetails.recoveryAmount * 1e-8} {txDetails.sourceCoin.toUpperCase()}</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Destination Address:</Col>
          <Col xs={5}>{txDetails.recoveryAddress}</Col>
        </Row>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Row>
          <Col xs={12}>
            <Button onClick={this.props.saveTransaction} className='bitgo-button'>
              Save Recovery Transaction
            </Button>
            <Button onClick={this.props.resetRecovery} className='bitgo-button other'>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

class ConfirmTxUnsigned extends Component {
  render() {
    const { txDetails, error } = this.props;

    return (
      <div>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Source Coin:</Col>
          <Col xs={5}>{coinConfig.allCoins[txDetails.coin].fullName} ({txDetails.coin.toUpperCase()})</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Wallet:</Col>
          <Col xs={5}>{txDetails.walletId}</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Amount to Recover:</Col>
          <Col xs={5}>{txDetails.amount * 1e-8} {txDetails.coin.toUpperCase()}</Col>
        </Row>
        <Row>
          <Col xs={3} className='confirm-tx-field'>Destination Address:</Col>
          <Col xs={5}>{txDetails.address}</Col>
        </Row>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Row>
          <Col xs={12}>
            <Button onClick={this.props.saveTransaction} className='bitgo-button'>
              Save Recovery Transaction
            </Button>
            <Button onClick={this.props.resetRecovery} className='bitgo-button other'>
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CrossChainRecoveryForm;
