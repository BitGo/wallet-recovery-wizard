import { CryptocurrencyIconProps } from '~/components';
import { BitgoEnv } from '.';

export type CoinMetadata = {
  Title: string;
  Description: string;
  value: string;
  Icon: CryptocurrencyIconProps['Name'];
};

export const allCoinMetas = {
  btc: {
    Title: 'BTC',
    Description: 'Bitcoin',
    Icon: 'btc',
    value: 'btc',
  },
  bch: {
    Title: 'BCH',
    Description: 'Bitcoin Cash',
    Icon: 'bch',
    value: 'bch',
  },
  ltc: {
    Title: 'LTC',
    Description: 'Litecoin',
    Icon: 'ltc',
    value: 'ltc',
  },
  xrp: {
    Title: 'XRP',
    Description: 'Ripple',
    Icon: 'xrp',
    value: 'xrp',
  },
  xlm: {
    Title: 'XLM',
    Description: 'Stellar',
    Icon: 'xlm',
    value: 'xlm',
  },
  dash: {
    Title: 'DASH',
    Description: 'Dash',
    Icon: 'dash',
    value: 'dash',
  },
  zec: {
    Title: 'ZEC',
    Description: 'ZCash',
    Icon: 'zec',
    value: 'zec',
  },
  btg: {
    Title: 'BTG',
    Description: 'Bitcoin Gold',
    Icon: 'btg',
    value: 'btg',
  },
  eth: {
    Title: 'ETH',
    Description: 'Ethereum',
    Icon: 'eth',
    value: 'eth',
  },
  ethw: {
    Title: 'ETHw',
    Description: 'Ethereum PoW',
    Icon: 'eth',
    value: 'ethw',
  },
  erc20: {
    Title: 'ERC',
    Description: 'ERC20 Token',
    Icon: 'eth',
    value: 'erc20',
  },
  trx: {
    Title: 'TRX',
    Description: 'Tron',
    Icon: 'trx',
    value: 'trx',
  },
  eos: {
    Title: 'EOS',
    Description: 'Eos',
    Icon: 'eos',
    value: 'eos',
  },
  avaxc: {
    Title: 'AVAXC',
    Description: 'Avalanche C-Chain',
    Icon: 'avax',
    value: 'avaxc',
  },
  near: {
    Title: 'NEAR',
    Description: 'Near',
    Icon: 'near',
    value: 'near',
  },
  dot: {
    Title: 'DOT',
    Description: 'Polkadot',
    Icon: 'dot',
    value: 'dot',
  },
  sol: {
    Title: 'SOL',
    Description: 'Solana',
    Icon: 'sol',
    value: 'sol',
  },
  polygon: {
    Title: 'POLYGON',
    Description: 'POLYGON Chain',
    Icon: 'polygon',
    value: 'polygon',
  },
  bcha: {
    Title: 'BCHA',
    Description: 'Bitcoin ABC',
    Icon: 'xec',
    value: 'bcha',
  },
  doge: {
    Title: 'DOGE',
    Description: 'Dogecoin',
    Icon: 'doge',
    value: 'doge',
  },
  ada: {
    Title: 'ADA',
    Description: 'Cardano',
    Icon: 'ada',
    value: 'ada',
  },
  atom: {
    Title: 'ATOM',
    Description: 'Atom',
    Icon: 'atom',
    value: 'atom',
  },
  tbtc: {
    Title: 'TBTC',
    Description: 'Testnet Bitcoin',
    Icon: 'btc',
    value: 'tbtc',
  },
  tbch: {
    Title: 'TBCH',
    Description: 'Testnet Bitcoin Cash',
    Icon: 'bch',
    value: 'tbch',
  },
  tltc: {
    Title: 'TLTC',
    Description: 'Testnet Litecoin',
    Icon: 'ltc',
    value: 'tltc',
  },
  txrp: {
    Title: 'TXRP',
    Description: 'Testnet Ripple',
    Icon: 'xrp',
    value: 'txrp',
  },
  txlm: {
    Title: 'TXLM',
    Description: 'Testnet Stellar',
    Icon: 'xlm',
    value: 'txlm',
  },
  gteth: {
    Title: 'GTETH',
    Description: 'Goerli Testnet Ethereum',
    Icon: 'eth',
    value: 'gteth',
  },
  gterc20: {
    Title: 'GTERC',
    Description: 'Goerli Testnet ERC20 Token',
    Icon: 'eth',
    value: 'gterc20',
  },
  ttrx: {
    Title: 'TTRX',
    Description: 'Testnet Tron',
    Icon: 'trx',
    value: 'ttrx',
  },
  teos: {
    Title: 'TEOS',
    Description: 'Testnet Eos',
    Icon: 'eos',
    value: 'teos',
  },
  tavaxc: {
    Title: 'TAVAXC',
    Description: 'Testnet Avalanche C-Chain',
    Icon: 'avax',
    value: 'tavaxc',
  },
  tnear: {
    Title: 'TNEAR',
    Description: 'Testnet Near',
    Icon: 'near',
    value: 'tnear',
  },
  tdot: {
    Title: 'TDOT',
    Description: 'Testnet Polkadot',
    Icon: 'dot',
    value: 'tdot',
  },
  tsol: {
    Title: 'TSOL',
    Description: 'Testnet Solana',
    Icon: 'sol',
    value: 'tsol',
  },
  tpolygon: {
    Title: 'TPOLYGON',
    Description: 'Polygon Mumbai Testnet',
    Icon: 'polygon',
    value: 'tpolygon',
  },
  tdoge: {
    Title: 'TDOGE',
    Description: 'Dogecoin Testnet',
    Icon: 'doge',
    value: 'tdoge',
  },
  tada: {
    Title: 'TADA',
    Description: 'Cardano Testnet',
    Icon: 'ada',
    value: 'tada',
  },
  tatom: {
    Title: 'TATOM',
    Description: 'Atom Testnet',
    Icon: 'atom',
    value: 'tatom',
  }
} as const;

