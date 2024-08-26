# Ethereum Classic Transaction Broadcast with Node.js

This documentation provides a guide to broadcast Ethereum Classic transactions to the mainnet using a Node.js script and the CryptoAPIs service.

## Requirements

- Node.js installed on your machine
- [Axios'](https://www.npmjs.com/package/axios) library for making HTTP requests

## Setup

1. Install the required package by running:

   ```bash
   npm install axios

2. Obtain an API Key from CryptoAPIs:
   - Sign up for [cryptoapis.io](https://my.cryptoapis.io/login)
   - Create a new api-key [here](https://my.cryptoapis.io/api-keys)

## Script 
Create a new file called `broadcastETCTransaction.js` 
and add the following script:

```js
const axios = require('axios');

// Replace with your API key
const apiKey = 'your-api-key-here';

// Replace with your signed transaction hex
const signedTransactionHex = 'your-signed-transaction-hex-here';

const broadcastTransaction = async () => {
  try {
    const response = await axios.post(
      'https://rest.cryptoapis.io/blockchain-tools/ethereum-classic/mainnet/transactions/broadcast?context=broadcastETC',
      {
        context: '', // Optional
        data: {
          item: {
            signedTransactionHex: signedTransactionHex
          }
        }
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Transaction Broadcasted Successfully:', response.data);
  } catch (error) {
    console.error('Error broadcasting transaction:', error.response ? error.response.data : error.message);
  }
};

broadcastTransaction();

```

## Running the script
1. Replace the `apiKey` and `signedTransactionHex` variables with your actual API key and signed transaction hex.
2. Run the script:
  ```
  node broadcastETCTransaction.js
  ```

## Response

If successful, the script will output a JSON object with the following structure:
```json
{
  "apiVersion": "string",
  "requestId": "string",
  "context": "string",
  "data": {
    "item": {
      "transactionId": "string"
    }
  }
}
```
The response will contain the following fields:

- `apiVersion` (string): The version of the API.

- `requestId` (string): The ID of the request.

- `context` (string): The context of the response.

- `data` (object):

  - `item` (object):

    - `transactionId` (string): The ID of the broadcasted transaction.
