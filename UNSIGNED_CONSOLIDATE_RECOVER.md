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