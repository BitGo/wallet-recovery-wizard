// ================================ Use Node 8 ================================
// Have these packages available if running the script
const ethUtil = require('ethereumjs-util');
const ethAbi = require('ethereumjs-abi');
const EthTx = require('ethereumjs-tx');
const bitcoin = require('bitcoinjs-lib');
const prova = require('prova-lib');
const sjcl = require('sjcl');
window.sjcl = sjcl;
const request = require('request-promise');

////////////////////////////////////////////////////////////////////////////////
// NOTE: The account at the backupKeyAddress calculated on line 57 pays the   //
// gas for this tx. It must be funded with at least 0.02 ETH for this tool    //
// to work. You can run the tool once to get the address, fund it, and then   //
// run the tool again to successfully build the recovery tx.                  //
////////////////////////////////////////////////////////////////////////////////

// This signature will be valid for 1 week
const EXPIRETIME_DEFAULT = Math.floor((new Date().getTime()) / 1000) + (60 * 60 * 24 * 7);

// Set new eth tx fees (using default config values from platform)
const gasPrice = new ethUtil.BN('20000000000');
const gasLimit = new ethUtil.BN('500000');

// Call the function to recover
// console.log('Doing recovery....');
// recoverEth();

const b = `{"iv":"nwrarfMhWKpxAzi6cP01Gg==","v":1,"iter":10000,"ks":256,"ts":64,"mode"
:"ccm","adata":"","cipher":"aes","salt":"GNxoO+OeaDA=","ct":"jekipq4V+uJS2q
boLRo5r+kT6VajHsRP33dMcJWdBBeOYy8VhyXJxVmpcu2GJe9/S9sbxo3J982im7fq+E2CEDQj/
j3XD1YkPucZY5RH27Om/soI96QI5dtMK3jj+HNiwWXcKT1fupCWXCW0541ywkYZeCp0+6c="}`;

async function recoverEth({ boxAValue, boxBValue, walletContractAddress, walletPassphrase, recoveryAddress }) {
  // Decrypt private keys from KeyCard values
  const userPrv = sjcl.decrypt(walletPassphrase, boxAValue);
  // const userHDNode = prova.HDNode.fromBase58(userPrv);

  // Decrypt backup private key and get address
  const backupPrv = sjcl.decrypt(walletPassphrase, boxBValue);
  const backupHDNode = prova.HDNode.fromBase58(backupPrv);
  const backupSigningKey = backupHDNode.getKey().getPrivateKeyBuffer();
  const backupKeyAddress = `0x${ethUtil.privateToAddress(backupSigningKey).toString('hex')}`;

  // Get nonce for backup key (should be 0)
  let backupKeyNonce = 0;
  const { result: backupKeyTxList } = await request.get(`https://kovan.etherscan.io/api?module=account&action=txlist&address=${backupKeyAddress}`).json();
  if (backupKeyTxList.length > 0) {
    backupKeyNonce = parseInt(backupKeyTxList[backupKeyTxList.length - 1].nonce, 10) + 1;
  }

  // get balance of wallet and deduct fees to get transaction amount
  let { result: backupKeyBalance } = await request.get(`https://kovan.etherscan.io/api?module=account&action=balance&address=${backupKeyAddress}`).json();
  backupKeyBalance = new ethUtil.BN(backupKeyBalance, 10);

  if (backupKeyBalance.lt(gasPrice.mul(gasLimit))) {
    throw new Error(`Backup key address ${backupKeyAddress} has balance ${backupKeyBalance.toString(10)}. This address must have a balance of at least 0.01 ETH to perform recoveries`);
  }

  // get balance of wallet and deduct fees to get transaction amount
  const { result: balance } = await request.get(`https://kovan.etherscan.io/api?module=account&action=balance&address=${walletContractAddress}`).json();
  const txAmount = new ethUtil.BN(balance, 10).toString(10);

  // build recipients object
  const recipients = [{
    address: recoveryAddress,
    amount: txAmount
  }];

  // Get sequence ID using contract call
  const sequenceIdMethodSignature = ethAbi.methodID('getNextSequenceId', []);
  const sequenceIdArgs = ethAbi.rawEncode([], []);
  const sequenceIdData = Buffer.concat([sequenceIdMethodSignature, sequenceIdArgs]).toString('hex');
  const { result: sequenceIdHex } = await request.get(`https://kovan.etherscan.io/api?module=proxy&action=eth_call&to=${walletContractAddress}&data=${sequenceIdData}&tag=latest`).json();
  const sequenceId = new ethUtil.BN(sequenceIdHex.slice(2), 16).toNumber();

  // Get operation hash and sign it
  const operationHash = getOperationSha3ForExecuteAndConfirm(recipients, EXPIRETIME_DEFAULT, sequenceId);
  const signature = ethSignMsgHash(operationHash, xprvToEthPrivateKey(userPrv));

  try {
    ecRecoverEthAddress(operationHash, signature);
  } catch (e) {
    throw new Error('Invalid signature');
  }

  const txInfo = {
    recipient: recipients[0],
    expireTime: EXPIRETIME_DEFAULT,
    contractSequenceId: sequenceId,
    operationHash: operationHash,
    signature: signature,
    gasLimit: gasLimit.toString(10)
  };

  // calculate send data
  const sendMethodArgs = getSendMethodArgs(txInfo);
  const methodSignature = ethAbi.methodID('sendMultiSig', pluck(sendMethodArgs, 'type'));
  const encodedArgs = ethAbi.rawEncode(pluck(sendMethodArgs, 'type'), pluck(sendMethodArgs, 'value'));
  const sendData = Buffer.concat([methodSignature, encodedArgs]);

  // Build contract call and sign it
  const tx = new EthTx({
    to: walletContractAddress,
    nonce: backupKeyNonce,
    value: 0,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    data: sendData,
    spendAmount: txAmount
  });

  tx.sign(backupSigningKey);

  const signedTx = {
    id: ethUtil.bufferToHex(tx.hash(true)),
    tx: tx.serialize().toString('hex')
  };

  console.log('Fully signed:');
  console.log(signedTx);

  return signedTx;

  // const sendResult = await request.get(`https://kovan.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${signedTx.tx}`).json();

  // return sendResult;
}

