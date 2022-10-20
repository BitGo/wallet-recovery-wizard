const web3 = require('@solana/web3.js');
const { binary_to_base58, base58_to_binary } = require('base58-js');
const { exit } = require('process');
const { createInterface } = require('readline');

main();

function usage() {
  if (
    (process.argv.length !== 3 && process.argv.length !== 4) ||
    (process.argv[2] !== '-c' && process.argv[2] !== '-i') ||
    (process.argv.length === 4 &&
      process.argv[3] !== '-d' &&
      process.argv[3] !== '-m')
  ) {
    console.error('Usage: ./build-nonce-account {-c|-i} [-d|-m]');
    exit(1);
  }
}

function getUserInput(question) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    readline.question(question, data => {
      resolve(data);
      readline.close();
    });
  });
}

async function createNonceAccount(wallet) {
  const connection = new web3.Connection(
    web3.clusterApiUrl(process.argv[3] === '-m' ? 'mainnet-beta' : 'devnet'),
    'confirmed'
  );
  // Generate keypair for nonce account
  let nonceAccount = web3.Keypair.generate();

  // Get Minimum amount for rent exemption
  let minimumAmount = await connection.getMinimumBalanceForRentExemption(
    web3.NONCE_ACCOUNT_LENGTH
  );

  // create nonce account transaction
  let nonceAccountTransaction = new web3.Transaction().add(
    web3.SystemProgram.createNonceAccount({
      fromPubkey: wallet.publicKey,
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: wallet.publicKey,
      lamports: minimumAmount,
    })
  );

  await web3.sendAndConfirmTransaction(connection, nonceAccountTransaction, [
    wallet,
    nonceAccount,
  ]);

  return nonceAccount;
}

async function main() {
  usage();

  let keypair;
  if (process.argv[2] === '-c') {
    keypair = web3.Keypair.generate();
    console.log('New keypair created: ');
    console.log(`Public key: ${keypair.publicKey.toBase58()}`);
    console.log(`Secret key: ${binary_to_base58(keypair.secretKey)}`);
    console.log(
      '\x1b[32m',
      `\nSend at least .005 solana to the wallet with address ${keypair.publicKey.toBase58()}, and re-run this script with the -i option`
    );
    exit(0);
  } else {
    const input = await getUserInput(
      'Enter the secret key of your existing wallet authority: '
    );
    let secretKey;
    try {
      secretKey = new Uint8Array(JSON.parse(input));
    } catch {
      secretKey = base58_to_binary(input);
    }
    keypair = web3.Keypair.fromSecretKey(secretKey);

    const nonceAccount = await createNonceAccount(keypair);
    console.log(`\nPublic key: ${nonceAccount.publicKey.toBase58()}`);
    console.log(`Secret key: ${binary_to_base58(secretKey)}`);
    console.log(
      '\x1b[32m',
      '\nCopy and paste the above keys into the Wallet Recovery Wizard'
    );
  }
}
