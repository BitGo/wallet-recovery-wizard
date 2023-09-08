# Unsigned Consolidate Recovery Instructions

Build a file containing a list of unsigned consolidation recovery transactions to the base address using the user and backup public keys, independent of any BitGo services. The consolidation destination is automatically set to wallet base address.

## What happens during a consolidation recovery?

1. You are asked to provide the Coin Name that you want to recover.

2. You are asked to provide the User Public Key as found on your recovery KeyCard. (not needed for TSS wallets)

3. If you have a Key ID set to your User Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

4. You are asked to provide the Backup Public Key as found on your recovery KeyCard. (not needed for TSS wallets)

5. If you have a Key ID set to your Backup Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

6. You are asked to provide the BitGo Public Key as found on your recovery KeyCard.

7. You might want to specify the starting scan index which is the start index of receive address (inclusive) if you do not want to use the default value.

8. You might want to specify the ending scan index which is the end index of receive address (exclusive) if you do not want to use the default value.

9. Click Consolidate Funds button and it generates a `<coin>-unsigned-<xxx>.json` file.

10. Sign the unsigned consolidate transactions with private user key using the offline signing tool.

11. Sign the half-signed consolidate transactions with private backup key using the offline signing tool. (not needed for TRON receive addresses)

12. Submit the signed consolidate transactions to the network. (half-signed is sufficient for TRON receive addresses since it is single signature by user key)
    1. Copy the fully-signed transaction file to an internet-connected machine.
    2. Fetch the txHex field within the signed transaction file.
    3. Replace `\"` with `"` in txHex if necessary.
    4. Broadcast the transaction to a fullnode with the txHex, e.g. for Tron testnet, you can do the following:
    ```bash
    curl --location 'https://api.shasta.trongrid.io/wallet/broadcasttransaction' \
    --header 'Content-Type: application/json' \
    --data '<txHex>'
    ```

## What coins are supported for this feature so far?

Only TRON is supported for now. TRC20 tokens is not supported at the moment yet.