export const buildUnsignedSweepCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [
    allCoinMetas.btc,
    allCoinMetas.bch,
    allCoinMetas.ltc,
    allCoinMetas.xrp,
    allCoinMetas.xlm,
    allCoinMetas.dash,
    allCoinMetas.zec,
    allCoinMetas.btg,
    allCoinMetas.eth,
    allCoinMetas.ethw,
    allCoinMetas.erc20,
    allCoinMetas.trx,
    allCoinMetas.eos,
    allCoinMetas.avaxc,
    allCoinMetas.polygon,
    allCoinMetas.bcha,
    allCoinMetas.doge,
    allCoinMetas.sol,
    allCoinMetas.ada,
    allCoinMetas.tdot,
  ] as const,
  test: [
    allCoinMetas.tbtc,
    allCoinMetas.txrp,
    allCoinMetas.txlm,
    allCoinMetas.gteth,
    allCoinMetas.gterc20,
    allCoinMetas.ttrx,
    allCoinMetas.teos,
    allCoinMetas.tavaxc,
    allCoinMetas.tpolygon,
    allCoinMetas.tdoge,
    allCoinMetas.tsol,
    allCoinMetas.tada,
    allCoinMetas.tdot,
  ] as const,
};

export const nonBitgoRecoveryCoins: Record<BitgoEnv, readonly CoinMetadata[]> =
  {
    prod: [
      allCoinMetas.btc,
      allCoinMetas.bch,
      allCoinMetas.ltc,
      allCoinMetas.xrp,
      allCoinMetas.xlm,
      allCoinMetas.dash,
      allCoinMetas.zec,
      allCoinMetas.btg,
      allCoinMetas.eth,
      allCoinMetas.ethw,
      allCoinMetas.erc20,
      allCoinMetas.trx,
      allCoinMetas.eos,
      allCoinMetas.avaxc,
      allCoinMetas.near,
      allCoinMetas.dot,
      allCoinMetas.sol,
      allCoinMetas.polygon,
      allCoinMetas.bcha,
      allCoinMetas.doge,
      allCoinMetas.ada,
      allCoinMetas.atom,
    ] as const,
    test: [
      allCoinMetas.tbtc,
      allCoinMetas.txrp,
      allCoinMetas.txlm,
      allCoinMetas.gteth,
      allCoinMetas.gterc20,
      allCoinMetas.ttrx,
      allCoinMetas.teos,
      allCoinMetas.tavaxc,
      allCoinMetas.tnear,
      allCoinMetas.tdot,
      allCoinMetas.tsol,
      allCoinMetas.tpolygon,
      allCoinMetas.tdoge,
      allCoinMetas.tada,
      allCoinMetas.tatom,
    ] as const,
  };

export const wrongChainRecoveryCoins: Record<
  BitgoEnv,
  Record<string, readonly CoinMetadata[]>
> = {
  prod: {
    btc: [allCoinMetas.ltc, allCoinMetas.bch],
    bch: [allCoinMetas.btc, allCoinMetas.ltc],
    bcha: [allCoinMetas.btc, allCoinMetas.bch],
    ltc: [allCoinMetas.btc, allCoinMetas.bch],
  },
  test: {
    // TODO(BG-67581): testnet only has 1 coin enabled for cross chain recovery
    tbtc: [],
    tbch: [],
    tbcha: [],
    tltc: [],
  },
} as const;

export const evmCrossChainRecoveryCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [
    allCoinMetas.polygon,
  ] as const,
  test: [
    allCoinMetas.tpolygon,
  ] as const
  };

export type WalletMetadata = {
  Title: string;
  Description: string;
  value: string;
};

export const allWalletMetas = {
  hot: {
    Title: 'Hot Wallet',
    Description: 'Self managed Hot Wallet',
    value: 'hot',
  },
  cold: {
    Title: 'Cold Wallet',
    Description: 'Self managed Cold Wallet',
    value: 'cold',
  },
  custody: {
    Title: 'Custody Wallet',
    Description: 'Bitgo managed Custody Wallet',
    value: 'custody',
  },
}


export const evmCrossChainRecoveryWallets:
WalletMetadata[]
 =  [
  allWalletMetas.hot,
  allWalletMetas.cold,
  allWalletMetas.custody
]
