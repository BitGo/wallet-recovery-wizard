# Obtain Durable Nonce Instructions

Wallet Recovery Wizard allows you to provide a durable nonce when building Solana recoveries. A durable nonce allows you to extend the 60 second broadcast window of Solana transactions. After selecting "SOL" or "TSOL" from the coin dropdown, you will see two fields: Durable Nonce: Public Key and Durable Nonce: Secret Key. You may either enter the keys for a durable nonce you already have prepared or follow the steps below to create one (Note: if you receiver an "unknown signer" error, skip to step 3 of the instructions below):

1. Open a terminal window, clone the repository, navigate to the cloned repository and install node modules:

```bash
git clone git@github.com:BitGo/wallet-recovery-wizard.git
cd wallet-recovery-wizard
npm i
```

2. Run the script to build a durable nonce with the "create" command, and save your public key and secret key:

```bash
npm run durable-nonce:build -- create
```

3.  Run the script to build a durable nonce with the "import" command, and copy and paste the public key and secret key into Wallet Recovery Wizard.

    i. If on Devnet, set the -n flag to "devnet":

    ```bash
    npm run durable-nonce:build -- import -n devnet
    ```

    ii. If on Mainnet Beta, set the -n flag to "mainnet-beta":

    ```bash
    npm run durable-nonce:build -- import -n mainnet-beta
    ```

# Obtain Durable Nonce Instructions for Consolidation through WRW

1. Clone and install BitgoJS project
2. Exec ```npx ts-node create-account.ts```. This creates and populates a main nonce account - address and private keys in ```json/keypair.json```
const accountsRequired = 5
3. Update ```generate-nonce-accounts.ts``` as per the requirement; vars to be updated - ```network```, ```coin```, ```accountsRequired```; If the network is testnet, main account will be automatically air dropped with required funds for address creation (unless limits for the day has been reached) else it has to be done manually. ```accountsRequired``` - has a direct relation to the number of indexes which will be used with WRW; lets say startIndex is 1 and endIndex is 3, then the ```accountsRequired``` is ```2```

4. File - ```BitGoJS/examples/ts/sol/utils/nonce-account-creation/json/nonceAddresses.json``` will have the final list of nonce accounts (format: ```secret key : [list of public keys]```) required to be used with WRW (Publick Keys for durable Nonces - make sure no quotes are used!; and Secret Key for durable Nonces)

5. (Optional) After we use WRW along with keys generated from Step 4; a signed tx files can be downloaded from WRW whose content can be populated in ```json/txs.json``` to broadcast in testnet/mainnet; Command to be used - ```npx ts-node broadcast_sol.ts```; Please update ```network``` var in the file before execution