import type { BitGoAPI } from '@bitgo/sdk-api';
import { coins, CoinFeature } from '@bitgo/statics';

const tokenParentCoins = {
  erc20 : 'eth',
  hterc20: 'eth',
  trxToken: 'trx',
  ttrxToken: 'trx',
  avaxcToken: 'avaxc',
  tavaxcToken: 'avaxc',
  arbethToken: 'arbeth',
  tarbethToken: 'arbeth',
  opethToken: 'opeth',
  topethToken: 'opeth',
  solToken: 'sol',
  tsolToken: 'sol',
  polygonToken: 'polygon',
  tpolygonToken: 'polygon',
  hbarToken: 'hbar',
  thbarToken: 'hbar',
  suiToken: 'sui',
  tsuiToken: 'sui',
  sip10Token: 'stx',
  tsip10Token: 'stx',
  txrpToken: 'xrp',
  nep141Token: 'near',
  tnep141Token: 'near',
};

const CoinFactory = () => {
  const registerCoin = async (
    coinName: string,
    sdk: BitGoAPI,
  ): Promise<void> => {

    const coinFamily = coins.has(coinName)
      ? coins.get(coinName).family
      : coinName in tokenParentCoins ? tokenParentCoins[coinName] : undefined;

    if (!coinFamily) {
      throw new Error(`Coin not found. ${coinName}`);
    }

    const baseCoin = coins.has(coinFamily) ? coins.get(coinFamily) : undefined;
    if (baseCoin?.features.includes(CoinFeature.SHARED_EVM_SDK)) {
      const { register } = await import('@bitgo/sdk-coin-evm');
      return register(coinFamily, sdk);
    }

    switch (coinFamily) {
      case 'ada': {
        const { register } = await import('@bitgo/sdk-coin-ada');
        return register(sdk);
      }
      case 'algo': {
        const { register } = await import('@bitgo/sdk-coin-algo');
        return register(sdk);
      }
      case 'atom': {
        const { register } = await import('@bitgo/sdk-coin-atom');
        return register(sdk);
      }
      case 'avaxc': {
        const { register } = await import('@bitgo/sdk-coin-avaxc');
        return register(sdk);
      }
      case 'baseeth': {
        const { EthLikeCoin, TethLikeCoin } = await import('@bitgo/sdk-coin-ethlike');
        sdk.register('baseeth', EthLikeCoin.createInstance);
        sdk.register('tbaseeth', TethLikeCoin.createInstance);
        return;
      }
      case 'bch': {
        const { register } = await import('@bitgo/sdk-coin-bch');
        return register(sdk);
      }
      case 'bcha': {
        const { register } = await import('@bitgo/sdk-coin-bcha');
        return register(sdk);
      }
      case 'bld': {
        const { register } = await import('@bitgo/sdk-coin-bld');
        return register(sdk);
      }
      case 'bsc': {
        const { register } = await import('@bitgo/sdk-coin-bsc');
        return register(sdk);
      }
      case 'bsv': {
        const { register } = await import('@bitgo/sdk-coin-bsv');
        return register(sdk);
      }
      case 'btc': {
        const { register } = await import('@bitgo/sdk-coin-btc');
        return register(sdk);
      }
      case 'btg': {
        const { register } = await import('@bitgo/sdk-coin-btg');
        return register(sdk);
      }
      case 'dash': {
        const { register } = await import('@bitgo/sdk-coin-dash');
        return register(sdk);
      }
      case 'doge': {
        const { register } = await import('@bitgo/sdk-coin-doge');
        return register(sdk);
      }
      case 'dot': {
        const { register } = await import('@bitgo/sdk-coin-dot');
        return register(sdk);
      }
      case 'eos': {
        const { register } = await import('@bitgo/sdk-coin-eos');
        return register(sdk);
      }
      case 'etc': {
        const { register } = await import('@bitgo/sdk-coin-etc');
        return register(sdk);
      }
      case 'eth': {
        const { register } = await import('@bitgo/sdk-coin-eth');
        return register(sdk);
      }
      case 'ethw': {
        const { register } = await import('@bitgo/sdk-coin-ethw');
        return register(sdk);
      }
      case 'hash': {
        const { register } = await import('@bitgo/sdk-coin-hash');
        return register(sdk);
      }
      case 'hbar': {
        const { register } = await import('@bitgo/sdk-coin-hbar');
        return register(sdk);
      }
      case 'ltc': {
        const { register } = await import('@bitgo/sdk-coin-ltc');
        return register(sdk);
      }
      case 'near': {
        const { register } = await import('@bitgo/sdk-coin-near');
        return register(sdk);
      }
      case 'polygon': {
        const { register } = await import('@bitgo/sdk-coin-polygon');
        return register(sdk);
      }
      case 'polyx': {
        const { register } = await import('@bitgo/sdk-coin-polyx');
        return register(sdk);
      }
      case 'osmo': {
        const { register } = await import('@bitgo/sdk-coin-osmo');
        return register(sdk);
      }
      case 'sei': {
        const { register } = await import('@bitgo/sdk-coin-sei');
        return register(sdk);
      }
      case 'sol': {
        const { register } = await import('@bitgo/sdk-coin-sol');
        return register(sdk);
      }
      case 'stx': {
        const { register } = await import('@bitgo/sdk-coin-stx');
        return register(sdk);
      }
      case 'sui': {
        const { register } = await import('@bitgo/sdk-coin-sui');
        return register(sdk);
      }
      case 'tao': {
        const { register } = await import('@bitgo/sdk-coin-tao');
        return register(sdk);
      }
      case 'tia': {
        const { register } = await import('@bitgo/sdk-coin-tia');
        return register(sdk);
      }
      case 'coreum': {
        const { register } = await import('@bitgo/sdk-coin-coreum');
        return register(sdk);
      }
      case 'trx': {
        const { register } = await import('@bitgo/sdk-coin-trx');
        return register(sdk);
      }
      case 'xlm': {
        const { register } = await import('@bitgo/sdk-coin-xlm');
        return register(sdk);
      }
      case 'xrp': {
        const { register } = await import('@bitgo/sdk-coin-xrp');
        return register(sdk);
      }
      case 'zec': {
        const { register } = await import('@bitgo/sdk-coin-zec');
        return register(sdk);
      }
      case 'zeta': {
        const { register } = await import('@bitgo/sdk-coin-zeta');
        return register(sdk);
      }
      case 'injective': {
        const { register } = await import('@bitgo/sdk-coin-injective');
        return register(sdk);
      }
      case 'baby': {
        const { register } = await import('@bitgo/sdk-coin-baby');
        return register(sdk);
      }
      case 'cronos': {
        const { register } = await import('@bitgo/sdk-coin-cronos');
        return register(sdk);
      }
      case 'asi': {
        const { register } = await import('@bitgo/sdk-coin-asi');
        return register(sdk);
      }
      case 'initia': {
        const { register } = await import('@bitgo/sdk-coin-initia');
        return register(sdk);
      }
      case 'opeth': {
        const { register } = await import('@bitgo/sdk-coin-opeth');
        return register(sdk);
      }
      case 'arbeth': {
        const { register } = await import('@bitgo/sdk-coin-arbeth');
        return register(sdk);
      }
      case 'thor': {
        const { register } = await import('@bitgo/sdk-coin-rune');
        return register(sdk);
      }
      case 'coredao': {
        const { register } = await import('@bitgo/sdk-coin-coredao');
        return register(sdk);
      }
      case 'oas': {
        const { register } = await import('@bitgo/sdk-coin-oas');
        return register(sdk);
      }
      case 'icp': {
        const { register } = await import('@bitgo/sdk-coin-icp');
        return register(sdk);
      }
      case 'flr': {
        const { register } = await import('@bitgo/sdk-coin-flr');
        return register(sdk);
      }
      case 'sgb': {
        const { register } = await import('@bitgo/sdk-coin-sgb');
        return register(sdk);
      }
      case 'wemix': {
        const { register } = await import('@bitgo/sdk-coin-wemix');
        return register(sdk);
      }
      case 'xdc': {
        const { register } = await import('@bitgo/sdk-coin-xdc');
        return register(sdk);
      }
      case 'soneium': {
        const { register } = await import('@bitgo/sdk-coin-soneium');
        return register(sdk);
      }
      default: {
        throw new Error(`Unsupported Coin. ${coinName}`);
      }
    }
  };

  return {
    registerCoin,
  };
};

const coinFactory = CoinFactory();

export default coinFactory;
