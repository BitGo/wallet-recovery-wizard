# Unsigned Sweep Recovery Instructions

Build an unsigned transaction from a cold wallet using the user and backup public keys, independent of any BitGo services.

## What happens in an unsigned sweep recovery?

1.  You are asked to provide the Coin Name that you want to recover.

2.  You are asked to provide the Environment (Testnet/Mainnet).

3.  You are asked to provide the User Public Key as found on your recovery KeyCard.

4.  If you have a Key ID set to your User Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

5.  You are asked to provide the Backup Public Key as found on your recovery KeyCard.

6.  If you have a Key ID set to your Backup Key, it will be displayed on your KeyCard. You are supposed to provide the Key ID only if you have it on your KeyCard.

7.  The next field will be different based on coin type

    1. For UTXO based coins, you are asked to provide the BitGo Public Key as found on your recovery KeyCard.

    2. For Coins like Stellar, Ripple, and EOS, Root Address of the wallet needs to be provided.

    3. For Ethereum and ERC20 Token, Wallet Contract Address needs to be provided. This is the Eth address of the wallet contract. This is also the wallet's base address.
       For ERC20 Token, Token Contract Address needs to be provided. This is the address of the smart contract of the token to recover. This is unique to each token and is NOT your wallet address
       
8.  You are asked to provide the Destination Address (The address where you want to receive your recovered funds).

9.  For UTXO based coins like Bitcoin, Litecoin, Dash, Zcash, Bitcoin Gold, Tron, Bitcoin Cash, Bitcoin SV, Bitcoin ABC (eCash)Address Scanning Factor needs to be provided. By default, it's value is 20 and can be changed if needed. The tool scans the addresses of the wallet to find the unspents. If it doesn't find unspents in 20 consecutive addresses, then it will stop scanning and generate a recovery transaction. For eg: If your funds are stuck in addresses with indices 10, 25 and 50 and you keep scanning factor as 20. Then the tool will stop after scanning till 46th index, because it didn't find unspents for 20 consecutive addresses from 26th address onwards. So in order to recover the funds in the address with 50th index, you will have to increase the scanning factor to a higher value.

10. For Ethereum and ERC20 Token, Max Fee Per Gas Price and Max Priority Fee Per Gas in Gwei needs to be provided. The value should be between 1 Gwei and 2500 Gwei. The default is 20 Gwei for Max Fee Per Gas and 10 Gwei for Max Priority Fee Per Gas. If there is not enough Gwei in the backup key address gas tank, you will need to fund your backup key address. WRW will report the backup key address if there is not enough Gwei in it.

11. For Ethereum and ERC20 Token, Gas Limit needs to be provided. The value should be between 30,000 and 20,000,000. The default is 500,000 units of gas.

12. An API Key token from etherscan.com needs to be provided for Ethereum recoveries.

13. The SDK determines the amount of Coin that can be recovered, and builds an unsigned transaction to send that amount to the Destination Address.

14. You need to half sign this unsigned transaction with your user private key using Offline Vault Console.

15. You need to fully sign the half signed transaction with your backup private key using Offline Vault Console.

16. This completed transaction can be broadcasted on the network using a blockchain explorer to finish the recovery.
    Some blockchain explorers to broadcast the transaction are as follows:

    Blockchair (Supports multiple coins): https://blockchair.com/broadcast

    Bitcoin Gold transactions: https://btgexplorer.com/sendtx

    EOS transactions: [EOS.md](EOS.md)

    Ripple transactions: https://bithomp.com/submit/

    Stellar transactions: https://laboratory.stellar.org/#txsubmitter?network=public

    Tron transactions: https://www.btcschools.net/tron/tron_broadcast_tx.php
