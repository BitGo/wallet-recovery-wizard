# Unsigned Consolidate Recovery Instructions

Build a file containing a list of unsigned consolidation recovery transactions to the wallet base address, independent of any BitGo services. The consolidation destination is automatically set to the wallet base address.

## What happens during a consolidation recovery?

1. You are asked to provide the **Coin Name** that you want to recover.

2. You are asked to provide the **User Public Key** as found on your recovery KeyCard.
   - For ECDSA coins (ADA, DOT, TAO, SUI): Optional
   - For TRON coins: Required

3. If you have a **Key ID** set to your User Key, it will be displayed on your KeyCard. Provide the Key ID only if it appears on your KeyCard (TRON only).

4. You are asked to provide the **Backup Public Key** as found on your recovery KeyCard.
   - For ECDSA coins (ADA, DOT, TAO, SUI): Optional  
   - For TRON coins: Required

5. If you have a **Key ID** set to your Backup Key, it will be displayed on your KeyCard. Provide the Key ID only if it appears on your KeyCard (TRON only).

6. You are asked to provide the **BitGo Public Key** as found on your recovery KeyCard (required for all coins).

7. For **Solana (SOL)** only: You must provide **Durable Nonces** information:
   - Durable Nonce Public Keys (comma-separated list)
   - Durable Nonce Secret Key

8. You can optionally specify the **starting scan index** (start index of receive addresses, inclusive). Default: 1

9. You can optionally specify the **ending scan index** (end index of receive addresses, exclusive). Default: 21

10. Click **Consolidate Funds** button to generate a `<coin>-unsigned-consolidation-<timestamp>.json` file.

11. **Sign the transactions offline:**
    - Sign the unsigned consolidate transactions with your private user key using the offline signing tool.
    - Sign the half-signed consolidate transactions with your private backup key using the offline signing tool.
    - **Note for TRON:** Only user key signature is required (single signature).

12. **Broadcast the signed transactions:**
    - Copy the fully-signed (or half-signed for TRON) transaction file to an internet-connected machine.
    - Use the appropriate broadcast method for your coin.
    - **For Cardano (ADA / TADA):** See the [Cardano broadcast instructions](#cardano-ada--tada) section below.

## What coins are supported?

### Production Environment
- **TRON (TRX)** and TRC20 tokens
- **Cardano (ADA)**
- **Polkadot (DOT)**
- **Bittensor (TAO)**
- **Solana (SOL)** and SPL tokens
- **Sui (SUI)** and Sui tokens

### Test Environment
- **Test TRON (TTRX)** and test TRC20 tokens
- **Test Cardano (TADA)**
- **Test Polkadot (TDOT)**
- **Test Bittensor (TTAO)**
- **Test Solana (TSOL)** and test SPL tokens
- **Test Sui (TSUI)** and test Sui tokens

---

## Cardano (ADA / TADA)

### Supported assets

- **ADA** (mainnet) and **TADA** (Preprod testnet)
- Native tokens (e.g. fungible tokens on the Cardano blockchain)

When a receive address holds native tokens alongside ADA, the consolidation transaction for that address produces **two outputs**:
- Token output: root address + tokens + 1.5 ADA (minimum UTXO requirement)
- ADA remainder: root address + remaining ADA after fee

### Signing with OVC (6-step EdDSA)

Cardano uses **EdDSA (Ed25519)**, so signing takes **6 steps** in OVC.

> **Important:** Select **Sign TSS Recoveries** in OVC — not "Sign Transactions" or "Sign TSS Transactions".

| Step | OVC role   | Action |
|------|------------|--------|
| 1    | User OVC   | Upload unsigned consolidation file → download share file |
| 2    | Backup OVC | Upload user share → download backup share |
| 3    | User OVC   | Upload backup share → download user signature share |
| 4    | Backup OVC | Upload user signature share → download backup signature share |
| 5    | User OVC   | Upload backup signature share → download final signed file |
| 6    | —          | Broadcast each transaction in the signed file |

### Multiple transactions per file

WRW produces **one unsigned transaction per funded receive address**. If two addresses have funds, the signed file will contain two `signatureShares` entries. You must **broadcast each transaction separately** — they are independent on-chain transactions.

### Broadcast using `broadcast_ada.py`

`broadcast_ada.py` (included in this repository) assembles and submits all transactions in the signed file automatically, in order.

**Requirements:**
```bash
pip install cbor2
```

**Broadcast to testnet (TADA / Preprod):**
```bash
python3 broadcast_ada.py path/to/SIGNED-ovc-signed-part-6-of-6-<timestamp>.json
```

**Broadcast to mainnet (ADA):**
```bash
python3 broadcast_ada.py path/to/SIGNED-ovc-signed-part-6-of-6-<timestamp>.json --network mainnet
```

**Dry run (inspect assembled CBOR without broadcasting):**
```bash
python3 broadcast_ada.py path/to/SIGNED-ovc-signed-part-6-of-6-<timestamp>.json --dry-run
```

The script iterates over every `signatureShares` entry, prints the transaction details, broadcasts each one, and prints the Cardanoscan explorer link for each successful submission.