import { CryptocurrencyIconProps } from '~/components';
import { BitgoEnv } from '.';

export type CoinMetadata = {
  Title: string;
  Description: string;
  value: string;
  Icon: CryptocurrencyIconProps['Name'];
  ApiKeyProvider?: string;
  isTssSupported?: boolean;
};

export const allCoinMetas: Record<string, CoinMetadata> = {
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
    ApiKeyProvider: 'etherscan.com',
    isTssSupported: true,
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
  avaxcToken: {
    Title: 'AVAXC TOKEN',
    Description: 'Avalanche C-Chain Token',
    Icon: 'avax',
    value: 'avaxcToken',
  },
  arbeth: {
    Title: 'ARBETH',
    Description: 'Arbitrum',
    Icon: 'arbeth',
    value: 'arbeth',
    ApiKeyProvider: 'arbiscan.io',
  },
  opeth: {
    Title: 'OPETH',
    Description: 'Optimism',
    Icon: 'opeth',
    value: 'opeth',
    ApiKeyProvider: 'optimistic.etherscan.io',
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
  osmo: {
    Title: 'OSMO',
    Description: 'Osmosis',
    Icon: 'osmo',
    value: 'osmo',
  },
  tia: {
    Title: 'TIA',
    Description: 'Celestia',
    Icon: 'tia',
    value: 'tia',
  },
  injective: {
    Title: 'INJECTIVE',
    Description: 'Injective',
    Icon: 'injective',
    value: 'injective',
  },
  bld: {
    Title: 'BLD',
    Description: 'Agoric',
    Icon: 'bld',
    value: 'bld',
  },
  hash: {
    Title: 'HASH',
    Description: 'Provenance',
    Icon: 'hash',
    value: 'hash',
  },
  sei: {
    Title: 'SEI',
    Description: 'Sei',
    Icon: 'sei',
    value: 'sei',
  },
  zeta: {
    Title: 'ZETA',
    Description: 'Zeta',
    Icon: 'zeta',
    value: 'zeta',
  },
  coreum: {
    Title: 'COREUM',
    Description: 'Coreum',
    Icon: 'coreum',
    value: 'coreum',
  },
  hbar: {
    Title: 'HBAR',
    Description: 'Hedera',
    Icon: 'hbar',
    value: 'hbar',
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
  hteth: {
    Title: 'HTETH',
    Description: 'Holesky Testnet Ethereum',
    Icon: 'eth',
    value: 'hteth',
    ApiKeyProvider: 'etherscan.com',
    isTssSupported: true,
  },
  hterc20: {
    Title: 'HTERC',
    Description: 'Holesky Testnet ERC20 Token',
    Icon: 'eth',
    value: 'hterc20',
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
  tavaxcToken: {
    Title: 'TAVAXC TOKEN',
    Description: 'Testnet Avalanche C-Chain Token',
    Icon: 'avax',
    value: 'tavaxcToken',
  },
  tarbeth: {
    Title: 'TARBETH',
    Description: 'Arbitrum Sepolia',
    Icon: 'arbeth',
    value: 'tarbeth',
    ApiKeyProvider: 'arbiscan.io',
  },
  topeth: {
    Title: 'TOPETH',
    Description: 'Optimism Sepolia',
    Icon: 'opeth',
    value: 'topeth',
    ApiKeyProvider: 'optimistic.etherscan.io',
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
  },
  tosmo: {
    Title: 'TOSMO',
    Description: 'Osmosis Testnet',
    Icon: 'osmo',
    value: 'tosmo',
  },
  ttia: {
    Title: 'TTIA',
    Description: 'Celestia Testnet',
    Icon: 'tia',
    value: 'ttia',
  },
  tinjective: {
    Title: 'TINJECTIVE',
    Description: 'Injective Testnet',
    Icon: 'injective',
    value: 'tinjective',
  },
  tbld: {
    Title: 'TBLD',
    Description: 'Agoric Testnet',
    Icon: 'bld',
    value: 'tbld',
  },
  thash: {
    Title: 'THASH',
    Description: 'Provenance Testnet',
    Icon: 'hash',
    value: 'thash',
  },
  tsei: {
    Title: 'TSEI',
    Description: 'Sei Testnet',
    Icon: 'sei',
    value: 'tsei',
  },
  tzeta: {
    Title: 'TZETA',
    Description: 'Zeta Testnet',
    Icon: 'zeta',
    value: 'tzeta',
  },
  tcoreum: {
    Title: 'TCOREUM',
    Description: 'Coreum Testnet',
    Icon: 'coreum',
    value: 'tcoreum',
  },
  thbar: {
    Title: 'THBAR',
    Description: 'Hedera Testnet',
    Icon: 'hbar',
    value: 'thbar',
  },
} as const;

export const buildUnsignedConsolidationCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [
    allCoinMetas.trx,
    allCoinMetas.ada,
    allCoinMetas.dot,
    allCoinMetas.sol,
  ],
  test: [
    allCoinMetas.ttrx,
    allCoinMetas.tada,
    allCoinMetas.tdot,
    allCoinMetas.tsol,
  ],
};

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
    allCoinMetas.avaxcToken,
    allCoinMetas.arbeth,
    allCoinMetas.opeth,
    allCoinMetas.polygon,
    allCoinMetas.bcha,
    allCoinMetas.doge,
    allCoinMetas.sol,
    allCoinMetas.ada,
    allCoinMetas.dot,
    allCoinMetas.hbar,
  ] as const,
  test: [
    allCoinMetas.tbtc,
    allCoinMetas.txrp,
    allCoinMetas.txlm,
    allCoinMetas.hteth,
    allCoinMetas.hterc20,
    allCoinMetas.ttrx,
    allCoinMetas.teos,
    allCoinMetas.tavaxc,
    allCoinMetas.tavaxcToken,
    allCoinMetas.tarbeth,
    allCoinMetas.topeth,
    allCoinMetas.tpolygon,
    allCoinMetas.tdoge,
    allCoinMetas.tsol,
    allCoinMetas.tada,
    allCoinMetas.tdot,
    allCoinMetas.thbar,
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
      allCoinMetas.avaxcToken,
      allCoinMetas.arbeth,
      allCoinMetas.opeth,
      allCoinMetas.near,
      allCoinMetas.dot,
      allCoinMetas.sol,
      allCoinMetas.polygon,
      allCoinMetas.bcha,
      allCoinMetas.doge,
      allCoinMetas.ada,
      allCoinMetas.atom,
      allCoinMetas.osmo,
      allCoinMetas.tia,
      allCoinMetas.injective,
      allCoinMetas.bld,
      allCoinMetas.hash,
      allCoinMetas.sei,
      allCoinMetas.zeta,
      allCoinMetas.coreum,
      allCoinMetas.hbar,
    ] as const,
    test: [
      allCoinMetas.tbtc,
      allCoinMetas.txrp,
      allCoinMetas.txlm,
      allCoinMetas.hteth,
      allCoinMetas.hterc20,
      allCoinMetas.ttrx,
      allCoinMetas.teos,
      allCoinMetas.tavaxc,
      allCoinMetas.tavaxcToken,
      allCoinMetas.tarbeth,
      allCoinMetas.topeth,
      allCoinMetas.tnear,
      allCoinMetas.tdot,
      allCoinMetas.tsol,
      allCoinMetas.tpolygon,
      allCoinMetas.tdoge,
      allCoinMetas.tada,
      allCoinMetas.tatom,
      allCoinMetas.tosmo,
      allCoinMetas.ttia,
      allCoinMetas.tinjective,
      allCoinMetas.tbld,
      allCoinMetas.thash,
      allCoinMetas.tsei,
      allCoinMetas.tzeta,
      allCoinMetas.tcoreum,
      allCoinMetas.thbar,
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
  prod: [allCoinMetas.polygon] as const,
  test: [allCoinMetas.tpolygon] as const,
};

export const broadcastTransactionCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [allCoinMetas.hbar] as const,
  test: [allCoinMetas.thbar] as const,
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
};

export const evmCrossChainRecoveryWallets: WalletMetadata[] = [
  allWalletMetas.hot,
  allWalletMetas.cold,
  allWalletMetas.custody,
];
