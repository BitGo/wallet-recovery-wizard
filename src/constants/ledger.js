
module.exports = {
  events: {
    CONNECTED: 'ledger-connected',
    REMOVED: 'ledger-removed'
  },
  channels: {
    COMMAND: 'ledger-command',
    RESPONSE: 'ledger-response',
    EVENT: 'ledger-event'
  },
  commands: {
    PING: 'ledger-ping',
    QUERY: 'ledger-device-query',
    PUBKEY: 'ledger-derive-pubkey',
    SIGN_TX: 'ledger-sign-tx',
    SPLIT_TX: 'ledger-split-tx',
    SERIALIZE_OUTPUTS: 'ledger-serialize-outputs'
  },
  states: {
    CONNECTED: 0,
    NOT_CONNECTED: 1
  },
  paths: {
    bitcoin: `44'/0'`,
    testnet: `44'/1'`
  }
};
