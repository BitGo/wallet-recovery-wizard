import React, { Component, Fragment } from 'react';

import {
  CoinDropdown,
  InputField
} from './form-components';

import ErrorMessage from './error-message';
import Select from 'react-select';

import {
  Form,
  Row,
  Col,
  FormGroup,
  Label,
  Button
} from 'reactstrap';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

import CrossChainRecoveryTool from 'tools/cross-chain';

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
    recoveryAddress: '',
    passphrase: '',
    prv: '',
    currentStep: 'buildTx',
    logging: ['']
  }

  updateRecoveryInfo = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
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
      passphrase: '',
      prv: '',
      currentStep: 'buildTx',
      logging: [''],
      error: ''
    });
  }

  switchStep = (toStep) => () => {
    this.setState({ currentStep: toStep, logging: [''] });
  }

  getFormForStep = () => {
    const { currentStep } = this.state;

    if (currentStep === 'buildTx') {
      return <BuildTxForm
        formState={this.state}
        updateRecoveryInfo={this.updateRecoveryInfo}
        updateSelect={this.updateSelect}
        findUnspents={this.findUnspents.bind(this)}
        goToNextStep={this.switchStep('signTx')}
        resetRecovery={this.resetRecovery}
      />;
    } else if (currentStep === 'signTx') {
      return <SignTxForm
        formState={this.state}
        updateRecoveryInfo={this.updateRecoveryInfo}
        completeTx={this.completeTx.bind(this)}
        goToNextStep={this.switchStep('confirmTx')}
        resetRecovery={this.resetRecovery}
      />;
    } else if (currentStep === 'confirmTx') {
      const txDetails = {
        sourceCoin: this.state.sourceCoin,
        recoveryCoin: this.state.recoveryCoin,
        wallet: this.state.wallet,
        recoveryAmount: this.RecoveryTool.recoveryAmount,
        recoveryAddress: this.state.recoveryAddress
      };

      return <ConfirmTx
        txDetails={txDetails}
        saveTransaction={this.saveTransaction}
        error={this.state.error}
        resetRecovery={this.resetRecovery}
      />;
    } else if (currentStep === 'complete') {
      return (
        <div>
          <p className='subtitle'>
            <span>Successfully built recovery transaction. Please take the saved JSON file and submit it to </span>
            <a href={'mailto:support@bitgo.com'}>support@bitgo.com</a>.
          </p>
          <Button onClick={this.resetRecovery} className='bitgo-button'>
            Perform Another Recovery
          </Button>
        </div>
      );
    }
  }

  getSubtitleForStep = () => {
    const { currentStep, recoveryAmount, recoveryCoin } = this.state;

    if (currentStep === 'buildTx') {
      return <p className='subtitle'>This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain.</p>;
    } else if (currentStep === 'signTx') {
      return <p className='subtitle'>Please sign your transaction recovering the {recoveryAmount} {recoveryCoin.toUpperCase()} found.</p>;
    } else if (currentStep === 'confirmTx') {
      return <p className='subtitle'>Please confirm the following information about your recovery transaction.</p>;
    } else if (currentStep === 'complete') {
    }
  }

  async findUnspents() {
    const { bitgo } = this.props;
    const {
      sourceCoin,
      recoveryCoin,
      wallet,
      txid,
    } = this.state;

    this.setState({ error: '' });

    this.RecoveryTool = new CrossChainRecoveryTool({
      bitgo: bitgo,
      sourceCoin: sourceCoin,
      recoveryType: recoveryCoin,
      test: true,
      logger: this.collectLog
    });

    if (wallet && txid) {
      try {
        await this.RecoveryTool.setWallet(wallet);
        await this.RecoveryTool.findUnspents(txid);
        await this.RecoveryTool.buildInputs();
      } catch (e) {
        this.setState({ error: e.message });
      }
    }
  }

  async completeTx() {
    const {
      recoveryAddress,
      passphrase,
      prv
    } = this.state;

    this.setState({ error: '' });

    try {
      this.RecoveryTool.setFees();
      this.RecoveryTool.buildOutputs(recoveryAddress);
      await this.RecoveryTool.signTransaction({ passphrase, prv });
    } catch (e) {
      this.setState({ error: e.message });
    }
  }

  saveTransaction = () => {
    const fileData = this.RecoveryTool.getFileData();
    const fileName = `${this.RecoveryTool.sourceCoin.type}r-${this.RecoveryTool.faultyTxId.slice(0, 6)}-${moment().format('YYYYMMDD')}.signed.json`;

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
      this.switchStep('complete')();
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
        {this.getSubtitleForStep()}
        <hr />
        {this.getFormForStep()}
      </div>
    );
  }
}

class BuildTxForm extends Component {
  state = { unspentStrategy: 'wallet' };

  updateUnspentStratgies = (strategy) => {
    this.setState({ unspentStrategy: strategy.value });
  }

