# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets. The application currently offers the following recoveries:

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
        |  DASH | Yes  | No  |
        |  ETH  | Yes  | Yes  |
        |  EOS  | Yes  | Yes  |
        |  ERC20  | Yes  | Yes  |
        |  LTC  | Yes  | No  |
        |  TRX  | Yes  | Yes  |
        |  XLM  | Yes  | Yes  |
        |  XRP  | Yes  | Yes  |

* Cross-Chain Recoveries: Recover funds sent to the wrong chain, such as LTC sent to a BTC address.
    * Cross-chain transaction among BTC, LTC, and BCH can be recovered
* Migrated Legacy: Recover funds from BSV or BCH wallets that were cloned from a V1BTC wallet, as a result of the hardfork. These cloned wallets are missing the encryptedpriv, so they cannot sign transactions
    * Supported coins: BTG, BCH, and BSV
* Unsupported Token Recovery: Unsupported tokens may only be recovered from a wallet's base address, but not from receive addresses

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

### Important Documentation

Instructions to broadcast EOS transactions: [EOS.md](EOS.md)

### Development

1. Double check that you are using node version `14.18.1`. Recommend using `nvm`.
2. Run the following command and make sure you're in the root directory:
```bash
yarn install
yarn run start
```

### Deployment

To create a `.app` on OSX or `.deb` on Linux run the `yarn run package` command. The `yarn run package` command will create an `out/` folder and add the app in there once compiled. Run `yarn run make` to zip up the app to more easily share with others. Note that `yarn run make` commands use the `package` command.

If making for testing purposes run:
```bash
yarn run make
```

### Testing

To run the tests:
```bash
yarn run test
```

### Debugging Tests

- Open your chrome app at `chrome://inspect/#devices`.
- Start the app with the following
  ```bash
  yarn run test:debug
  ```
- On `chrome://inspect/#devices` you'll then see a Remote Target to connect to.

### Code Formatting

With the Prettier extension installed you should already have editor.formatOnSave and editor.formatOnPaste working for your JS/TS code.

Make sure you are using the right formatter on VSCode, with a .js(x) or .ts(x) file open, you can press Cmd+Shift+P and look for Format Document With... and make sure Prettier is your default formatter.

For viewing all lint warnings/errors, run:

```
yarn run lint
```

For running the linter to fix auto fixable issues with ESLint, you can run this command:

```
yarn run lint:fix
```
