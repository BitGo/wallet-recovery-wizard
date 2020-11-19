import React, { Component } from 'react';
import { CoinDropdown, InputField } from './form-components';
import { Form, Button, Row, Col, Alert } from 'reactstrap';
import { address, HDNode, Transaction, TransactionBuilder } from 'bitgo-utxo-lib';

import * as _ from 'lodash';

import ErrorMessage from './error-message';

import tooltips from '../constants/tooltips';
import coinConfig from 'constants/coin-config';

const formTooltips = tooltips.migratedLegacy;

class MigratedRecoveryForm extends Component {
  state = {
    coin: 'bch',
    walletId: '',
    recoveryAddress: '',
    passphrase: '',
    prv: '',
    recoveryTx: null,
    logging: [''],
    error: '',
    recovering: false,
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

  updateCoin = (option) => {
    this.setState({ coin: option.value });
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
      recovering: false,
      twofa: '',
    });
  };

  createRecoveryTx = async (coin, migratedWallet, v1BtcWalletId) => {
    const OUTPUT_SIZE = 34;

    const { bitgo } = this.props;
    const { recoveryAddress, passphrase, feeRate = 5000 } = this.state;

    try {
      address.fromBase58Check(recoveryAddress);
    } catch (e) {
      throw new Error('Invalid destination address, only base 58 is supported');
    }

    const maximumSpendable = await migratedWallet.maximumSpendable({ feeRate });
    const spendableAmount = parseInt(maximumSpendable.maximumSpendable, 10);

    let v1Wallet;
    try {
      v1Wallet = await bitgo.wallets().get({ id: v1BtcWalletId });
    } catch (err) {
      if (err.message === 'not found') {
        throw new Error('v1 BTC Wallet not found. Make sure you are a user on that wallet.');
      } else {
        throw err;
      }
    }

    // Account for paygo fee plus fee for paygo output
    const payGoDeduction = Math.floor(spendableAmount * 0.01) + OUTPUT_SIZE * (feeRate / 1000);
    const txAmount = spendableAmount - payGoDeduction;

    let txPrebuild;
    try {
      txPrebuild = await migratedWallet.prebuildTransaction({
        recipients: [
          {
            address: recoveryAddress,
            amount: txAmount,
          },
        ],
        feeRate,
        noSplitChange: true,
      });
    } catch (e) {
      console.error('Got error building tx:');
      throw e;
    }

    const utxoLib = bitgo.utxoLib;

    if (!utxoLib) {
      throw new Error('could not get utxo lib reference from bitgo object');
    }

    let signingKeychain;
    try {
      signingKeychain = await v1Wallet.getAndPrepareSigningKeychain({ walletPassphrase: passphrase });
    } catch (err) {
      throw Error(
        'Failed to get signing keychain. Only the original owner of the v1 btc wallet can perform this recovery'
      );
    }

    const rootExtKey = HDNode.fromBase58(signingKeychain.xprv);
    rootExtKey.keyPair.network = coin.network;
    const hdPath = utxoLib.hdPath(rootExtKey);

    // sign the transaction
    let transaction = Transaction.fromHex(txPrebuild.txHex, coin.network);

    if (transaction.ins.length !== txPrebuild.txInfo.unspents.length) {
      throw new Error('length of unspents array should equal to the number of transaction inputs');
    }

    const txb = TransactionBuilder.fromTransaction(transaction, coin.network);
    txb.setVersion(2);

    for (let inputIndex = 0; inputIndex < transaction.ins.length; ++inputIndex) {
      // get the current unspent
      const currentUnspent = txPrebuild.txInfo.unspents[inputIndex];
      if (coin.isBitGoTaintedUnspent(currentUnspent)) {
        console.log(`Skipping taint input ${inputIndex} - only BitGo will sign this one`);
        continue;
      }
      if (currentUnspent.chain === undefined || currentUnspent.index === undefined) {
        console.warn(`missing chain or index for unspent: ${currentUnspent.id}. skipping...`);
        continue;
      }
      const chainPath = '/' + currentUnspent.chain + '/' + currentUnspent.index;
      const subPath = signingKeychain.walletSubPath || '/0/0';
      const path = signingKeychain.path + subPath + chainPath;
      // derive the correct key
      const privKey = hdPath.deriveKey(path);
      const value = currentUnspent.value;

      // do the signature flow
      const subscript = new Buffer(currentUnspent.redeemScript, 'hex');
      const sigHashType = coin.defaultSigHashType;
      try {
        // BTG only needs to worry about P2SH-P2WSH
        if (currentUnspent.witnessScript) {
          const witnessScript = Buffer.from(currentUnspent.witnessScript, 'hex');
          txb.sign(inputIndex, privKey, subscript, sigHashType, value, witnessScript);
        } else {
          txb.sign(inputIndex, privKey, subscript, sigHashType, value);
        }
      } catch (e) {
        console.log(`got exception while signing unspent ${JSON.stringify(currentUnspent)}`);
        console.trace(e);
        throw e;
      }

      // now, let's verify the signature
      transaction = txb.buildIncomplete();
      const isSignatureVerified = coin.verifySignature(transaction, inputIndex, value);
      if (!isSignatureVerified) {
        throw new Error(`Could not verify signature on input #${inputIndex}`);
      }
    }

    const tx = txb.buildIncomplete();
    return {
      hex: tx.toHex(),
      id: tx.getId(),
    };
  };

  performRecovery = async () => {
    const { bitgo } = this.props;
    this.setState({ error: '', recovering: true });

    const coinName = this.props.bitgo.getEnv() === 'prod' ? this.state.coin : `t${this.state.coin}`;
    const coin = bitgo.coin(coinName);
    const wallets = await coin.wallets().list();

    let v1BtcWalletId;

    // There is a bug that some BTG wallets have the private migrated object ID instead of public, hence the substring addition below
    const migratedWallet = _.find(
      wallets.wallets,
      (w) =>
        w._wallet.migratedFrom === this.state.walletId ||
        w._wallet.migratedFrom === this.state.walletId.substring(0, 24)
    );

    if (!migratedWallet) {
      throw new Error(`could not find a ${this.state.coin} wallet which was migrated from ${this.state.walletId}`);
    }

    console.info('found wallet: ', migratedWallet.id());

    // If we are recovering BSV, then the code above finds a BCH wallet (migratedWallet)
    // If that is the case, then we need to dig deeper and get the original v1 BTC wallet, and reset migratedWallet to this v1 BTC wallet
    if (coin.getFamily() === 'bsv') {
      const bch = bitgo.coin(this.props.bitgo.getEnv() === 'prod' ? 'bch' : `tbch`);
      const bchWallet = await bch.wallets().getWallet({ id: this.state.walletId });
      if (!bchWallet) {
        throw new Error(
          `could not find the original v1 btc wallet corresponding to the bch wallet with ID ${this.state.walletId}`
        );
      }
      // reset the state to this wallet id
      v1BtcWalletId = bchWallet._wallet.migratedFrom;
    } else {
      v1BtcWalletId = this.state.walletId;
    }

    let recoveryTx;
    try {
      recoveryTx = await this.createRecoveryTx(coin, migratedWallet, v1BtcWalletId);
    } catch (e) {
      if (e.message === 'insufficient balance') {
        // this is terribly unhelpful
        e.message = 'Insufficient balance to recover';
      }
      this.collectLog(e.message);
      this.setState({ error: e.message, recovering: false });
    }

    if (!recoveryTx || !recoveryTx.hex) {
      console.error('Failed to create half-signed recovery transaction');
      return;
    }

    let needsUnlock = false;
    try {
      await migratedWallet.submitTransaction({
        txHex: recoveryTx.hex,
      });
    } catch (e) {
      if (e.message === 'needs unlock') {
        // try again after unlocking
        needsUnlock = true;
      } else {
        this.setState({ error: e.message, recovering: false });
        throw e;
      }
    }

    if (needsUnlock) {
      try {
        await bitgo.unlock({ otp: this.state.twofa });
        await migratedWallet.submitTransaction({
          txHex: recoveryTx.hex,
        });
        console.info(`successfully submitted transaction ${recoveryTx.id} to bitgo`);
      } catch (e) {
        // failed even after unlock - this is fatal
        console.log('got error on submit after unlock');
        console.error(e);
        this.setState({ error: e.message, recovering: false });
        throw e;
      }
    }

    // recovery tx was successfully submitted
    this.setState({ recoveryTx, recovering: false });
  };

  render() {
    const mainnetCoin = this.state.coin;
    const coin = this.props.bitgo.getEnv() === 'prod' ? mainnetCoin : `t${mainnetCoin}`;
    const migratedCoins = coinConfig.supportedRecoveries.migrated[this.props.bitgo.getEnv()];
    return (
      <div>
        <h1 className="content-header">Migrated Legacy Wallet Recoveries</h1>
        <p className="subtitle">
          This tool will help you recover funds from migrated wallets which are no longer officially supported by BitGo.
        </p>
        <Alert color="warning">
          <p>
            Transactions submitted using this tool are irreversible. Please double check your destination address to
            ensure it is correct.
          </p>
          <br />
          <p>
            Additionally, we recommend creating a policy on your migrated wallet which whitelists only the destination
            address, and removing all other policies on the wallet. This will ensure that accidental sends to addresses
            other than the destination address will not be processed immediately, and will instead result in a pending
            approval, which you may then cancel.
          </p>
        </Alert>
        <hr />
        <Form>
          <CoinDropdown
            label="Coin"
            name="coin"
            allowedCoins={migratedCoins}
            onChange={this.updateCoin}
            value={this.state.coin}
            tooltipText={formTooltips.coin}
          />
          <InputField
            label="Original Wallet ID"
            name="walletId"
            onChange={this.updateRecoveryInfo}
            value={this.state.walletId}
            tooltipText={formTooltips.walletId}
            disallowWhiteSpace={true}
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
            label="2FA Code"
            name="twofa"
            onChange={this.updateRecoveryInfo}
            value={this.state.twofa}
            tooltipText={formTooltips.twofa}
            isPassword={true}
          />
          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
          {this.state.recoveryTx && (
            <p className="recovery-logging">
              Success! Recovery transaction has been submitted. Transaction ID: {this.state.recoveryTx.id}
            </p>
          )}
          <Row>
            <Col xs={12}>
              {!this.state.recoveryTx && !this.state.recovering && (
                <Button onClick={this.performRecovery} className="bitgo-button">
                  Recover Wallet
                </Button>
              )}
              {!this.state.recoveryTx && this.state.recovering && (
                <Button disabled={true} className="bitgo-button">
                  Recovering...
                </Button>
              )}
              {this.state.recoveryTx && !this.state.recovering && !this.state.error && (
                <Button disabled={true} className="bitgo-button">
                  Recovery Successful
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default MigratedRecoveryForm;
