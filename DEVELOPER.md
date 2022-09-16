## Pre-requisites

1. Build or Release Platform: MacOS 10.12 or higher

2. Node Version: Check `.nvmrc` for current version.

3. Docker - https://docs.docker.com/get-docker/

## Development Setup

```bash
git clone git@github.com:BitGo/wallet-recovery-wizard.git
cd wallet-recovery-wizard
npm i
npm run dev
```

## Adding Coin Support for Non-BitGo Recovery & Unsigned Sweep

### Dependencies

The WRW depends on the BitGo SDK (https://github.com/BitGo/BitGoJS) for its underlying recovery logic. In order to add support for a new coin, you need to make sure the `recover` function has been properly implemented in the SDK.

- For UTXO coins, you could reuse or extend the current implementation in `BitGoJS/modules/core/src/v2/coins/abstractUtxoCoin.ts`
- For account-based coins, you can reference `BitGoJS/modules/core/src/v2/coins/eth.ts` as an example

Besides the BitGo SDK, the WRW also depends on third-party nodes or block explorers.

- Since recovery transactions need to be constructed without BitGo, we rely on using 3rd-party nodes to query address or account balances.
- For UTXO coins, an API endpoint is needed to implement the `getAddressInfoFromExplorer` and `getUnspentInfoFromExplorer` functions, which are used in `recover`. Blockchair provide universal API interface for multiple coins, such as BTC and LTC. You may also find
  your own explorer. Note that UTXO-coin recovery tends to generate many calls to the full node, since it need to rederive addresses based on key information and check for remaining funds in each derived address. Be aware that rate limit might be reached.
- For account-based coins, there are no shared functions defined in the parent class. Each coin class may have its own functions that communicate with a third-party node. For example, the ETH recovery has `recoveryBlockchainExplorerQuery` whereas EOS recovery has `getDataFromNode`.

### Changes to the WRW

- Once the changes are merged in the SDK and a new SDK is released, you now can update the SDK version in the WRW, and start to build out the WRW’s front end features.

## Build and Test

You can test out a release by running `npm run build`. This will give you a packaged target in `/release`.

## Build and Release

Update the package.json version to the next release version, and commit the changes. Then run `./scripts/docker-build.sh`.

#### Build troubleshooting

- Note that in order to run the build script, you'll either need python available at `/usr/bin/python`, or you can set an environment variable `PYTHON_PATH`. You can set the variable by running `export PYTHON_PATH=$(which python)`.
- If you encounter the error `libtool is required, but wasn't found on this system`, you'll need to install `sodium` using [these instructions](https://github.com/paixaop/node-sodium).

Package files will be created in `/release`:

```bash
Wallet Recovery Wizard-Linux-VERSION.deb
Wallet Recovery Wizard-VERSION.dmg
Wallet Recovery Wizard-Setup-VERSION.exe
```

In order to add the checksums to the release notes, run:

```bash
./scripts/release-notes.sh
```

Add the output to the bottom of the release notes section

### Steps to Release

- Run `git clean -dfx`
- Update version on `package.json` following semantic versioning - https://docs.npmjs.com/about-semantic-versioning
- `npm install` again to generate `package-lock.json`
- Create a branch, commit and merge changes to `master`
- Check out to `master` branch locally and `git pull`
- Go to `https://github.com/BitGo/wallet-recovery-wizard/releases`
- Click `Create draft release`
- Add new tag to the release with the version of the release e.g. `v4.2.1`
- Add title with the version e.g. `v4.2.1`
- Click `Generate release notes`
- (On MacOS) Locally run the docker build script: `./scripts/docker-build.sh`
- (On MacOS) Run the release notes generation script: `./scripts/release-notes.sh`
  - Copy the output and paste it into the release notes draft in GitHub
- After having already ran the docker build script
  - Go into the `release` folder in the root of the repository and upload the `.dmg` , `.deb` and `.exe` files into the release draft in GitHub
- Publish release in GitHub
- Go to Slack on #apps-ovc-wrw and announce the release with the link to GitHub release page
