# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

* Cross-Chain Recoveries: Recover funds sent to the wrong chain, such as LTC sent to a BTC address.
* Non-BitGo Recoveries: Build and send a transaction using the recovery KeyCard, independent from any BitGo services.

## Application Setup
```shell
git clone git@github.com:BitGo/wallet-recovery-wizard.git # install the application
cd wallet-recovery-wizard
yarn install --ignore-engines # can also use npm
yarn run dev # run a development server and start the app
```