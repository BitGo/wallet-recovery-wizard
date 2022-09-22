# ETHw Transaction Broadcast Instructions

Our tool can help you build a transaction to recover ETHw, but you have to broadcast the transaction to network yourselves.

Unfortunately, we could not find any block explorers that can assist you with broadcasting, but we have found a full node RPC endpoint which you can call.

If you found that this URL is no longer valid, you can likely find newly hosted endpoints via google search. Please also let us know so we can update these URLs.

Construct your API request to the full node:

    Request URL: https://mainnet.ethereumpow.org/

    Method: POST

    Request Body format (you should find "tx" in your downloaded JSON):

```json
{
  "method": "eth_sendRawTransaction",
  "params": ["0x + tx"],
  "id": 2,
  "jsonrpc": "2.0"
}
```

## Important Note

You must prepend 0x to "tx" from your downloaded JSON in order for the request to succeed.
