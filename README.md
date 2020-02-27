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
## Releasing
First, bump the version in package.json, then:
```shell
npm run make
```
Three files will be created:
```shell
./out/make/bitgowalletrecoverywizard_VERSION_amd64.deb
./out/make/BitGoWalletRecoveryWizard-VERSION.dmg
./out/make/squirrel.windows/ia32/BitGoWalletRecoveryWizard-VERSION Setup.exe
```
For each of these, do:
```shell
shasum -a 256 <filename>
```
And copy the hash.

then:

- Go back to the Releases list and click "Draft a new release"
- Set the title and tag to "vx.y.z"
- Paste the template into the description and update the SHA-256 hashes at the bottom
- Upload the binaries in the file picker at the bottom
- Publish the release!
