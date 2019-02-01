import React, { Component } from 'react';
import { InputField } from './form-components';
import { Form, Button, Row, Col } from 'reactstrap';
import { Transaction, TransactionBuilder, bufferutils, ECPair } from 'bitgo-utxo-lib';
import * as debugLib from 'debug';
import _ from 'lodash';

import ErrorMessage from './error-message';

import tooltips from '../constants/tooltips';

import { states, channels, events, commands, paths } from '../constants/ledger';

const { ipcRenderer } = window.require('electron');
const formTooltips = tooltips.ledger;
const debug = debugLib('bitgo:wrw:component:ledger');
debugLib.enable('bitgo:*');

const txConstants = {
  P2SH_INPUT_SIZE: 296,
  P2SH_P2WSH_INPUT_SIZE: 139
};

class LedgerRecoveryForm extends Component {
  state = {
    walletId: '',
    validWalletId: false,
    recoveryAddress: '',
    validRecoveryAddress: false,
    recoveryTxId: null,
    logging: [''],
    error: '',
    recovering: false,
    twofa: '',
    ledgerState: states.NOT_CONNECTED,
    activeDevice: null,
    pendingCommands: {},
    coin: null,
    recoveryInfo: null
  };

  /**
   * Component got mounted. This is a good time to check to see
   * if any devices were connected before the page was loaded.
   */
  componentDidMount() {
    const bitgo = this.props.bitgo;
    this.setState({
      coin: bitgo.coin(bitgo.env === 'prod' ? 'btc' : 'tbtc')
    });

    // set up the response and event channels
    ipcRenderer.on(channels.RESPONSE, this.ledgerCommandResponseListener.bind(this));
    ipcRenderer.on(channels.EVENT, this.ledgerEventListener.bind(this));

    // ask the service if it knows about any devices currently connected
    this.sendCommand(commands.QUERY, this.generateCommandNonce());
  }

  /**
   * Send a command to the main process to be executed on the active device
   */
  sendCommand(command, nonce, args = {}) {
    debug(`sending command ${command}:${nonce} to ledger service`, args);
    if (!this.state.activeDevice && command !== commands.QUERY) {
      throw new Error('no active device');
    }

    ipcRenderer.send(channels.COMMAND, { command, args, nonce, device: this.state.activeDevice });
  }

  /**
   * Component got unloaded, clean up our listeners so we aren't getting
   * multiple events triggered later.
   */
  componentWillUnmount() {
    debug('removing ledger-response listener');
    ipcRenderer.removeListener(channels.RESPONSE, this.ledgerCommandResponseListener);
    ipcRenderer.removeListener(channels.EVENT, this.ledgerEventListener);
  }

  ledgerCommandResponseListener(event, arg) {
    debug('got response from ledger service', arg.command);

    const { nonce } = arg;
    if (!nonce) {
      throw new Error('command response must have nonce');
    }
    switch (arg.command) {
      case commands.QUERY:
        debug('got query response', arg);
        if (arg.devices && arg.devices.length > 0) {
          debug('device is connected:');
          // TODO: just take first device for now, multi device support is probably not a thing
          this.setState({ ledgerState: states.CONNECTED, activeDevice: arg.devices[0] });
        } else {
          debug('no devices connected');
          this.setState({ ledgerState: states.NOT_CONNECTED, activeDevice: null });
        }
        break;

      case commands.PUBKEY:
        debug('got pubkey response', arg);
        break;

      case commands.SIGN_TX:
        debug('got sign tx response', arg);
        break;

      case commands.SPLIT_TX:
        debug('got split tx response', arg);
        break;

      case commands.SERIALIZE_OUTPUTS:
        debug('got serialize outputs response', arg);
        break;

      default:
        throw new Error(`unknown command response: ${arg.command}`);
    }

    const { pendingCommands } = this.state;
    if (pendingCommands[nonce]) {
      const [resolve, reject] = pendingCommands[nonce];
      delete pendingCommands[nonce];

      if (arg.result) {
        return resolve(arg.result);
      } else if (arg.error) {
        return reject(arg.error);
      }

      debug('got command response without result or error!');
    }
  }

  ledgerEventListener(event, arg) {
    debug('got event from ledger service', event, arg);

    switch (arg.event) {
      case events.CONNECTED:
        debug('ledger connected');
        this.setState({ ledgerState: states.CONNECTED, activeDevice: arg.device });
        break;

      case events.REMOVED:
        debug('ledger removed');
        this.setState({ ledgerState: states.NOT_CONNECTED, activeDevice: null });
        break;

      default:
        debug('unknown event');
    }
  }

