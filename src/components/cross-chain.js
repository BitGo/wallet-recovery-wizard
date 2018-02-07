import React, { Component, Fragment } from 'react';

import {
  CoinDropdown,
  InputField
} from './form-components';

import Select from 'react-select';

import {
  Form,
  Row,
  Col,
  Input,
  UncontrolledTooltip,
  FormGroup,
  Label
} from 'reactstrap';

import tooltips from 'constants/tooltips';
import coinConfig from 'constants/coin-config';

const formTooltips = tooltips.crossChain;

class CrossChainRecoveryForm extends Component {
  state = {
    sourceCoin: 'btc',
    recoveryCoin: 'ltc',
    wallet: '',
    txid: '',
    unspent: '',
    address: '',
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

class BuildTxForm extends Component {
  state = { unspentStrategy: 'wallet' };

  updateUnspentStratgies = (strategy) => {
    this.setState({ unspentStrategy: strategy.value });
  }

  render() {
    const { formState, updateRecoveryInfo } = this.props;
    const { sourceCoin, recoveryCoin } = formState;
    const { unspentStrategy } = this.state;
    const allCoins = Object.keys(coinConfig);
    const recoveryCoins = coinConfig[sourceCoin].supportedRecoveries;

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
        <Row>
          <Col xs={6}>
            <FormGroup>
              <Label className='input-label'>
                How would you like to recover your coin?
              </Label>
              <Select
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
      </Form>
    );
  }
}

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
