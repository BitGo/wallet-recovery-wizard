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

### Build troubleshooting

- Note that in order to run the build script, you'll either need python available at `/usr/bin/python`, or you can set an environment variable `PYTHON_PATH`. You can set the variable by running `export PYTHON_PATH=$(which python)`.
- If you encounter the error `libtool is required, but wasn't found on this system`, you'll need to install `sodium` using [these instructions](https://github.com/paixaop/node-sodium).

## Release

- Navigate to the [GHA release workflow page](https://github.com/BitGo/wallet-recovery-wizard/actions/workflows/release.yml), and click on `Run workflow`
- Enter the version number for the next release. This should be a [semantic version](https://docs.npmjs.com/about-semantic-versioning).
- Click on `Run workflow`.
- The workflow will create a draft release in the [releases page](https://github.com/BitGo/wallet-recovery-wizard/releases).
- Validate that the release notes are accurate, and that the artifacts are working correctly.
- Publish the release in GitHub. This will also create a git tag in the repository.
- Go to Slack on `#eng-wrw` and announce the release with the link to GitHub release page.
