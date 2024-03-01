Below is a list of full node RPC endpoints that must be called to broadcast the transaction for EthLike coins like Arbitrum, Optimism, etc

Construct the API request to the full node:

    Arbitrum Sepolia Request URL: https://sepolia-rollup.arbitrum.io/rpc

    Arbitrum Mainnet Request URL: https://arb1.arbitrum.io/rpc

    Optimism Sepolia Request URL: https://sepolia.optimism.io

    Optimism Mainnet Request URL: https://mainnet.optimism.io 

    Method: POST

    Request Body format (find "tx" in your downloaded JSON):

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_sendRawTransaction",
  "params": ["tx"]
}
```