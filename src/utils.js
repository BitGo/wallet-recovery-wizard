import { ErrorNoInputToRecover } from 'bitgo';

import * as utxolib from '@bitgo/utxo-lib';
import coinConfig from './constants/coin-config';

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

function sanitizeKeys(keys) {
  return keys.map((k) => {
    if (k.constructor.name !== utxolib.HDNode.name) {
      throw new Error(`unexpected key`);
    }
    return k.neutered().toBase58();
  });
}

/**
 * Function to check whether BlockChair API Key is needed
 * for a coin or not for recovery
 * @param {String} coin
 * @returns {Boolean}
 */
export function isBlockChairKeyNeeded(coin) {
  if (
    coin === 'bsv' ||
    coin === 'bch' ||
    coin === 'bcha' ||
    coin === 'ltc' ||
    coin === 'btg' ||
    coin === 'zec' ||
    coin === 'dash'
  ) {
    return true;
  }
  return false;
}

/**
 * Converts a master xpub to the corresponding derived xpub
 * @param {BitGo} baseCoin 
 * @param {string} masterXpub 
 * @param {string} seed 
 */
export function getDerivedXpub(baseCoin, masterXpub, seed) {
  return baseCoin.deriveKeyWithSeed({ key: masterXpub, seed });
}

export async function getRecoveryDebugInfo(baseCoin, recoveryParams) {
  if (!coinConfig.supportKeyDerivationForDebugging.includes(baseCoin.getFamily())) {
    return new Error('unsupported coin');
  }

  return {
    // TODO include derive pubkeys
    publicKeys: sanitizeKeys(await baseCoin.initiateRecovery(recoveryParams)),
  };
}

/**
 * Call the recover() function with recoveryParams, and try multiple key paths for the user key
 * @param {Object} baseCoin
 * @param {Object} recoveryParams
 * - backupKey: [encrypted] xprv, or xpub if the xprv is held by a KRS provider
 * - walletPassphrase: necessary if one of the xprvs is encrypted
 * - bitgoKey: xpub
 * - krsProvider: necessary if backup key is held by KRS
 * - recoveryDestination: target address to send recovered funds to
 * - scan: the amount of consecutive addresses without unspents to scan through before stopping
 * - ignoreAddressTypes: (optional) array of AddressTypes to ignore, these are strings defined in Codes.UnspentTypeTcomb
 *        for example: ['p2shP2wsh', 'p2wsh'] will prevent code from checking for wrapped-segwit and native-segwit chains on the public block explorers
 */
export async function recoverWithKeyPath(baseCoin, recoveryParams) {
  const userKeyPaths = ['/0/0', '/0'];

  for (const path of userKeyPaths) {
    try {
      // if we already have a recovery result, then it means the current path we try
      // is the valid user path, and we can return and exit the iteration loop
      return await baseCoin.recover(Object.assign({}, recoveryParams, path));
    } catch (e) {
      // if this current path we try yields us no inputs to recover, we catch the
      // error and move on to the next iteration and continue trying the remaining paths
      if (e.constructor.name !== ErrorNoInputToRecover.name) {
        throw new Error(e.message);
      }
    }
  }
  // if we couldn't build a tx here, it must have been the case that there were no inputs available
  // to recover. All the other errors would have been caught and thrown already by the line:
  // if (e.constructor.name !== Errors.ErrorNoInputToRecover.name) { throw new Error(e.message);}
  throw new ErrorNoInputToRecover();
}

const GWEI = 10 ** 9;

/**
 * Convert Gas in Gwei unit to wei.
 * @param {number} gas in Gwei
 * @returns {number} converted to wei gas
 */
export function toWei(gas) {
  return gas * GWEI;
}