  async doFindUnspents() {
    this.setState({ searching: true });
    await this.props.findUnspents();
    this.setState({ searching: false, done: true });
  }

  render() {
    const { formState, updateRecoveryInfo, updateSelect } = this.props;
    const { sourceCoin, recoveryCoin, logging, error } = formState;
    const { unspentStrategy, searching, done } = this.state;
    const allCoins = coinConfig.supportedRecoveries.crossChain;
    const recoveryCoins = coinConfig.allCoins[sourceCoin].supportedRecoveries;

    const unspentStrategies = [
      {
        label: 'Wallet ID & Transaction ID',
        value: 'wallet'
      },
      {
        label: 'Address',
        value: 'address'
      },
      {
        label: 'Unspent ID',
        value: 'unspents'
      },
    ];

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
        </Row>
        <Row>
          <Col xs={6}>
            <FormGroup>
              <Label className='input-label'>
                How would you like to recover your coin?
              </Label>
              <Select
                className='bitgo-select'
                type='select'
                options={unspentStrategies}
                onChange={this.updateUnspentStratgies}
                name={'unspentStrategy'}
                value={unspentStrategy}
                clearable={false}
                searchable={false}
              />
            </FormGroup>
          </Col>
        </Row>
        {unspentStrategy === 'wallet' &&
          <Fragment>
            <InputField
              label='Wallet ID'
              name='wallet'
              onChange={updateRecoveryInfo('wallet')}
              value={formState.wallet}
              tooltipText={formTooltips.wallet(formState.recoveryCoin)}
            />
            <InputField
              label='Transaction ID'
              name='txid'
              onChange={updateRecoveryInfo('txid')}
              value={formState.txid}
              tooltipText={formTooltips.txid(formState.sourceCoin)}
            />
          </Fragment>
        }
        {unspentStrategy === 'address' &&
          <InputField
            label='Address'
            name='address'
            onChange={updateRecoveryInfo('address')}
            value={formState.address}
            tooltipText={formTooltips.address(formState.recoveryCoin)}
          />
        }
        {unspentStrategy === 'unspents' &&
          <InputField
            label='Unspent ID'
            name='unspent'
            onChange={updateRecoveryInfo('unspent')}
            value={formState.unspent}
            tooltipText={formTooltips.unspent(formState.sourceCoin)}
          />
        }
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && logging.map((logLine, index) => <p className='recovery-logging' key={index}>{logLine}</p>)}
        <Row>
            <Col xs={12}>
              {done &&
                <Button onClick={this.props.goToNextStep} disabled={!!searching} className='bitgo-button'>
                  Next
                </Button>
              }
              {!done &&
                <Button onClick={this.doFindUnspents.bind(this)} disabled={!!searching} className='bitgo-button'>
                  {searching ? 'Searching...' : 'Find Lost Coin'}
                </Button>
              }
              {done &&
                <Button onClick={this.props.resetRecovery} className='bitgo-button other'>
                  Cancel
                </Button>
              }
            </Col>
        </Row>
      </Form>
    );
  }
}

class SignTxForm extends Component {
  state = {}

  async doSignTransaction() {
    this.setState({ signing: true });
    await this.props.completeTx();
    this.setState({ signing: false, done: true });
  }

  render() {
    const { formState, updateRecoveryInfo } = this.props;
    const { logging, error } = formState;
    const { signing, done } = this.state;

    return (
      <Form>
        <InputField
          label='Destination Address'
          name='recoveryAddress'
          onChange={updateRecoveryInfo('recoveryAddress')}
          value={formState.recoveryAddress}
          tooltipText={formTooltips.recoveryAddress(formState.sourceCoin)}
        />
        <InputField
          label='Wallet Passphrase'
          name='passphrase'
          onChange={updateRecoveryInfo('passphrase')}
          value={formState.passphrase}
          tooltipText={formTooltips.passphrase(formState.recoveryCoin)}
          isPassword={true}
        />
        <InputField
          label='Private Key'
          name='prv'
          onChange={updateRecoveryInfo('prv')}
          value={formState.prv}
          tooltipText={formTooltips.prv(formState.recoveryCoin)}
          isPassword={true}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && logging.map((logLine, index) => <p className='recovery-logging' key={index}>{logLine}</p>)}
        <Row>
          <Col xs={12}>
            {!error && done &&
              <Button onClick={this.props.goToNextStep} disabled={!!signing} className='bitgo-button'>
                Next
              </Button>
            }
            {(error || !done) &&
              <Button onClick={this.doSignTransaction.bind(this)} disabled={!!signing} className='bitgo-button'>
                {signing ? 'Signing...' : 'Sign Transaction'}
              </Button>
            }
            <Button onClick={this.props.resetRecovery} className='bitgo-button other'>
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

class ConfirmTx extends Component {
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
          <Col xs={5}>{txDetails.wallet}</Col>
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

export default CrossChainRecoveryForm;
