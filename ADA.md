Version 4.5.0 of the Wallet Recovery Wizard supports building transactions to recover ADA from your BitGo Hot and Self-Managed Cold wallets.

For Mainnet, [blockchair.com](https://blockchair.com/broadcast) is a suitable explorer to broadcast the transaction.

For Testnet, [Koios Decentralized API](https://koios.rest/) is a suitable provider to broadcast the transaction.

Requeriments:

- Node.js
- axios

Instructions:

- Run the following command to install axios:

```bash
npm install axios
```

- Create a file called `submitTx.js` and paste the following code:

```javascript
const axios = require('axios');

const axiosConfig = {
  headers: {
    'Content-Type': 'application/cbor',
  },
  timeout: 50000,
};

// Mainnet = https://api.koios.rest/api/v1/submittx
// Testnet = https://preprod.koios.rest/api/v1/submittx
const url = 'https://preprod.koios.rest/api/v1/submittx';

const serializedSignedTx = '84a..af6';

async function main() {
  const bytes = Uint8Array.from(Buffer.from(serializedSignedTx, 'hex'));
  const res = await axios.post(url, bytes, axiosConfig);
  console.log(res.data);
}

main().catch(console.error);
```

- Run the following command to execute the script:

```bash
node submitTx.js
```