  resetRecovery = () => {
    this.setState({
      walletId: '',
      recoveryAddress: '',
      logging: [''],
      error: '',
      recovering: false,
      twofa: '',
    });
  };

  generateCommandNonce = () => {
    // use a random integer between 0 and 2^32 as nonce
    return Math.floor(Math.random() * Math.pow(2, 32));
  };

  awaitCommandResponse = async (command, args, timeout=5000) => {
    const nonce = this.generateCommandNonce();
    this.sendCommand(command, nonce, args);
    return new Promise((resolve, reject) => {
      this.state.pendingCommands[nonce] = [resolve, reject];

      // setup rejection if response does not arrive before timeout
      setTimeout(() => reject(new Error(`timeout of ${timeout} ms was exceeded`)), timeout);
    });
  };

  /**
   * Check the account-level public key from this ledger device,
   * so we can be sure the correct keys are actually present on the ledger
   *
   * @param wallet wallet whose user public key should match the ledger public key
   * @param network Bitcoin network (either "bitcoin" or "testnet")
   * @throws Error if the expected public key is not found on the ledger
   * @return {Promise<void>}
   */
  checkLedgerDevice = async (wallet, network) => {
    // get the public key at 44'/0' for this ledger - this is the root user key
    const accountKey = await this.awaitCommandResponse(commands.PUBKEY, { path: paths[network] });
    debug('checking ledger device, got account key:', accountKey);

    const keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(accountKey.publicKey, 'hex'));
    const compressedKeyPair = new ECPair(null, keyPair.__Q, { compressed: true });
    const deviceKey = compressedKeyPair.getPublicKeyBuffer().toString('hex');
    const { pubKey, chainCode } =  wallet.wallet.private.keychains[0].params;

    if (deviceKey !== pubKey || accountKey.chainCode !== chainCode) {
      throw new Error(`wrong ledger device, expected public key ${pubKey} but got public key ${deviceKey}`);
    }

