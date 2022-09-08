# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

Withdraw Funds without BitGo:

- Unsigned Sweep: Build an unsigned transaction using the user and backup public keys, independent from any BitGo services.
- Non-BitGo Recoveries: Build a transaction using the recovery KeyCard, independent from any BitGo services.
- Coin Support:
  | | Production | Test |
  |-------| ------------- | ------------- |
  | AVAXC | Yes | Yes |
  | BTC | Yes | Yes |
  | BCH | Yes | No |
  | BTG | Yes | No |
  | DASH | Yes | No |
  | ETH | Yes | Yes |
  | EOS | Yes | Yes |
  | ERC20 | Yes | Yes |
  | LTC | Yes | No |
  | TRX | Yes | Yes |
  | XLM | Yes | Yes |
  | XRP | Yes | Yes |
  | ZEC | Yes | No |

## Installing and Downloading

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

## Important Documentation

Instructions to broadcast EOS transactions: [EOS.md](EOS.md)

Instructions to do Non-BitGo recovery from hot wallets: [NON_BITGO_RECOVERY.md](NON_BITGO_RECOVERY.md)

Instructions to do Non-BitGo recovery from cold wallets (Unsigned Sweep): [UNSIGNED_SWEEP.md](UNSIGNED_SWEEP.md)
