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
