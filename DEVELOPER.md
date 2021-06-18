
## Pre-requisites

1) Build or Release Platform: MacOS 10.12 or higher

2) Node Version: 14.15.3 or higher
```bash
node --version; npm --version
v14.15.3
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
## Adding Coin Support for Non-BitGo Recovery & Unsigned Sweep

### Dependencies

The WRW depends on the BitGo SDK (https://github.com/BitGo/BitGoJS) for its underlying recovery logic. In order to add support for a new coin, you need to make sure the `recover` function has been properly implemented in the SDK. 

* For UTXO coins, you could reuse or extend the current implementation in `BitGoJS/modules/core/src/v2/coins/abstractUtxoCoin.ts` 
* For account-based coins, you can reference `BitGoJS/modules/core/src/v2/coins/eth.ts` as an example

Besides the BitGo SDK, the WRW also depends on third-party nodes or block explorers.

* Since recovery transactions need to be constructed without BitGo, we rely on using 3rd-party nodes to query address or account balances.
* For UTXO coins, an API endpoint is needed to implement the `getAddressInfoFromExplorer` and `getUnspentInfoFromExplorer` functions, which are used in `recover`. Blockchair provide universal API interface for multiple coins, such as BTC and LTC. You may also find
your own explorer. Note that UTXO-coin recovery tends to generate many calls to the full node, since it need to rederive addresses based on key information and check for remaining funds in each derived address. Be aware that rate limit might be reached.
* For account-based coins, there are no shared functions defined in the parent class. Each coin class may have its own functions that communicate with a third-party node. For example, the ETH recovery has `recoveryBlockchainExplorerQuery` whereas EOS recovery has `getDataFromNode`. 

### Changes to the WRW
* Once the changes are merged in the SDK and a new SDK is released, you now can update the SDK version in the WRW, and start to build out the WRW’s front end features.

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
