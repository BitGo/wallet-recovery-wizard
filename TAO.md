Version 4.5.0 of the Wallet Recovery Wizard supports building transactions to recover TAO from your BitGo Hot and Self-Managed Cold wallets.

Below is a list full node RPC endpoints that must be called to broadcast the transaction as there are no suitable explorers available for TAO.

Construct the API request to the full node:

    Testnet Request URL: wss://test.finney.opentensor.ai

    Mainnet Request URL: wss://entrypoint-finney.opentensor.ai

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
