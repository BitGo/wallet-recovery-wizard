Wallet Recovery Wizard supports building transactions to recover VET from your BitGo Hot and Self-Managed Cold wallets.

For Hot wallets Wallet Recovery Wizard signs the transaction. This transaction needs to be broadcasted manually.
For Self-Managed Cold wallets Wallet Recovery Wizard builds the unsigned transaction and allows you to sign it offline. After signing, you will need to broadcast the transaction manually.

Below is a official full node public REST endpoint that must be called to broadcast the transaction.

Construct the API request to the full node:

    Mainnet Request URL: https://sync-mainnet.vechain.org/

    Request Body format (find "serializedTx" in your downloaded JSON):

```json
{
  "raw": "serializedTx"
}
```

## Important Note

If using an API request tool such as [Postman](https://www.postman.com/), you must add a header with key: "Content-Type" and value: "application/json".
