# Decode ETH Transaction Instructions

Wallet Recovery Wizard produces ETH transactions that EIP-1559. EIP-1559 is used to simplify Ethereum's fee market mechanism by bundling the base fee of ETH transactions with the priority fee or tip.

1. Open a terminal window, clone the repository, navigate to the cloned repository and install node modules:

```bash
git clone git@github.com:BitGo/wallet-recovery-wizard.git
cd wallet-recovery-wizard
npm i
```

2. Run the script to decode ETH EIP-1559 transactions:

```bash
npm run decode:eth-eip1559
```

3. When prompted, paste your transaction hex from your recovery JSON into the terminal and press "Enter."

4. Observe your outputted, decoded transaction
