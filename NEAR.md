Version 4.4.0 of the Wallet Recovery Wizard supports building transactions to recover NEAR from your BitGo Hot and Self-Managed Cold wallets.

Below is a list full node RPC endpoints that must be called to broadcast the transaction as there are no suitable explorers available for NEAR.

Construct the API request to the full node:

    Testnet Request URL: https://rpc.mainnet.near.org

    Mainnet Request URL: https://rpc.testnet.near.org

    Method: POST

    Request Body format (find "serializedTx" in your downloaded JSON):

```json
{
  "id": 2,
  "jsonrpc": "2.0",
  "method": "broadcast_tx_commit",
  "params": ["serializedTx"]
}
```

## Important Note

If using an API request tool such as [Postman](https://www.postman.com/), you must add a header with key: "Content-Type" and value: "application/json".
