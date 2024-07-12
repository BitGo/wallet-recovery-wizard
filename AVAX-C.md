Broadcast a transaction to the Avalanche C-Chain (AVAX-C) by constructing an API request to a full node RPC endpoint.

```shell
export REQUEST_URL="<REQUEST_URL>"
  # Testnet: https://api.avax-test.network/ext/bc/C/rpc
  # Mainnet: https://api.avax.network/ext/bc/C/rpc
  # Full node RPC endpoints: https://docs.avax.network/tooling/rpc-providers

curl -X POST $REQUEST_URL \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "jsonrpc": "2.0",
    "method": "eth_sendRawTransaction",
    "params": ["0x + tx"]
  }'
  # find "tx" in your downloaded JSON
  # add the “0x” prefix to the “tx” if it's not already present
```
