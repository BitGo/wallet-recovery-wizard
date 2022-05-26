import { AbstractUtxoCoin } from '@bitgo/abstract-utxo';
import { BaseCoin } from '@bitgo/sdk-core';
import { NetworkType } from '@bitgo/statics';
import * as Errors from 'bitgo/dist/src/errors';

export const coinConfig = {
  allCoins: {
    btc: {
      fullName: 'Bitcoin',
      supportedRecoveries: {
        test: ['tbch', 'tltc'],
        prod: ['bch', 'ltc'],
      },
      recoverP2wsh: true,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    bch: {
      fullName: 'Bitcoin Cash',
      supportedRecoveries: {
        test: ['tbtc', 'tltc'],
        prod: ['btc', 'ltc'],
      },
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
      replayableNetworks: ['bsv', 'bcha'],
    },
    bcha: {
      fullName: 'Bitcoin ABC',
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
      replayableNetworks: ['bch', 'bsv'],
    },
    bsv: {
      fullName: 'Bitcoin SV',
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
      replayableNetworks: ['bch', 'bcha'],
    },
    ltc: {
      fullName: 'Litecoin',
      supportedRecoveries: {
        test: ['tbtc', 'tbch'],
        prod: ['btc', 'bch'],
      },
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
    },
    btg: {
      fullName: 'Bitcoin Gold',
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
    },
    zec: {
      fullName: 'Zcash',
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
    },
    xrp: {
      fullName: 'Ripple',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    dash: {
      fullName: 'Dash',
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
    },
    xlm: {
      fullName: 'Stellar',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    eth: {
      fullName: 'Ethereum',
      supportedRecoveries: {
        test: ['tbtc'],
        prod: ['btc'],
      },
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Goerli)', value: 'test' },
      ],
    },
    token: {
      fullName: 'ERC20 Token',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Goerli)', value: 'test' },
      ],
    },
    trx: {
      fullName: 'Tron',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Tronex)', value: 'test' },
      ],
    },
    eos: {
      fullName: 'EOS',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    near: {
      fullName: 'NEAR Protocol',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    dot: {
      fullName: 'Polkadot',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    sol: {
      fullName: 'Solana',
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
  },
  supportedRecoveries: {
    crossChain: {
      test: ['tbtc', 'tbch', 'tltc'],
      prod: ['btc', 'bch', 'ltc'],
    },
    nonBitGo: {
      test: ['tbtc', 'teth', 'txrp', 'txlm', 'token', 'ttrx', 'teos', 'gteth', 'tnear', 'tdot', 'tsol'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos', 'near', 'dot', 'sol'],
    },
    unsignedSweep: {
      test: ['tbtc', 'txrp', 'txlm', 'teth', 'ttoken', 'ttrx', 'teos', 'gteth', 'tnear', 'tdot', 'tsol'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos', 'near', 'dot', 'sol'],
    },
    migrated: {
      test: ['tbch', 'tbsv'],
      prod: ['bch', 'btg', 'bsv'],
    },
  },
  supportKeyDerivationForDebugging: ['btc', 'bch', 'ltc', 'dash', 'zec', 'btg', 'bsv', 'bcha'],
};

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Function to check whether BlockChair API Key is needed
 * for a coin or not for recovery
 * @param {String} coin
 * @returns {Boolean}
 */
export function isBlockChairKeyNeeded(coin: string): boolean {
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
export function getDerivedXpub(baseCoin: BaseCoin, masterXpub, seed) {
  return baseCoin.deriveKeyWithSeed({ key: masterXpub, seed });
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
export async function recoverWithKeyPath(baseCoin: AbstractUtxoCoin, recoveryParams: any) {
  const userKeyPaths = ['/0/0', '/0'];

  for (const path of userKeyPaths) {
    try {
      // if we already have a recovery result, then it means the current path we try
      // is the valid user path, and we can return and exit the iteration loop
      return await baseCoin.recover(Object.assign({}, recoveryParams, path));
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

const GWEI = 10 ** 9;

/**
 * Convert Gas in Gwei unit to wei.
 * @param {number} gas in Gwei
 * @returns {number} converted to wei gas
 */
export function toWei(gas: number): number {
  return gas * GWEI;
}
