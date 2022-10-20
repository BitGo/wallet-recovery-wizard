# Obtain Durable Nonce Instructions

Wallet Recovery Wizard allows you to provide a durable nonce when building Solana recoveries. A durable nonce allows you to extend the 60 second broadcast window of Solana transactions. After selecting "SOL" or "TSOL" from the coin dropdown, you will see two fields: Durable Nonce: Public Key and Durable Nonce: Secret Key. You may either enter the keys for a durable nonce you already have prepared or follow the steps below to create one (Note: if you receiver an "unknown signer" error, skip to step 3 of the instructions below):

1. Open a terminal window, clone the repository, navigate to the cloned repository and install node modules:

```bash
git clone git@github.com:BitGo/wallet-recovery-wizard.git
cd wallet-recovery-wizard
npm i
```

2. Run the script to build a durable nonce with the "create" flag set, and save your public key and secret key:

```bash
npm run durable-nonce:build -- -c
```

3.  Run the script to build a durable nonce with the "import" flag set, and copy and paste the public key and secret key into Wallet Recovery Wizard.

    i. If on Devnet, either use the -d flag, or do not specify the environment (devnet is the default):

    ```bash
    npm run durable-nonce:build -- -c -d
    ```

    ii. If on Mainnet Beta, use the -m flag:

    ```bash
    npm run durable-nonce:build -- -c -m
    ```
