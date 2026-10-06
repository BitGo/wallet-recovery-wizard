# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

Withdraw Funds without BitGo:

- Unsigned Sweep: Build an unsigned transaction using the user and backup public keys, independent from any BitGo services.
- Non-BitGo Recoveries: Build a transaction using the recovery KeyCard, independent from any BitGo services.
- Coin Support:

  | Coin  | Production | Test |
  | ----- | ---------- | ---- |
  | AVAXC | Yes        | Yes  |
  | BTC   | Yes        | Yes  |
  | BCH   | Yes        | No   |
  | BTG   | Yes        | No   |
  | DASH  | Yes        | No   |
  | ETH   | Yes        | Yes  |
  | ETHw  | Yes        | No   |
  | EOS   | Yes        | Yes  |
  | ERC20 | Yes        | Yes  |
  | LTC   | Yes        | No   |
  | SOL   | Yes        | Yes  |
  | TRX   | Yes        | Yes  |
  | XLM   | Yes        | Yes  |
  | XRP   | Yes        | Yes  |
  | ZEC   | Yes        | No   |

- | HBAR | Yes | Yes |
- | ALGO | Yes | Yes |

## Installing and Downloading

This project was bootstrapped with [Electron Vite React](https://github.com/electron-vite/electron-vite-react).

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

## Important Documentation

Instructions to broadcast ETHw transactions: [ETHW.md](ETHW.md)

Instructions to broadcast ETHLike transactions [ETHLIKE.md](ETHLIKE.md)

Instructions to broadcast EOS transactions: [EOS.md](EOS.md)

Instructions to broadcast DOT transactions: [DOT.md](DOT.md)

Instructions to broadcast NEAR transactions: [NEAR.md](NEAR.md)

Instructions to broadcast SOL transactions: [SOL.md](SOL.md)

Instructions for Solana self-managed cold wallet recovery (Mainnet): [SOL_MAINNET_RECOVERY_GUIDE.md](SOL_MAINNET_RECOVERY_GUIDE.md)

Instructions for Solana self-managed cold wallet recovery (Devnet practice): [SOL_DEVNET_RECOVERY_GUIDE.md](SOL_DEVNET_RECOVERY_GUIDE.md)

Instructions to do Non-BitGo recovery from hot wallets: [NON_BITGO_RECOVERY.md](NON_BITGO_RECOVERY.md)

Instructions to do Non-BitGo recovery from cold wallets (Unsigned Sweep): [UNSIGNED_SWEEP.md](UNSIGNED_SWEEP.md)

Instructions to do Non-BitGo consolidate recovery from cold wallets (Unsigned Consolidate Recover): [UNSIGNED_CONSOLIDATE_RECOVER.md](UNSIGNED_CONSOLIDATE_RECOVER.md)

Instructions to decode ETH transactions [DECODE.md](DECODE.MD)

Instructions to obtain durable nonce for SOL transactions [DURABLE_NONCE.md](DURABLE_NONCE.md)

## Python Scripts

The repo includes runnable Python scripts to assist with recovery flows. These run locally and require no BitGo services:

- Solana recovery helpers (base58 key conversion, signature verification, signature splice, and RPC broadcast): [sol_recovery.py](sol_recovery.py). Run `python3 sol_recovery.py --help` for usage. The `verify` subcommand requires `pip3 install cryptography`.
- Cardano transaction assembly and broadcast: [broadcast_ada.py](broadcast_ada.py). Requires `pip3 install cbor2`.

## FAQs

How can I onboard a new coin for Wallet Recovery Wizard? [ONBOARD_COIN.md](ONBOARD_COIN.md)