function getOperationSha3ForExecuteAndConfirm(recipients, expireTime, contractSequenceId) {
  if (!recipients || !Array.isArray(recipients)) {
    throw new Error('expecting array of recipients');
  }

  // Right now we only support 1 recipient
  if (recipients.length !== 1) {
    throw new Error('must send to exactly 1 recipient');
  }

  // Check inputs
  recipients.forEach((recipient) => {
    if (!ethUtil.isValidAddress(ethUtil.addHexPrefix(recipient.address))) {
      throw new Error('Invalid address: ' + recipient.address);
    }
  });

  const recipient = recipients[0];
  const operation = getOperation(recipient, expireTime, contractSequenceId);

  return ethUtil.bufferToHex(ethAbi.soliditySHA3(operation[0], operation[1]));
}

function getOperation(recipient, expireTime, contractSequenceId) {
  return [
    ['string', 'address', 'uint', 'string', 'uint', 'uint'],
    [
      'ETHER',
      new ethUtil.BN(ethUtil.stripHexPrefix(recipient.address), 16),
      recipient.amount,
      ethUtil.stripHexPrefix(recipient.data) || '',
      expireTime,
      contractSequenceId
    ]
  ];
}

function ethSignMsgHash(msgHash, privKey) {
  const signatureInParts = ethUtil.ecsign(new Buffer(ethUtil.stripHexPrefix(msgHash), 'hex'), new Buffer(privKey, 'hex'));

  // Assemble strings from r, s and v
  const r = ethUtil.setLengthLeft(signatureInParts.r, 32).toString('hex');
  const s = ethUtil.setLengthLeft(signatureInParts.s, 32).toString('hex');
  const v = ethUtil.stripHexPrefix(ethUtil.intToHex(signatureInParts.v));

  // Concatenate the r, s and v parts to make the signature string
  return ethUtil.addHexPrefix(r.concat(s, v));
}

function xprvToEthPrivateKey(xprv) {
  const hdNode = bitcoin.HDNode.fromBase58(xprv);
  const ethPrivateKey = hdNode.keyPair.d.toBuffer();
  return ethUtil.setLengthLeft(ethPrivateKey, 32).toString('hex');
}

function ecRecoverEthAddress(msgHash, signature) {
  msgHash = ethUtil.stripHexPrefix(msgHash);
  signature = ethUtil.stripHexPrefix(signature);

  const v = parseInt(signature.slice(128, 130), 16);
  const r = new Buffer(signature.slice(0, 64), 'hex');
  const s = new Buffer(signature.slice(64, 128), 'hex');

  const pubKey = ethUtil.ecrecover(new Buffer(msgHash, 'hex'), v, r, s);
  return ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey));
};

function getSendMethodArgs(parsedInfo) {
  // Method signature is
  // sendMultiSig(address toAddress, uint value, bytes data, uint expireTime, uint sequenceId, bytes signature)
  return [
    {
      name: 'toAddress',
      type: 'address',
      value: parsedInfo.recipient.address
    },
    {
      name: 'value',
      type: 'uint',
      value: parsedInfo.recipient.amount
    },
    {
      name: 'data',
      type: 'bytes',
      value: ethUtil.toBuffer(parsedInfo.recipient.data || '')
    },
    {
      name: 'expireTime',
      type: 'uint',
      value: parsedInfo.expireTime
    },
    {
      name: 'sequenceId',
      type: 'uint',
      value: parsedInfo.contractSequenceId
    },
    {
      name: 'signature',
      type: 'bytes',
      value: ethUtil.toBuffer(parsedInfo.signature)
    }
  ];
};

function pluck(obj, prop) {
  return obj.map((val) => val[prop]);
}

// process.on('unhandledRejection', (err) => {
//   console.error('error')
//   console.error(err.message);
//   console.error(err.stack);
// });

export default recoverEth;