require('@babel/polyfill');
const Transport = require('@ledgerhq/hw-transport-node-hid').default;
const AppBtc = require('@ledgerhq/hw-app-btc').default;

const debug = require('debug')('bitgo:wrw:service:ledger');
const { channels, events, commands } = require('../constants/ledger');

/**
 * Background service to communicate with Ledger devices.
 *
 * Interaction with these devices should not be done on the renderer thread,
 * so these operations need to be offloaded onto a background thread. This
 * service provides the IPC channel between the renderer thread and the
 * background thread, and manages the ledger transport and device instances.
 */
class LedgerService {

  /**
   * Create a new Ledger service
   * @param ipc {WebContents} webContents instance which can send events to the renderer process
   */
  constructor(ipc) {
    this.ipc = ipc;
    this.devices = {};
  }

  /**
   * Start a new instance of the ledger command service.
   *
   * @param emitter command emitter which emits ledger commands on the command channel
   * @param ipc IPC main instance which can send messages to the render process
   * @return {LedgerService}
   */
  static start(emitter, ipc) {
    debug('service started');

    const service = new LedgerService(ipc);
    service.subscribe(emitter);

    return service;
  }

  /**
   * Stop this ledger service, and unsubscribe from ledger events if there is an active subscription.
   */
  stop() {
    debug('service stopped');
    if (this.ledgerSub) {
      this.ledgerSub.unsubscribe();
    }
  }

  /**
   * Subscribe to ledger and command events
   */
  subscribe(emitter) {
    debug('subscribing to ledger events');
    if (this.ledgerSub) {
      throw new Error('already subscribed. If you want to re-subscribe, call stop() first');
    }

    this.ledgerSub = Transport.listen(this);

    debug('registering for ipc events');
    emitter.on(channels.COMMAND, (event, arg) => {
      debug('got ledger command event');
      if (!(arg instanceof Object)) {
        event.sender.send(channels.RESPONSE, { error: new Error('command arguments must be an object') });
        return;
      }

      try {
        this.handleCommand(Object.assign(arg, { sender: event.sender }));
      } catch (e) {
        debug('got an error while handling command:', e);
      }
    });
  }

  /**
   * Process a ledger command originating from the render process
   * @param command The command to execute
   * @param nonce The unique nonce for this command
   * @param args The arguments for this command which will be provided to the ledger device
   * @param device Complete path to the ledger device on which the command will be executed
   * @param sender An IPC channel which can be used to send a command response to the render process
   * @return {void}
   */
  handleCommand({ command, nonce, args, device, sender }) {
    debug(`handling ledger command ${command}:${nonce}`);
    console.dir(args, { depth: null });

    // all responses should include the command and the nonce
    const response = { command, nonce };

    // convenience functions for sending responses
    const send = (args) => { sender.send(channels.RESPONSE, args) }; // braces are intentional, return void
    const sendResult = (result) => send(Object.assign(response, { result }));
    const sendError = (error) => send(Object.assign(response, { error }));

    switch (command) {
      case commands.PING:
        return send(response);

      case commands.QUERY:
        return send(Object.assign(response, { devices: Object.keys(this.devices) }));

      case commands.PUBKEY:
        if (!this.devices[device]) {
        debug('device not found: ', device);
        return;
      }

        // TODO: validate arguments before passing to ledger transport
        this.devices[device].getWalletPublicKey(args.path, args.verify, args.segwit)
        .then(result => {
          debug('derived public key at path', args.path);
          sendResult(result);
        })
        .catch(e => {
          debug('failed to get wallet public key', e);
          sendError(e);
        });
        break;

      case commands.SIGN_TX:
        if (!this.devices[device]) {
          debug('device not found: ', device);
          return;
        }

        console.log('signing tx with args:');
        console.dir(args, { depth: null });

        // TODO: validate arguments before passing to ledger transport
        this.devices[device].signP2SHTransaction(
          args.inputs,
          args.associatedKeysets,
          args.outputScriptHex,
          args.lockTime,
          args.sigHashType,
          args.segwit
        )
        .then(result => {
          debug('sign tx result:', result);
          sendResult(result);
        })
        .catch(e => {
          debug('failed to sign transaction:', e);
          sendError(e);
        });
        break;

      case commands.SPLIT_TX:
        if (!this.devices[device]) {
          debug('device not found: ', device);
          return;
        }

        // TODO: validate arguments before passing to ledger transport
        const splitTx = this.devices[device].splitTransaction(Buffer.from(args.hex, 'hex'), args.segwit);
        return sendResult(splitTx);

      case commands.SERIALIZE_OUTPUTS:
        if (!this.devices[device]) {
          debug('device not found: ', device);
          return;
        }

        // TODO: validate arguments before passing to ledger transport
        const serializedOutputs = this.devices[device].serializeTransactionOutputs(args.tx);
        return sendResult(serializedOutputs);

      default:
        debug('unknown command', command);
        return sendError(new Error(`unknown command ${command}`));
    }
  }

  /**
   * Handle a ledger event. Only 'add' and 'remove' events are handled.
   *
   * @param event {{}} ledger event from ledger transport listener
   * @return {void}
   */
  next(event) {
    debug('ledger event', event.type, event.device.manufacturer, event.device.product);

    const send = (event, args) => this.ipc.send(channels.EVENT, { event, ...args });

    switch (event.type) {
      case 'add':
        Transport.open(event.descriptor)
        .then(transport => {
          this.devices[event.descriptor] = new AppBtc(transport);
          send(events.CONNECTED, { device: event.descriptor });
          debug('opened transport');
        })
        .catch(e => {
          debug('failed to open transport');
          debug(e);
        });
        break;

      case 'remove':
        debug('remove event');
        delete this.devices[event.descriptor];
        send(events.REMOVED, { device: event.descriptor });
        break;

      default:
        debug('unknown ledger event', event.type);
    }
  }

  /**
   * Handle an error from the ledger transport
   *
   * @param err {Error}
   */
  error = err => {
    debug('ledger error', err);
  };

  /**
   * Handle a completion event from the ledger transport. Unclear what this means exactly, or when it is fired.
   */
  complete = () => {
    debug('ledger complete');
  };

}

module.exports.LedgerService = LedgerService;
