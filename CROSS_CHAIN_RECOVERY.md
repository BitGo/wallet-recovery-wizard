# Cross Chain Recovery Instructions

In a cross-chain transaction, you attempt to send funds to an address, but accidentally perform the transaction on the wrong chain.

For example, an exchange may ask you to deposit Bitcoin Cash to a Bitcoin Cash address. If you sent Bitcoin to the Bitcoin Cash address by mistake, this would be a BTC (Source Coin) -> BCH (Recovery/Destination Coin) cross-chain transaction.

Cross-chain transaction among BTC, LTC, and BCH can be recovered

## What happens in a cross-chain recovery?

Using the same BTC→BCH scenario as above, the goal is to use the private keys of the Bitcoin Cash wallet (that the user was trying to deposit into) to create a transaction on the Bitcoin Blockchain so that the funds can be recovered. Here's how it works:

1. You are asked to provide the Source Coin (the actual coin that was sent, in this case, BTC).
   
2. You are asked to provide the Recovery/Destination Coin (the coin of the wallet that you were trying to deposit into, in this case, BCH).
   
3. You are asked to provide the Wallet ID of the wallet that you tried to deposit into. (BCH), as well as the password or private key of the wallet.
   
4. You are asked to provide the Transaction ID of the cross-chain transaction (when the user sent the BTC)
   
5. You are asked to provide the Destination Address, a valid Source Coin (BTC) address to send the recovered funds to.
   
6. The SDK determines the amount of Source Coin (BTC) that can be recovered, and builds a transaction to send that amount to the Destination Address.
   
7. The SDK signs this transaction with your private key of the BCH wallet, then gives you the half-signed transaction.
   
8. You need to send the half-signed transaction to our support team, who co-signs it with the BitGo key of the wallet.
   
9. This completed transaction is a valid (BTC) transaction, and because the transaction is signed with the keys belonging to the BCH wallet, that transaction is allowed to spend from the same address.

## Important Notes

If you are trying to recover the funds from a cold wallet, then you can uncheck the 'Sign Transaction' Checkbox. On unchecking it, you will get the unsigned transaction. You need to sign this transaction with the user private key using the BitGoJS SDK or OVC and send the half signed transaction to our support team. 

Cross-chain recovery of Bitcoin Cash ABC (eCash) sent to BCH address can be done from Non-BitGo Recovery instead of Cross-Chain Recovery.