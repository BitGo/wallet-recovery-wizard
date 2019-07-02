# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

* Cross-Chain Recoveries: Recover funds sent to the wrong chain, such as LTC sent to a BTC address.
* Non-BitGo Recoveries: Build and send a transaction using the recovery KeyCard, independent from any BitGo services.

## Installing and Downloading

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

## Development Setup
```shell
git clone git@github.com:BitGo/wallet-recovery-wizard.git # install the application
cd wallet-recovery-wizard
brew install openssl # required to compile native libraries
ln -s /usr/local/opt/openssl/include/openssl /usr/local/include # required to compile native libraries
npm install
./node_modules/.bin/electron-rebuild
npm run start # run a development server and start the app
```
