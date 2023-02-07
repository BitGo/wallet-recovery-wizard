# Unsigned Sweep Recovery Instructions

Build an unsigned transaction from a cold wallet using the user and backup public keys, independent of any BitGo services.

## What happens in an unsigned sweep recovery?

1.  You are asked to provide the Coin Name that you want to recover.

2.  You are asked to provide the User Public Key as found on your recovery KeyCard.

3.  If you have a Key ID set to your User Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

4.  You are asked to provide the Backup Public Key as found on your recovery KeyCard.

5.  If you have a Key ID set to your Backup Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

6.  The next field will be different based on coin type

    1. For UTXO based coins, you are asked to provide the BitGo Public Key as found on your recovery KeyCard.

    2. For Coins like Stellar, Ripple, and EOS, Root Address of the wallet needs to be provided.

    3. For Ethereum, Ethereum Proof of Work, ERC20 Token, and Avalanche C-Chain, Wallet Contract Address needs to be provided. This is the ETH or AVAXC address of the wallet contract. This is also the wallet's base address.
       For ERC20 Token, Token Contract Address needs to be provided. This is the address of the smart contract of the token to recover. This is unique to each token and is NOT your wallet address

7.  You are asked to provide the Destination Address (The address where you want to receive your recovered funds).

8.  For UTXO based coins like Bitcoin, Litecoin, Dash, Zcash, Bitcoin Gold, Tron, and Bitcoin Cash, Address Scanning Factor needs to be provided. By default, it's value is 20 and can be changed if needed. The tool scans the addresses of the wallet to find the unspents. If it doesn't find unspents in 20 consecutive addresses, then it will stop scanning and generate a recovery transaction. For eg: If your funds are stuck in addresses with indices 10, 25 and 50 and you keep scanning factor as 20. Then the tool will stop after scanning till 46th index, because it didn't find unspents for 20 consecutive addresses from 26th address onwards. So in order to recover the funds in the address with 50th index, you will have to increase the scanning factor to a higher value.

9.  For Ethereum, Ethereum Proof of Work, and ERC20 Token, Max Fee Per Gas Price and Max Priority Fee Per Gas in Gwei needs to be provided. The value should be between 1 Gwei and 2500 Gwei. The default is 20 Gwei for Max Fee Per Gas and 10 Gwei for Max Priority Fee Per Gas. If there is not enough Gwei in the backup key address gas tank, you will need to fund your backup key address. WRW will report the backup key address if there is not enough Gwei in it.

10. For Ethereum, Ethereum Proof of Work, ERC20 Token, and Avalanche C-Chain, Gas Limit needs to be provided. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas.

11. For Avalanche C-Chain, Gas Price needs to be provided. The value should be between 1 Gwei and 2500 Gwei. The default is 30 Gwei.

12. An API Key token from etherscan.com needs to be provided for certain recoveries.

13. For UTXO based coins like Bitcoin, Litecoin, Dash, Zcash, Bitcoin Gold, and Bitcoin Cash, the key is from https://blockchair.com/.

14. For Ethereum and ERC20 token, the key is from https://etherscan.io/.

15. For Avalanche C-Chain, the key is from https://snowtrace.io/.

16. The SDK determines the amount of Coin that can be recovered, and builds an unsigned transaction to send that amount to the Destination Address.

17. You need to half sign this unsigned transaction with your user private key using Offline Vault Console.

18. You need to fully sign the half signed transaction with your backup private key using Offline Vault Console.

19. This completed transaction can be broadcasted on the network using a blockchain explorer to finish the recovery.
    Some blockchain explorers to broadcast the transaction are as follows:

    Avalanche C-Chain transactions: https://snowtrace.io/pushTx

    Blockchair (Supports multiple coins): https://blockchair.com/broadcast

    Bitcoin Gold transactions: https://btgexplorer.com/sendtx

    EOS transactions: [EOS.md](EOS.md)

    Ethereum and ERC20 Token transactions: https://etherscan.io/pushTx

    Ethereum Proof of Work transactions (deprecated): [ETHW.md](ETHW.md)

    Near transactions: [NEAR.md](NEAR.md)

    Ripple transactions: https://bithomp.com/submit/

    Stellar transactions: https://laboratory.stellar.org/#txsubmitter?network=public

    Tron transactions: https://www.btcschools.net/tron/tron_broadcast_tx.php
