Version 4.5.0 of the Wallet Recovery Wizard supports building transactions to recover DOT from your BitGo Hot and Self-Managed Cold wallets.

Below is a list full node RPC endpoints that must be called to broadcast the transaction as there are no suitable explorers available for DOT.

Construct the API request to the full node:

    Testnet Request URL: wss://westend-rpc.polkadot.io

    Mainnet Request URL: wss://rpc.polkadot.io

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

If using an API request tool such as [Postman](https://www.postman.com/), you must ensure that you connect to a WS endpoint instead of an HTTP endpoint.

[How to create a WS request using Postman](https://learning.postman.com/docs/sending-requests/websocket/websocket/)
