# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

* Withdraw Funds without BitGo: 

    * Unsigned Sweep: Build an unsigned transaction using the user and backup public keys, independent from any BitGo services. 
    * Non-BitGo Recoveries: Build a transaction using the recovery KeyCard, independent from any BitGo services.
    * Coin Support:
        |       | Production    | Test          |
        |-------| ------------- | ------------- |
        |  BTC  | Yes   | Yes  |
        |  BCH  | Yes  | No  |
        |  BSV  | Yes  | No  |
        |  BCH-ABC  | Yes  | No  |
        |  DASH | Yes  | Yes  |
        |  ETH  | Yes  | Yes  |
        |  EOS  | Yes  | Yes  |
        |  ERC20  | Yes  | Yes  |
        |  LTC  | Yes  | Yes  |
        |  TRX  | Yes  | Yes  |
        |  XLM  | Yes  | Yes  |
        |  XRP  | Yes  | Yes  |

* Cross-Chain Recoveries: Recover funds sent to the wrong chain, such as LTC sent to a BTC address.
    * Cross-chain transaction among BTC, LTC, and BCH can be recovered
* Migrated Legacy: Recover funds from BSV or BCH wallets that were cloned from a V1BTC wallet, as a result of the hardfork. These cloned wallets are missing the encryptedpriv, so they cannot sign transactions
    * Supported coins: BTG, BCH, and BSV
* Unsupported Token Recovery: Unsupported tokens may only be recovered from a wallet's base address, but not from receive addresses. If you have unsupported tokens stuck in receive addresses, then please contact BitGo support.
  We will flush your tokens to base address, and then you can recover them using this tool.

## Installing and Downloading

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

## Important Documentation

Instructions to broadcast EOS transactions: [EOS.md](EOS.md)

Instructions to do Non-BitGo recovery from hot wallets: [NON_BITGO_RECOVERY.md](NON_BITGO_RECOVERY.md)

Instructions to do Non-BitGo recovery from cold wallets (Unsigned Sweep): [UNSIGNED_SWEEP.md](UNSIGNED_SWEEP.md)

Instructions to do Cross-Chain recovery: [CROSS_CHAIN_RECOVERY.md](CROSS_CHAIN_RECOVERY.md)