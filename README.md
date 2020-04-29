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

```shell
Example: $ node --version; npm --version
v10.17.0
6.11.3
```

3) Required dependencies for installations
Run the following commands on your MacOS to install the required 3rd-party dependencies. Not all are
required for Development but are for generating release packages. Only install ONCE.

```shell
# Required for generating a win32 release package.
$ brew install mono
```

```shell
# Required for generating a linux debian release package.
$ brew install dpkg
$ brew install fakeroot
```

```shell
# Install xquartz (X server) and wine
$ brew cask install xquartz
$ brew cask install wine-stable
$ brew install openssl 	# required to compile native libraries
$ ln -s /usr/local/opt/openssl/include/openssl /usr/local/include 	# required to compile native libraries
```

Note: The installations of win32 or linux dependent packages may screw up your existing installed tools (i.e. openssl, python, etc.).
If so, please re-install them via "brew" package manager or other means.


## Development Setup
```shell
$ git clone git@github.com:BitGo/wallet-recovery-wizard.git # install the application
$ cd wallet-recovery-wizard
$ brew install openssl # required to compile native libraries
$ ln -s /usr/local/opt/openssl/include/openssl /usr/local/include # required to compile native libraries
$ npm install
$ ./node_modules/.bin/electron-rebuild
$ npm run start # run a development server and start the app
```

## Build and Release
First, bump the version in package.json, then:
```shell
$ npm install
$ npm run make
```
Three files will be created:
```shell
./out/make/bitgowalletrecoverywizard_VERSION_amd64.deb
./out/make/BitGoWalletRecoveryWizard-VERSION.dmg
./out/make/squirrel.windows/ia32/BitGoWalletRecoveryWizard-VERSION Setup.exe
```
For each of these, do:
```shell
$ shasum -a 256 <filename>
```
And copy the hash.

then:

- Go back to the Releases list and click "Draft a new release"
- Set the title and tag to "vx.y.z"
- Paste the template into the description and update the SHA-256 hashes at the bottom
- Upload the binaries in the file picker at the bottom
- Publish the release!
