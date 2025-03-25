Version 4.5.0 of the Wallet Recovery Wizard supports building transactions to recover ICP from your BitGo Hot and Self-Managed Cold wallets.

Below is a list full node RPC endpoints that must be called to broadcast the transaction as there are no suitable explorers available for TAO.

Construct the API request to the full node:

    Mainnet Request URL: https://www.icpexplorer.org/#/txs

    Request Body format (find "serializedTx" in your downloaded JSON):

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "author_submitExtrinsic",
  "params": ["serializedTx"]
}
```

## Important Note

If using an API request tool such as [Postman](https://www.postman.com/), you must add a header with key: "Content-Type" and value: "application/json".

