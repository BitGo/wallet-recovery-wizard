# EOS Transaction Broadcast Instructions


Our tool can help you build a transaction to recover EOS, but you have to broadcast the transaction to network yourselves. 

Unfortunately, we could not find any block explorers that can assist you with broadcasting, but we have found a list of full node endpoints which you can call.

If you found that these URLs are no longer valid, you can likely find newly hosted endpoints via google search. Please also let us know so we can update these URLs.


1) Find a fullnode URL. Below are a few known 3-party API endpoints for your reference:
   
    Testnet Endpoints: https://monitor.jungletestnet.io/#apiendpoints
    
    Mainnet Endpoints: https://eos-api-list.herokuapp.com
    
    dfuse API Endpoints: https://docs.dfuse.io/eosio/public-apis/reference/network-endpoints/

    EOS Nation Endpoints: https://validate.eosnation.io/eos/reports/endpoints.html

2) Ensure that your account is powered up to broadcast transaction on the network. Refer this link to know more about EOS Power Up Model.
   https://eos.io/eos-public-blockchain/powerup-model/

   Testnet Endpoint: https://monitor.jungletestnet.io/#powerup

   Mainnet Endpoint: https://bloks.io/wallet/powerup

3) Construct your API request to the full node:
      
    API Endpoint: /v1/chain/push_transaction

    Method: POST

    Request Body format (you should find this in your downloaded JSON):

    

       { "compression": "",
        "packed_trx": "",
        "signatures": [
            "",
            ""
        ]
       }
    

## Important Note

In order to accommodate cold wallet signing time, BitGo's EOS transactions are built with an **8-hour expiration time**. The EOS network
rules require that you have to wait until **an hour before expiration** to broadcast your transaction. Broadcasting before this time would result in a failure.