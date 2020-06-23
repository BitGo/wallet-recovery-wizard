# BitGo Wallet Recovery Wizard

This tool is built for assisting customers with recovering coins from BitGo wallets.

The application currently offers the following recoveries:

* Cross-Chain Recoveries: Recover funds sent to the wrong chain, such as LTC sent to a BTC address.
* Non-BitGo Recoveries: Build and send a transaction using the recovery KeyCard, independent from any BitGo services.

## Installing and Downloading

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Please see the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).

## Pre-requisites

1) Build or Release Platform: MacOS 10.12 or higher

2) Node Version: 10.17.0 or higher
```bash
node --version; npm --version
v10.17.0
6.11.3
```

3) Docker - https://docs.docker.com/get-docker/

## Development Setup
```bash
git clone git@github.com:BitGo/wallet-recovery-wizard.git
cd wallet-recovery-wizard
npm install
npm start
```

## Build and Test
You can test out a release on MacOS by running `npm run pack`. This will give you a packaged target in `/dist/mac`.

## Build and Release
Run the `package.sh` script and pass it the updated version:
```bash
./scripts/package.sh 2.2.3
```

Package files will be created in `/dist`:
```bash
BitGoWalletRecoveryWizard_VERSION_amd64.deb
BitGoWalletRecoveryWizard-VERSION.dmg
BitGoWalletRecoveryWizard Setup VERSION.exe
```

For each of these, do:
```bash
shasum -a 256 <filename>
```

- Copy the hash
- Go back to the Releases list and click "Draft a new release"
- Set the title and tag to "vx.y.z"
- Paste the template into the description and update the SHA-256 hashes at the bottom
- Upload the binaries in the file picker at the bottom
- Publish the release!
