# ETHw Transaction Broadcast Instructions

Version 4.3.0 of the Wallet Recovery Wizard supports building transactions to recover ETHw from your BitGo Hot and Self-Managed Cold wallets.

Below is the full node RPC endpoint that must be called to broadcast the transaction as there are no suitable explorers available for ETHw. 

Construct the API request to the full node:

    Request URL: https://mainnet.ethereumpow.org/

    Method: POST

    Request Body format (find "tx" in your downloaded JSON):

```json
{
  "method": "eth_sendRawTransaction",
  "params": ["0x + tx"],
  "id": 2,
  "jsonrpc": "2.0"
}
```

## Important Note

**Must prepend 0x to "tx" from the downloaded JSON in order for the request to succeed.**

If the request URL is no longer valid, please find newly hosted endpoints via google search or contact your BitGo representative.
