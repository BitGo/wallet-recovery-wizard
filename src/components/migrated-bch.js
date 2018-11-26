import React, { Component } from 'react';
import { InputField } from './form-components';
import { Form, Button, Row, Col, Alert } from 'reactstrap';
import { address, HDNode, Transaction, TransactionBuilder } from 'bitgo-utxo-lib';

import * as _ from 'lodash';

import ErrorMessage from './error-message';

import tooltips from 'constants/tooltips';

import moment from 'moment';

const fs = window.require('fs');
const { dialog } = window.require('electron').remote;
const formTooltips = tooltips.migratedBch;

class MigratedBchRecoveryForm extends Component {
  state = {
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

  createRecoveryTx = async (bch, migratedWallet) => {

    const OUTPUT_SIZE = 34;

    const { bitgo } = this.props;
    const {
      walletId,
      recoveryAddress,
      passphrase,
      feeRate = 5000,
    } = this.state;

    try {
      address.fromBase58Check(recoveryAddress);
    } catch (e) {
      throw new Error('Invalid destination address, only base 58 is supported');
    }

    const maximumSpendable = await migratedWallet.maximumSpendable({ feeRate });
    const spendableAmount = parseInt(maximumSpendable.maximumSpendable, 10);

    const v1Wallet = await bitgo.wallets().get({ id: walletId });

    // Account for paygo fee plus fee for paygo output
    const payGoDeduction = Math.floor(spendableAmount * 0.01) + (OUTPUT_SIZE * (feeRate / 1000));
    const txAmount = spendableAmount - payGoDeduction;

    let txPrebuild;
    try {
      txPrebuild = await migratedWallet.prebuildTransaction({
        recipients: [{
          address: recoveryAddress,
          amount: txAmount
        }],
        feeRate,
        noSplitChange: true
      });
    } catch (e) {
      console.error('Got error building tx:');
      throw e;
    }

    const utxoLib = bitgo.utxoLib;

    if (!utxoLib) {
      throw new Error('could not get utxo lib reference from bitgo object');
    }

    const signingKeychain = await v1Wallet.getAndPrepareSigningKeychain({ walletPassphrase: passphrase });
    const rootExtKey = HDNode.fromBase58(signingKeychain.xprv, bch.network);
    const hdPath = utxoLib.hdPath(rootExtKey);

    // sign the transaction
    let transaction = Transaction.fromHex(txPrebuild.txHex, bch.network);

    if (transaction.ins.length !== txPrebuild.txInfo.unspents.length) {
      throw new Error('length of unspents array should equal to the number of transaction inputs');
    }

    const txb = TransactionBuilder.fromTransaction(transaction, bch.network);
    txb.setVersion(2);

    const sigHashType = Transaction.SIGHASH_ALL | Transaction.SIGHASH_BITCOINCASHBIP143;
    for (let inputIndex = 0; inputIndex < transaction.ins.length; ++inputIndex) {
      // get the current unspent
      const currentUnspent = txPrebuild.txInfo.unspents[inputIndex];
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
      try {
        txb.sign(inputIndex, privKey, subscript, sigHashType, value);
      } catch (e) {
        console.log(`got exception while signing unspent ${JSON.stringify(currentUnspent)}`);
        console.trace(e);
        throw e;
      }

      // now, let's verify the signature
      transaction = txb.buildIncomplete();
      const isSignatureVerified = bch.verifySignature(transaction, inputIndex, value);
      if (!isSignatureVerified) {
        throw new Error(`Could not verify signature on input #${inputIndex}`);
      }
    }

    const tx = txb.buildIncomplete();
    return {
      hex: tx.toHex(),
      id: tx.getId()
    }
  };

  performRecovery = async () => {
    const { bitgo } = this.props;
    this.setState({ error: '', recovering: true });

    const bch = bitgo.coin('bch');
    const bchWallets = await bch.wallets().list();
    const migratedWallet = _.find(bchWallets.wallets, w => w._wallet.migratedFrom === this.state.walletId);

    if (!migratedWallet) {
      throw new Error('could not find a bch wallet which was migrated from ' + this.state.walletId);
    }

    console.log('found bch wallet: ', migratedWallet.id());

    let recoveryTx;
    try {
      recoveryTx = await this.createRecoveryTx(bch, migratedWallet);
    } catch (e) {
      if (e.message === 'insufficient balance') { // this is terribly unhelpful
        e.message = 'Insufficient balance to recover';
      }
      this.collectLog(e.message);
      this.setState({ error: e.message, recovering: false });
    }

    if (!recoveryTx || !recoveryTx.hex) {
      console.error('Failed to create half-signed recovery transaction');
      return;
    }

    console.log('recovery tx');
    console.log(recoveryTx.hex);

    let needsUnlock = false;
    try {
      await migratedWallet.submitTransaction({
        txHex: recoveryTx.hex
      });
    } catch (e) {
      if (e.message === 'needs unlock') {
        // try again after unlocking
        needsUnlock = true;
      } else {
        throw e;
      }
    }

    if (needsUnlock) {
      try {
        await bitgo.unlock({ otp: this.state.twofa });
        recoveryTx = await migratedWallet.submitTransaction({
          txHex: recoveryTx.hex
        });
      } catch (e) {
        // failed even after unlock - this is fatal
        console.log('got error on submit after unlock');
        console.error(e);
        throw e;
      }
    }
    this.setState({ recoveryTx, recovering: false });
  };

  saveTransaction = () => {
    const fileData = this.state.recoveryTx;
    let fileName;
    const filePrefix = this.props.bitgo.env === 'prod' ? 'bch' : 'tbch';

    fileName = `${filePrefix}r-${moment().format('YYYYMMDD')}.signed.json`;

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
  };

  render() {
    const coin = this.props.bitgo.env === 'prod' ? 'bch' : 'tbch';

    return (
      <div>
        <h1 className='content-header'>Migrated Bitcoin Cash Recoveries</h1>
        <p className='subtitle'>This tool will help you recover Bitcoin Cash from migrated wallets which are no longer officially supported by BitGo.</p>
        <Alert color='warning'>
          Do we need a warning here?
        </Alert>
        <hr />
        <Form>
          <InputField
            label='Original Bitcoin Wallet ID'
            name='walletId'
            onChange={this.updateRecoveryInfo}
            value={this.state.walletId}
            tooltipText={formTooltips.walletId}
            disallowWhiteSpace={true}
          />
          <InputField
            label='Destination Address'
            name='recoveryAddress'
            onChange={this.updateRecoveryInfo}
            value={this.state.recoveryAddress}
            tooltipText={formTooltips.recoveryAddress}
            disallowWhiteSpace={true}
            format='address'
            coin={this.props.bitgo.coin(coin)}
          />
          <InputField
            label='Wallet Passphrase'
            name='passphrase'
            onChange={this.updateRecoveryInfo}
            value={this.state.passphrase}
            tooltipText={formTooltips.passphrase}
            isPassword={true}
          />
          <InputField
            label='2FA Code'
            name='twofa'
            onChange={this.updateRecoveryInfo}
            value={this.state.twofa}
            tooltipText={formTooltips.twofa}
            isPassword={true}
          />
          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}
          {this.state.recoveryTx && <p className='recovery-logging'>Success! Recovery transaction has been submitted. Transaction ID: {this.state.recoveryTx.id}</p>}
          <Row>
            <Col xs={12}>
              {!this.state.recoveryTx && !this.state.recovering &&
                <Button onClick={this.performRecovery} className='bitgo-button'>
                  Recover Bitcoin Cash
                </Button>
              }
              {!this.state.recoveryTx && this.state.recovering &&
                <Button disabled={true} className='bitgo-button'>
                  Recovering...
                </Button>
              }
              {this.state.recoveryTx &&
                <Button onClick={this.saveTransaction} className='bitgo-button'>
                  Save Transaction
                </Button>
              }
              <Button onClick={this.resetRecovery} className='bitgo-button other'>
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

export default MigratedBchRecoveryForm;
