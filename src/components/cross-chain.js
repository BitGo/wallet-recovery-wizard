import React, { Component } from 'react';

import {
  CoinDropdown,
  InputField
} from './form-components';

import { Form, Row, Col } from 'reactstrap';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

const formTooltips = tooltips.crossChain;

class CrossChainRecoveryForm extends Component {
  state = {
    sourceCoin: 'btc',
    recoveryCoin: 'ltc',
    wallet: '',
    txid: '',
    currentStep: 'buildTx'
  }

  updateRecoveryInfo = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });

    if (fieldName === 'sourceCoin') {
      const recoveryCoins = coinConfig[event.target.value].supportedRecoveries;

      if (!recoveryCoins.includes(this.state.recoveryCoin)) {
        this.setState({ recoveryCoin: recoveryCoins[0] });
      }
    }
  }

  switchStep = (toStep) => () => {
    this.setState({ currentStep: toStep });
  }

  getFormForStep = () => {
    const { currentStep } = this.state;

    if (currentStep === 'buildTx') {
      return <BuildTxForm
        formState={this.state}
        updateRecoveryInfo={this.updateRecoveryInfo}
      />
    } else if (currentStep === 'signTx') {
      return <SignTxForm
        formState={this.state}
        updateRecoveryInfo={this.updateRecoveryInfo}
      />
    }
  }

  getSubtitleForStep = () => {
    const { currentStep, recoveryAmount, recoveryCoin } = this.state;

    if (currentStep === 'buildTx') {
      return <p className='subtitle'>This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain.</p>;
    } else if (currentStep === 'signTx') {
      return <p className='subtitle'>Please sign your transactino recovering the {recoveryAmount} {recoveryCoin} found.</p>;
    } else if (currentStep === 'confirmTx') {
      return <p className='subtitle'>Please confirm the following information about your recovery transaction.</p>;
    }
  }

  render() {
    return (
      <div>
        <h1>Wrong Chain Recoveries</h1>
        {this.getSubtitleForStep()}
        <hr />
        {this.getFormForStep()}
      </div>
    );
  }
}

const BuildTxForm = ({ formState, updateRecoveryInfo }) => {
  const { sourceCoin, recoveryCoin } = formState;
  const allCoins = Object.keys(coinConfig);
  const recoveryCoins = coinConfig[sourceCoin].supportedRecoveries;

  return (
    <Form>
      <Row>
        <Col xs={3}>
          <CoinDropdown
            label='Source Coin'
            name='sourceCoin'
            allowedCoins={allCoins}
            onChange={updateRecoveryInfo('sourceCoin')}
            value={sourceCoin}
            tooltipText={formTooltips.sourceCoin()}
          />
        </Col>
        <Col xs={3}>
          <CoinDropdown
            label='Destination Coin'
            name='recoveryCoin'
            allowedCoins={recoveryCoins}
            onChange={updateRecoveryInfo('recoveryCoin')}
            value={recoveryCoin}
            tooltipText={formTooltips.destinationCoin()}
          />
        </Col>
      </Row>
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
    </Form>
  );
};

const SignTxForm = ({ formState, updateRecoveryInfo }) => (
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
  </Form>
);

export default CrossChainRecoveryForm;