    debug('ledger device public key matches user public key');
  };

  collectRecoverableUnspents = async (wallet) => {
    return await wallet.unspents({
      segwit: true,
      segwitOnly: true,
      allowLedgerSegwit: true
    });
  };

  createRecoveryTransaction = async (wallet, recoveryAddress, unspents = null) => {
    if (!unspents) {
      unspents = await this.collectRecoverableUnspents(wallet);
    }

    const txCreationParams = {
      recipients: { [recoveryAddress]: wallet.spendableBalance() },
      unspents,
      noSplitChange: true,
      unspentsFetchParams: {
        allowLedgerSegwit: true
      },
      feeTxConfirmTarget: 6
    };

    let feeRate;
    let txSize;
    try {
      const feeEstimate = await wallet.estimateFee(txCreationParams);
      feeRate = feeEstimate.feeRate;
      txSize = feeEstimate.estimatedSize;
    } catch (e) {
      if (e.message.match(/^Insufficient funds$/)) {
        // this is expected, since we can't send the entire balance (fees are deducted)
        // just use the fee rate we would use had we been able to cover the entire balance
        feeRate = e.result.feeRate;
        txSize = e.result.estimatedSize;
      } else {
        // fatal error
        debug('failed to estimate fees:', e);
        throw e;
      }
    }

    // exclude unspents which cannot pay for themselves, as these will be pruned by
    // the transaction builder and will not be counted towards the total output amount
    const prunedUnspents = _.filter(unspents, function(unspent) {
      const isSegwitInput = !!unspent.witnessScript;
      const currentInputSize = isSegwitInput ? txConstants.P2SH_P2WSH_INPUT_SIZE : txConstants.P2SH_INPUT_SIZE;
      const feeBasedMinInputValue = (feeRate * currentInputSize) / 1000;
      return feeBasedMinInputValue <= unspent.value;
    });

    debug('got pruned unspents:', prunedUnspents);

    const totalUnspentValue = _.sumBy(prunedUnspents, 'value');

    const fee = _.round(feeRate * txSize / 1000);
    const sendAmount = totalUnspentValue - fee;

    if (sendAmount < 0) {
      throw new Error(`insufficient funds available for recovery. Fees are ${fee}, but the total value of wallet unspents is ${totalUnspentValue}`);
    }

    // update the outgoing amount for with the actual send amount, after adjusting for fees
    // this should result in a single output tx, which does not spend change back to the ledger
    txCreationParams.recipients[recoveryAddress] = sendAmount;
    txCreationParams.unspents = prunedUnspents;
    const { transactionHex } = await wallet.createTransaction(txCreationParams);
    return { transactionHex, unspents: prunedUnspents };
  };

  splitInputTransactions = async (tx) => {
    const bitgo = this.props.bitgo;

    // get the parent txids for each input, without duplicates
    const txIds = _(tx.ins)
    .map(txIn => new Buffer(txIn.hash).reverse().toString('hex'))
    .uniq()
    .value();

    debug('txIds:', txIds);

    // fetch each of those txs, and give it to ledger's split tx,
    // which creates a transaction in the format the ledger is expecting
    const { ids, splitTxPromises } = txIds.reduce((acc, id) => {
      acc.ids.push(id);
      const txHexPromise = bitgo.blockchain().getTransaction({ id });
      const splitTxPromise = txHexPromise.then(({ hex }) => {
        return this.awaitCommandResponse(commands.SPLIT_TX, { hex });
      });
      acc.splitTxPromises.push(splitTxPromise);
      return acc;
    }, { ids: [], splitTxPromises: [] });
    debug('created split tx promises');

    // await all these promises simultaneously (this might be a bad idea
    // if there are many txs which need to be split?)
    const splitTransactions = await Promise.all(splitTxPromises);
    debug('resolved split tx promises', splitTransactions);

    // create a new object, where each key is a txid, and the value is the
    // result of the split tx call for that txid
    return _.zipObject(ids, splitTransactions);
  };

  getRecoveryWallet = async (walletId = null) => {
    if (!walletId) {
      walletId = this.state.walletId;
    }

    debug('getting recovery wallet', walletId);
    const wallet = await this.props.bitgo.wallets().get({ id: walletId });
    debug('got wallet', wallet.label());
    return wallet;
  };

  performRecovery = async () => {
    this.setState({ recovering: true });
    const bitgo = this.props.bitgo;
    const network = bitgo.env === 'prod' ? 'bitcoin' : 'testnet';

    const wallet = await this.getRecoveryWallet();

    // first, ensure this is the correct ledger device
    await this.checkLedgerDevice(wallet, network);

    const recoveryAddress = this.state.recoveryAddress;

    // create the tx
    const { transactionHex, unspents } = await this.createRecoveryTransaction(wallet, recoveryAddress);

    const tx = Transaction.fromHex(transactionHex, network);
    const builder = TransactionBuilder.fromTransaction(tx, network);

    // build the key paths for each unspent
    const walletPath = wallet.wallet.private.keychains[0].path;
    const unspentPaths = unspents.map(unspent => `${paths[network]}${walletPath}${unspent.chainPath}`);
    debug('unspent paths:', unspentPaths);

    const splitTxsById = await this.splitInputTransactions(tx);
    debug('created split txs by id', splitTxsById);

    // create an array for each input which is in
    // the format expected by the ledger device
    const utxos = tx.ins.map((input, index) => {
      const txId = new Buffer(input.hash).reverse().toString('hex');
      const isSegwit = !!unspents[index].witnessScript;
      return [
        splitTxsById[txId],
        input.index,
        isSegwit ?
          unspents[index].witnessScript :
          unspents[index].redeemScript
      ];
    });
    debug('created utxos', utxos);

    // find the size of the output script
    const scriptSize = tx.outs.reduce((size, output) => {
      size += 8 + bufferutils.varIntSize(output.script.length) + output.script.length;
      return size;
    }, bufferutils.varIntSize(tx.outs.length));
    debug('script size:', scriptSize);

    // actually do the serialization of the output script
    const { script: outputScript } = tx.outs.reduce((acc, output) => {
      if (!acc.offset) {
        acc.offset = bufferutils.writeVarInt(acc.script, tx.outs.length, 0);
      }
      bufferutils.writeUInt64LE(acc.script, output.value, acc.offset);
      acc.offset += 8;
      acc.offset += bufferutils.writeVarInt(acc.script, output.script.length, acc.offset);
      acc.offset += output.script.copy(acc.script, acc.offset);
      return acc;
    }, { script: new Buffer(scriptSize) });
    debug('output script:', outputScript.toString('hex'));

    const signTxArgs = {
      inputs: utxos,
      associatedKeysets: unspentPaths,
      outputScriptHex: outputScript.toString('hex'),
      sigHashType: Transaction.SIGHASH_ALL,
      segwit: true // TODO: handle non-segwit txs correctly
    };

    // device is correct, let's sign
    const signatures = await this.awaitCommandResponse(commands.SIGN_TX, signTxArgs, 120000);

    debug('sign complete, signatures:', signatures);

    // build complete transaction with signatures from ledger device
    builder.inputs.forEach((input, index) => {
      const isSegwit = !!unspents[index].witnessScript;

      input.signatures = [Buffer.from(signatures[index], 'hex')];
      input.prevOutType = 'scripthash';
      input.redeemScriptType = isSegwit ? 'witnessscripthash' : 'multisig';
      input.redeemScript = new Buffer(unspents[index].redeemScript, 'hex');
      if (isSegwit) {
        input.witnessScriptType = 'multisig';
        input.witnessScript = new Buffer(unspents[index].witnessScript, 'hex');
      }
    });
    debug('applied signatures to tx');

    const finalTx = builder.buildIncomplete();
    const finalTxHex = finalTx.toHex();
    debug('submitting tx...', finalTxHex);

    let needsUnlock = false;
    let result;
    try {
      result = await wallet.sendTransaction({ tx: finalTxHex });
      debug('got result', result);
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
        result = await wallet.sendTransaction({ tx: finalTxHex });
        debug('got result', result);
      } catch (e) {
        // failed even after unlock - this is fatal
        console.log('got error on submit after unlock');
        console.error(e);
        this.setState({ error: e.message, recovering: false });
        throw e;
      }
    }

    // recovery tx was successfully submitted
    this.setState({ recovering: false, error: null, recoveryTxId: result.hash });
  };

  updateRecoverableAmount = async (walletId) => {
    let wallet;
    try {
     wallet =  await this.getRecoveryWallet(walletId);
    } catch (e) {
      if (e.message.match(/^not found$/)) {
        this.setState({ error: `Wallet ${walletId} not found` });
        return;
      }
    }
    const unspents = await this.collectRecoverableUnspents(wallet);
    debug('unspents:', unspents);

    if (!unspents) {
      return;
    }

    const recoveryAmount = _.round(_.sumBy(unspents, 'value') / 1e8, 6);
    const recoveryInfo = `Wallet ${wallet.label()} has ${unspents.length} SegWit unspent(s) with a total value of ${recoveryAmount} BTC available to recover.`;
    this.setState({ recoveryInfo });
  };

  updateRecoveryInfo = (field) => (value) => {
    this.setState({ [field]: value });
  };

  updateWalletId = (value) => {
    const valid = this.state.coin.isValidAddress(value);
    this.setState({
      walletId: value,
      validWalletId: valid,
      recoveryInfo: null,
      error: null
    });

    if (valid) {
      // intentionally not awaited so we update the recovery info asynchronously
      this.updateRecoverableAmount(value);
    }
  };

  updateRecoveryAddress = (value) => {
    this.setState({
      recoveryAddress: value,
      validRecoveryAddress: this.state.coin.isValidAddress(value)
    });
  };

  render() {

    return (
      <div>
        <div hidden={this.state.ledgerState === states.CONNECTED}>
          <p className='content-centered'>Please connect and unlock your ledger device, then open the Bitcoin app.</p>
        </div>
        <div hidden={this.state.ledgerState === states.NOT_CONNECTED}>
          <h1 className='content-header'>SegWit Ledger Wallet Recovery</h1>
          <p className='subtitle'>This tool allows recovery of Segregated Witness (SegWit) unspents which are contained in ledger wallets.</p>
          <hr />
          <Form>
            <InputField
              label='Bitcoin Wallet ID'
              name='walletId'
              onChange={() => this.updateWalletId}
              value={this.state.walletId}
              tooltipText={formTooltips.walletId}
              disallowWhiteSpace={true}
              format='address'
              coin={this.state.coin}
            />
            <InputField
              label='Recovery Destination Address'
              name='recoveryAddress'
              onChange={() => this.updateRecoveryAddress}
              value={this.state.recoveryAddress}
              tooltipText={formTooltips.recoveryAddress}
              disallowWhiteSpace={true}
              format='address'
              coin={this.state.coin}
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
            {this.state.recoveryInfo && <p className='recovery-logging'>{this.state.recoveryInfo}</p>}
            {this.state.recoveryTxId && <p className='recovery-logging'>Success! Recovery transaction has been submitted. Transaction ID: {this.state.recoveryTxId}</p>}
            <Row>
              <Col xs={12}>
                {!this.state.recovering && !this.state.recoveryTxId &&
                <Button
                  onClick={this.performRecovery}
                  disabled={!Boolean(
                    this.state.validWalletId &&
                    this.state.validRecoveryAddress &&
                    this.state.twofa
                  )}
                  className='bitgo-button'>
                  Recover Ledger Wallet
                </Button>
                }
                {!this.state.recoveryTxId && this.state.recovering &&
                <Button disabled={true} className='bitgo-button'>
                  Recovering...
                </Button>
                }
                {this.state.recoveryTxId && !this.state.recovering && !this.state.error &&
                <Button disabled={true} className='bitgo-button'>
                  Recovery Successful
                </Button>
                }
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    )
  }
}

export default LedgerRecoveryForm;
