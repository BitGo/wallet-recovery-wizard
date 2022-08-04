//names of params can be found in: src/components/non-bitgo-recoveries-form/utils.ts

const btcInfo = {
   userKey: '{"iv":"ABCjPSQt4fpVuzEfA/a9KQ==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"PKjptPS6taM=","ct":"lF8N2yDj9A5dN1ICVGulXTxGGY1sGpQqKjwxyQxLvhUhdHgbWBUx5w2hOwGZi46MMD/9D2hg7k+KwxHzHZQjt+Y3c2YyNcFhH5zbwUxQsnLe0hm4/yxlM+yO2VDrV8pcC2qkSQom1O9cEKAMNtaHqtesip9HzWY="}',
   backupKey:  '{"iv":"ACXLO78RpIFar6OHIe4Xxw==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"PFjmeBo6o9s=","ct":"HsIqxXii3Dk/HuMZvKm1jsiTWsZXLF9LSq2GEwf1/gEJGzXHprhXeC8Z/+vu6Pj9wkWA/IH6EBxr5wsRAk3b4LRhH4F8Ni6Lz1IP9WKmP71kY3Ke6TWuzg3vWk0DftBJsU6sWAlt1CvyMrtr004AqDesv3dYDNs="}',
   bitgoKey:  'xpub661MyMwAqRbcFzDgeGRDSNq6xnWzBcpTRCy3veYECF1fqsqqpj25dkNoWEDH8EB1VRAEqVyR76DtEYSBts6ojhvikNTjdn9mtJtTvv5fMyu',
   walletPassphrase: 'testbtgo0727',
   recoveryDestination: '2MwzJvshTbgLAY9Rf1bYeQVQkCCh2j6a9HV'
}

const ethInfo = {
   apiKey: 'PXCV9Q2J9QJTFW54CSVKPS81RDYGMZ9F34',
   userKey: '{"iv":"R0gXOBnmhJFkOpD01Bm7hw==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"Ms5/nPb5mSI=","ct":"18l79KnfwjR1FIOxJoDMVauWjjo7omi8kZp8sCro4LQZE0eUwgGieeTUihTf+5x960UHe8qB/u1VZLNV5n/diSc9p9nLVeEVt/gMCRdAFp6pGXXfHNAIgJp8BoDPHcXI/x810V7YNzHcxO7uS0bkW6VocIV9jD8="}',
   backupKey: '{"iv":"xEMvho9o+mspRmbLX3F5jg==","v":1,"iter":10000,"ks":256,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"yZMfYdfAClE=","ct":"1SZs8vjzW3PUc196Xe/Mr1dC0GhQPe/aGpDXgsxPhDlEbZWFST+A+Xd4MfU+5NQIJtsBI4kbl0pmwzsIoZa07bzyIZyYJEgAQ837s/3LjFgqwZCz2J3uOmA6FGexbAabK0BvA3HdT9mSXwCdJxftchsQ/CVuD2E="}',
   walletContractAddress: '0x63ce12029d69762a79ac65bf55663180f4d877f9',
   walletPassphrase: 'testbtgo0727',
   recoveryDestination: '0xc2bfa4675a298a038cf23f2e8e9a7ce0fc89ea81',
}

module.exports = {
   btcInfo, ethInfo
}