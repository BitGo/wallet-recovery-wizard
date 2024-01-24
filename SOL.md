Version 4.5.0 of the Wallet Recovery Wizard supports building transactions to recover SOL from your BitGo Hot and Self-Managed Cold wallets.

Below is a list full node RPC endpoints that must be called to broadcast the transaction as there are no suitable explorers available for SOL.

Construct the API request to the full node:

    Testnet Request URL: https://api.devnet.solana.com

    Mainnet Request URL: https://api.mainnet-beta.solana.com

    Method: POST

    Request Body format (find "serializedTx" in your downloaded JSON):

```json
{
  "id": 2,
  "jsonrpc": "2.0",
  "method": "sendTransaction",
  "params": [
    "serializedTx",
    {
      "encoding": "base64"
    }
  ]
}
```
