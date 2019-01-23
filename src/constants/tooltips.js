export default {
  crossChain: {
    sourceCoin: () => 'This is the coin that was sent to the wrong address. For instance, if you sent BTC to an LTC address, the source coin would be BTC.',
    destinationCoin: () => 'This is the coin type of the wallet that received the source coin. For instance, if you sent BTC to an LTC address, the destination coin would be LTC.',
    wallet: (coin) => `This is the wallet ID of the wallet that received the source coin. This should be a ${coin.toUpperCase()} wallet.`,
    txid: (coin) => `The transaction IDs of the transactions that sent ${coin.toUpperCase()} to the wrong address.`,
    address: (coin) => `The address the source coin was mistakenly sent to. This should be a ${coin.toUpperCase()} address.`,
    unspent: (coin) => `The unspent ID of the lost ${coin.toUpperCase()}, in the form [PREVIOUS_TX_ID]:[N_OUTPUT].`,
    recoveryAddress: (coin) => `The address your recovery transaction will send to. This should be a ${coin.toUpperCase()} address.`,
    passphrase: (coin) => `The wallet passphrase of the ${coin.toUpperCase()} wallet that received the source coin. You can leave this blank if you know the private key.`,
    prv: (coin) => `The private key (xprv) for the ${coin.toUpperCase()} wallet that received the source coin. If you have your wallet passphrase, you don't need this.`
  },
  unsupportedToken: {
    walletId: 'The ID of the wallet that received the unsupported token.',
    tokenAddress: 'The address of the smart contract of the token to recover. This is unique to each token, and is NOT your wallet address.',
    recoveryAddress: 'The address your recovered tokens will be sent to. This address should belong to a non-BitGo wallet that supports the token.',
    passphrase: 'The wallet passphrase of the wallet that received the unsupported token. You can leave this blank if you know the private key.',
    prv: 'The private key (xprv) of the wallet that received the unsupported token. You can leave this blank if you know the wallet passphrase.'
  },
  recovery: {
    userKey: `Your encrypted user key, as found on your recovery KeyCard.`,
    backupPrivateKey: `Your encrypted backup key, as found on your recovery KeyCard.`,
    backupPublicKey: `The backup public key for the wallet, as found on your recovery KeyCard.`,
    bitgoKey: `The BitGo public key for the wallet, as found on your recovery KeyCard.`,
    rootAddress: 'The root address of the wallet.',
    walletContractAddress: `The ETH address of the wallet contract. This is also the wallet's base address.`,
    walletPassphrase: `The passphrase of the wallet.`,
    recoveryDestination: `The address your recovery transaction will send to.`,
    scan: 'The amount of addresses without transactions to scan before stopping the tool.',
    tokenAddress: 'The address of the smart contract of the token to recover. This is unique to each token, and is NOT your wallet address.',
    krsProvider: 'The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank.'
  },
  migratedBch: {
    walletId: 'The ID (base address) of the v1 BTC wallet which this BCH wallet was migrated from. If you are having trouble locating this ID, please contact support@bitgo.com.',
    recoveryAddress: 'The address of the new wallet where you would like your recovered funds to be sent.',
    passphrase: 'The wallet passphrase of the migrated wallet.',
    twofa: 'Second factor authentication (2FA) code',
  },
  unsignedSweep: {
    userKey: `Your user public key`,
    backupPublicKey: `The backup public key for the wallet, as found on your recovery KeyCard.`,
    bitgoKey: `The BitGo public key for the wallet, as found on your recovery KeyCard.`,
    rootAddress: 'The root address of the wallet.',
    walletContractAddress: `The ETH address of the wallet contract. This is also the wallet's base address.`,
    recoveryDestination: `The address your recovery transaction will send to.`,
    scan: 'The amount of addresses without transactions to scan before stopping the tool.',
    tokenAddress: 'The address of the smart contract of the token to recover. This is unique to each token, and is NOT your wallet address.',
  }
}
