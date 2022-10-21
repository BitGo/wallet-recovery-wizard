const web3 = require('@solana/web3.js');
const { binary_to_base58, base58_to_binary } = require('base58-js');
const { createInterface } = require('readline');
const { program, Option } = require('commander');

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(question) {
  return new Promise(resolve => {
    readline.question(question, data => {
      readline.close();
      resolve(data);
    });
  });
}

async function createNonceAccount(wallet, network) {
  const connection = new web3.Connection(
    web3.clusterApiUrl(network),
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

function getSecretKeyFromInput(input) {
  try {
    return new Uint8Array(JSON.parse(input));
  } catch {
    return base58_to_binary(input);
  }
}

async function handleImport({ network }) {
  const input = await question(
    'Enter the secret key of your existing wallet authority: '
  );
  const secretKey = getSecretKeyFromInput(input);
  keypair = web3.Keypair.fromSecretKey(secretKey);

  const nonceAccount = await createNonceAccount(keypair, network);
  console.log(`\nPublic key: ${nonceAccount.publicKey.toBase58()}`);
  console.log(`Secret key: ${binary_to_base58(secretKey)}`);
  console.log(
    '\x1b[32m',
    '\nCopy and paste the above keys into the Wallet Recovery Wizard'
  );
}

function handleCreate() {
  keypair = web3.Keypair.generate();
  console.log('New keypair created: ');
  console.log(`Public key: ${keypair.publicKey.toBase58()}`);
  console.log(`Secret key: ${binary_to_base58(keypair.secretKey)}`);
  console.log(
    '\x1b[32m',
    `\nSend at least .005 solana to the wallet with address ${keypair.publicKey.toBase58()}, and re-run this script with the -i option`
  );
}

function defineCommands() {
  program
    .command('create')
    .description('create a new solana keypair')
    .showHelpAfterError()
    .action(handleCreate);

  program
    .command('import')
    .description('import an existing solana keypair')
    .showHelpAfterError()
    .addOption(
      new Option(
        '-n, --network <solana-network>',
        'network for nonce account creation'
      )
        .choices(['devnet', 'mainnet-beta'])
        .makeOptionMandatory()
    )
    .action(handleImport);
}

async function main() {
  defineCommands();
  await program.parseAsync(process.argv);
  process.exit(0);
}

main();
