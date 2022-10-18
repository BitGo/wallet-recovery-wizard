const { binary_to_base58, base58_to_binary } = require('base58-js');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

main();

function main() {
  readline.question(
    'Enter the keypair byte array from your durable nonce JSON: ',
    data => {
      const keypair_bytes = new JSON.parse(data);
      const public_key_bytes = keypair_bytes.slice(32);
      const private_key_bytes = keypair_bytes.slice(0, 32);

      console.log(
        base58_to_binary(
          '447272d65cc8b39f88ea23b5f16859bd84b3ecfd6176ef99535efab37541c83b051a34bc8acd438763976f96876115050f73828553566d111d7ac8bffebf587c'
        )
      );

      //console.log(`Keypair: ${binary_to_base58(keypair_bytes)}`);
      console.log(`Public key: ${binary_to_base58(public_key_bytes)}`);
      //console.log(`Private key: ${binary_to_base58(private_key_bytes)}`);

      readline.close();
    }
  );
}
