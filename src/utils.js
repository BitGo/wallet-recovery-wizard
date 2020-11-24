import * as Errors from 'bitgo/dist/src/errors';

const userKeyPaths = ['/0/0', '/0'];

function withCustomKeyPath(params, userKeyPath) {
  return Object.assign({}, params, { userKeyPath });
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
      return await baseCoin.recover(withCustomKeyPath(recoveryParams, path));
    } catch (e) {
      // if this current path we try yields us no inputs to recover, we catch the
      // error and move on to the next iteration and continue trying the remaining paths
      if (e.constructor.name !== Errors.ErrorNoInputToRecover.name) {
        throw new Error(e.message);
      }
    }
  }
  // if we couldn't build a tx here, it must have been the case that there were no inputs available
  // to recover. All the other errors would have been caught and thrown already by the line:
  // if (e.constructor.name !== Errors.ErrorNoInputToRecover.name) { throw new Error(e.message);}
  throw new Errors.ErrorNoInputToRecover();
}
