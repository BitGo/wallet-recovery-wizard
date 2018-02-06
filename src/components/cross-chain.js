import React, { Component } from 'react';

// import {
//   CoinDropdown,
//   TextInput
// } from './form-components';

// import coinConfig from '../constants/coin-config';

class CrossChainRecoveryForm extends Component {
  // state = {
  //   sourceCoin: 'btc',
  //   recoveryCoin: 'ltc'
  // }

  updateRecoveryInfo = (fieldName) => (event) => {
    // this.setState({ [fieldName]: event.target.value });
  }

  render() {
    // const { sourceCoin, recoveryCoin } = this.state;
    // const allCoins = Object.keys(coinConfig);

    return (
      <div>
        <h1>Wrong Chain Recoveries</h1>
        <p>This tool will help you construct a transaction to recover coins sent to addresses on the wrong chain.</p>
        {/*<CoinDropdown
          allowedCoins={allCoins}
          onChange={this.updateRecoveryInfo('sourceCoin')}
          value={sourceCoin}
        />
        <CoinDropdown
          allowedCoins={coinConfig[sourceCoin].supportedRecoveries}
          onChange={this.updateRecoveryInfo('recoveryCoin')}
          value={recoveryCoin}
        />*/}
      </div>
    );
  }
}

// class FindUnspentsForm extends Component {

// }

// class BuildTxForm extends Component {

// }

export default CrossChainRecoveryForm;