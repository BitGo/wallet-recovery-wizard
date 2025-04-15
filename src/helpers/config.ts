import { CryptocurrencyIconProps } from '~/components';
import { BitgoEnv } from '.';

export type CoinMetadata = {
  Title: string;
  Description: string;
  value: string;
  Icon: CryptocurrencyIconProps['Name'];
  ApiKeyProvider?: string;
  isTssSupported?: boolean;
  minGasLimit?: string;
  defaultGasLimit?: string;
  defaultGasLimitNum?: number;
  defaultMaxFeePerGas?: number;
  defaultMaxPriorityFeePerGas?: number;
  defaultGasPrice?: number;
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
    defaultGasLimit: '200,000',
    defaultGasLimitNum: 200000,
    defaultMaxFeePerGas: 100,
    defaultMaxPriorityFeePerGas: 20,
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
    minGasLimit: '30,000',
    defaultGasLimit: '500,000',
  },
  trx: {
    Title: 'TRX',
    Description: 'Tron',
    Icon: 'trx',
    value: 'trx',
  },
  trxToken: {
    Title: 'TRX Token',
    Description: 'Tron Token',
    Icon: 'trx',
    value: 'trxToken',
  },
  eos: {
    Title: 'EOS',
    Description: 'Eos',
    Icon: 'eos',
    value: 'eos',
  },
  etc: {
    Title: 'ETC',
    Description: 'Ethereum Classic',
    Icon: 'etc',
    value: 'etc',
  },
  tetc: {
    Title: 'TETC',
    Description: 'Testnet Ethereum Classic',
    Icon: 'etc',
    value: 'tetc',
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
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  arbethToken: {
    Title: 'ARBETH TOKEN',
    Description: 'Arbitrum Token',
    Icon: 'arbeth',
    value: 'arbethToken',
    ApiKeyProvider: 'arbiscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  coredao: {
    Title: 'COREDAO',
    Description: 'Core BlockChain',
    Icon: 'coredao',
    value: 'coredao',
    isTssSupported: true,
    ApiKeyProvider: 'scan.coredao.org',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  oas: {
    Title: 'OAS',
    Description: 'Oasys BlockChain',
    Icon: 'oas',
    value: 'oas',
    isTssSupported: true,
    ApiKeyProvider: 'explorer.oasys.games',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  flr: {
    Title: 'FLR',
    Description: 'FLARE',
    Icon: 'flr',
    value: 'flr',
    isTssSupported: true,
    ApiKeyProvider: 'flare-explorer.flare.network',
    minGasLimit: '400,000',
    defaultGasLimit: '1000000',
    defaultGasLimitNum: 1000000,
  },
  sgb: {
    Title: 'SGB',
    Description: 'SONGBIRD',
    Icon: 'sgb',
    value: 'sgb',
    isTssSupported: true,
    ApiKeyProvider: 'songbird-explorer.flare.network',
    minGasLimit: '400,000',
    defaultGasLimit: '1000000',
    defaultGasLimitNum: 1000000,
  },
  xdc: {
    Title: 'XDC',
    Description: 'XDC Network',
    Icon: 'xdc',
    value: 'xdc',
    isTssSupported: true,
    ApiKeyProvider: 'api-xdc.blocksscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '1000000',
    defaultGasLimitNum: 1000000,
  },
  wemix: {
    Title: 'Wemix',
    Description: 'Wemix Network',
    Icon: 'wemix',
    value: 'wemix',
    isTssSupported: true,
    ApiKeyProvider: 'api.wemixscan.com',
    minGasLimit: '400,000',
    defaultGasLimit: '1000000',
    defaultGasLimitNum: 1000000,
  },
  opeth: {
    Title: 'OPETH',
    Description: 'Optimism',
    Icon: 'opeth',
    value: 'opeth',
    ApiKeyProvider: 'optimistic.etherscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
    defaultMaxFeePerGas: 50,
    defaultMaxPriorityFeePerGas: 10,
  },
  opethToken: {
    Title: 'OPETH TOKEN',
    Description: 'Optimism Token',
    Icon: 'opeth',
    value: 'opethToken',
    ApiKeyProvider: 'optimistic.etherscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
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
  tao: {
    Title: 'TAO',
    Description: 'Bittensor',
    Icon: 'tao',
    value: 'tao',
  },
  icp: {
    Title: 'ICP',
    Description: 'Internet Computer',
    Icon: 'icp',
    value: 'icp',
  },
  sol: {
    Title: 'SOL',
    Description: 'Solana',
    Icon: 'sol',
    value: 'sol',
  },
  solToken: {
    Title: 'SOL Token',
    Description: 'Solana Token',
    Icon: 'sol',
    value: 'solToken',
  },
  polygon: {
    Title: 'POLYGON',
    Description: 'POLYGON Chain',
    Icon: 'polygon',
    value: 'polygon',
    isTssSupported: true,
    defaultGasLimit: '200,000',
    defaultGasLimitNum: 200000,
    defaultMaxFeePerGas: 200,
    defaultMaxPriorityFeePerGas: 50,
  },
  bsc: {
    Title: 'BSC',
    Description: 'BNB Smart Chain',
    Icon: 'bsc',
    value: 'bsc',
    isTssSupported: true,
  },
  polygonToken: {
    Title: 'POLYGON TOKEN',
    Description: 'Polygon Token',
    Icon: 'polygon',
    value: 'polygonToken',
    ApiKeyProvider: 'polygonscan.com',
    minGasLimit: '30,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
    defaultMaxPriorityFeePerGas: 30,
    defaultMaxFeePerGas: 50,
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
  hbarToken: {
    Title: 'HBAR Token',
    Description: 'Hedera Token',
    Icon: 'hbar',
    value: 'hbarToken',
  },
  algo: {
    Title: 'ALGO',
    Description: 'Algorand',
    Icon: 'algo',
    value: 'algo',
  },
  sui: {
    Title: 'SUI',
    Description: 'Sui',
    Icon: 'sui',
    value: 'sui',
  },
  'thorchain:rune': {
    Title: 'THORCHAIN:RUNE',
    Description: 'Thorchain:rune',
    Icon: 'thorchain:rune',
    value: 'thorchain:rune'
  },
  baby: {
    Title: 'BABY',
    Description: 'Babylon',
    Icon: 'baby',
    value: 'baby',
  },
  suiToken: {
    Title: 'SUI Token',
    Description: 'Sui Token',
    Icon: 'sui',
    value: 'suiToken',
  },
  tsui: {
    Title: 'TSUI',
    Description: 'Testnet Sui',
    Icon: 'sui',
    value: 'tsui',
  },
  tsuiToken: {
    Title: 'TSUI Token',
    Description: 'Testnet Sui Token',
    Icon: 'sui',
    value: 'tsuiToken',
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
  txrpToken: {
    Title: 'TXRP Token',
    Description: 'Testnet Ripple Token',
    Icon: 'xrp',
    value: 'txrpToken',
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
    defaultGasLimit: '200,000',
    defaultGasLimitNum: 200000,
    defaultMaxFeePerGas: 100,
    defaultMaxPriorityFeePerGas: 20,
  },
  hterc20: {
    Title: 'HTERC',
    Description: 'Holesky Testnet ERC20 Token',
    Icon: 'eth',
    value: 'hterc20',
    minGasLimit: '30,000',
    defaultGasLimit: '500,000',
  },
  ttrx: {
    Title: 'TTRX',
    Description: 'Testnet Tron',
    Icon: 'trx',
    value: 'ttrx',
  },
  ttrxToken: {
    Title: 'TTRX Token',
    Description: 'Testnet Tron Token',
    Icon: 'trx',
    value: 'ttrxToken',
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
    Description: 'Testnet Arbitrum Ethereum',
    Icon: 'arbeth',
    value: 'tarbeth',
    ApiKeyProvider: 'arbiscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
  },
  tarbethToken: {
    Title: 'TARBETH TOKEN',
    Description: 'Testnet Arbitrum Token',
    Icon: 'arbeth',
    value: 'tarbethToken',
    ApiKeyProvider: 'arbiscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
  },
  tcoredao: {
    Title: 'TCOREDAO',
    Description: 'Testnet Core BlockChain',
    Icon: 'coredao',
    value: 'tcoredao',
    isTssSupported: true,
    ApiKeyProvider: 'scan.test2.btcs.network',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  toas: {
    Title: 'TOAS',
    Description: 'Testnet Oasys BlockChain',
    Icon: 'oas',
    value: 'toas',
    isTssSupported: true,
    ApiKeyProvider: 'explorer.testnet.oasys.games',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  tflr: {
    Title: 'TFLR',
    Description: 'Testnet Flare',
    Icon: 'flr',
    value: 'tflr',
    isTssSupported: true,
    ApiKeyProvider: 'coston2-explorer.flare.network',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  tsgb: {
    Title: 'TSGB',
    Description: 'Testnet Songbird',
    Icon: 'sgb',
    value: 'tsgb',
    isTssSupported: true,
    ApiKeyProvider: 'coston-explorer.flare.network',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  txdc: {
    Title: 'TXDC',
    Description: 'Testnet XDC Network',
    Icon: 'xdc',
    value: 'txdc',
    isTssSupported: true,
    ApiKeyProvider: 'api-apothem.xdcscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,000',
    defaultGasLimitNum: 1000000,
  },
  twemix: {
    Title: 'Testnet Wemix',
    Description: 'Testnet Wemix Network',
    Icon: 'wemix',
    value: 'twemix',
    isTssSupported: true,
    ApiKeyProvider: 'api-testnet.wemixscan.com',
    minGasLimit: '400,000',
    defaultGasLimit: '1,000,00',
    defaultGasLimitNum: 1000000,
  },
  topeth: {
    Title: 'TOPETH',
    Description: 'Testnet Optimism Ethereum',
    Icon: 'opeth',
    value: 'topeth',
    ApiKeyProvider: 'optimistic.etherscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
    defaultMaxFeePerGas: 50,
    defaultMaxPriorityFeePerGas: 10,
  },
  topethToken: {
    Title: 'TOPETH TOKEN',
    Description: 'Testnet Optimism Token',
    Icon: 'opeth',
    value: 'topethToken',
    ApiKeyProvider: 'optimistic.etherscan.io',
    minGasLimit: '400,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
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
  ttao: {
    Title: 'TTAO',
    Description: 'Testnet Bittensor',
    Icon: 'tao',
    value: 'ttao',
  },
  ticp: {
    Title: 'TICP',
    Description: 'Testnet Internet Computer',
    Icon: 'icp',
    value: 'ticp',
  },
  tsol: {
    Title: 'TSOL',
    Description: 'Testnet Solana',
    Icon: 'sol',
    value: 'tsol',
  },
  tsolToken: {
    Title: 'TSOL Token',
    Description: 'Testnet Solana Token',
    Icon: 'sol',
    value: 'tsolToken',
  },
  tpolygon: {
    Title: 'TPOLYGON',
    Description: 'Polygon Mumbai Testnet',
    Icon: 'polygon',
    value: 'tpolygon',
    isTssSupported: true,
    ApiKeyProvider: 'api-amoy.polygonscan.com',
    defaultGasLimit: '200,000',
    defaultGasLimitNum: 200000,
    defaultMaxFeePerGas: 200,
    defaultMaxPriorityFeePerGas: 50,
  },
  tbsc: {
    Title: 'TBSC',
    Description: 'BNB Smart Chain Testnet',
    Icon: 'bsc',
    value: 'tbsc',
    isTssSupported: true,
  },
  tpolygonToken: {
    Title: 'TPOLYGON TOKEN',
    Description: 'Testnet Polygon Token',
    Icon: 'polygon',
    value: 'tpolygonToken',
    ApiKeyProvider: 'api-amoy.polygonscan.com',
    minGasLimit: '30,000',
    defaultGasLimit: '500,000',
    defaultGasLimitNum: 500000,
    defaultMaxPriorityFeePerGas: 30,
    defaultMaxFeePerGas: 50,
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
  'tthorchain:rune': {
    Title: 'TTHORCHAIN:RUNE',
    Description: 'Thorchain:rune Testnet',
    Icon: 'thorchain:rune',
    value: 'tthorchain:rune'
  },
  tbaby: {
    Title: 'TBABY',
    Description: 'Babylon Testnet',
    Icon: 'baby',
    value: 'tbaby',
  },
  thbar: {
    Title: 'THBAR',
    Description: 'Hedera Testnet',
    Icon: 'hbar',
    value: 'thbar',
  },
  thbarToken: {
    Title: 'THBAR Token',
    Description: 'Testnet Hedera Token',
    Icon: 'hbar',
    value: 'thbarToken',
  },
  talgo: {
    Title: 'TALGO',
    Description: 'Algorand Testnet',
    Icon: 'algo',
    value: 'talgo',
  },
  baseeth: {
    Title: 'BASEETH',
    Description: 'Base Chain Mainnet',
    Icon: 'baseeth',
    value: 'baseeth',
  },
  tbaseeth: {
    Title: 'TBASEETH',
    Description: 'Base Sepolia Testnet',
    Icon: 'baseeth',
    value: 'tbaseeth',
  },
  ton: {
    Title: 'TON',
    Description: 'Ton',
    Icon: 'ton',
    ApiKeyProvider: 'toncenter.com',
    value: 'ton',
  },
  tton: {
    Title: 'TTON',
    Description: 'Ton Testnet',
    ApiKeyProvider: 'testnet.toncenter.com',
    Icon: 'ton',
    value: 'ton',
  },
} as const;

export const buildUnsignedConsolidationCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [
    allCoinMetas.trx,
    allCoinMetas.trxToken,
    allCoinMetas.ada,
    allCoinMetas.dot,
    allCoinMetas.tao,
    allCoinMetas.sol,
    allCoinMetas.solToken,
    allCoinMetas.sui,
    allCoinMetas.suiToken,
  ],
  test: [
    allCoinMetas.ttrx,
    allCoinMetas.ttrxToken,
    allCoinMetas.tada,
    allCoinMetas.tdot,
    allCoinMetas.ttao,
    allCoinMetas.tsol,
    allCoinMetas.tsolToken,
    allCoinMetas.tsui,
    allCoinMetas.tsuiToken,
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
    allCoinMetas.etc,
    allCoinMetas.ethw,
    allCoinMetas.erc20,
    allCoinMetas.trx,
    allCoinMetas.trxToken,
    allCoinMetas.eos,
    allCoinMetas.avaxc,
    allCoinMetas.avaxcToken,
    allCoinMetas.arbeth,
    allCoinMetas.arbethToken,
    allCoinMetas.opeth,
    allCoinMetas.opethToken,
    allCoinMetas.near,
    allCoinMetas.polygon,
    allCoinMetas.polygonToken,
    allCoinMetas.bsc,
    allCoinMetas.bcha,
    allCoinMetas.doge,
    allCoinMetas.sol,
    allCoinMetas.solToken,
    allCoinMetas.ada,
    allCoinMetas.dot,
    allCoinMetas.tao,
    allCoinMetas.icp,
    allCoinMetas.hbar,
    allCoinMetas.hbarToken,
    allCoinMetas.algo,
    allCoinMetas.sui,
    allCoinMetas.suiToken,
    allCoinMetas.flr,
    allCoinMetas.sgb,
    allCoinMetas.xdc,
    allCoinMetas.wemix,
    allCoinMetas.coredao,
    allCoinMetas.oas,
    allCoinMetas.ton,
  ] as const,
  test: [
    allCoinMetas.tbtc,
    allCoinMetas.txrp,
    allCoinMetas.txrpToken,
    allCoinMetas.txlm,
    allCoinMetas.hteth,
    allCoinMetas.tetc,
    allCoinMetas.hterc20,
    allCoinMetas.ttrx,
    allCoinMetas.ttrxToken,
    allCoinMetas.teos,
    allCoinMetas.tavaxc,
    allCoinMetas.tavaxcToken,
    allCoinMetas.tarbeth,
    allCoinMetas.tarbethToken,
    allCoinMetas.topeth,
    allCoinMetas.topethToken,
    allCoinMetas.tnear,
    allCoinMetas.tpolygon,
    allCoinMetas.tpolygonToken,
    allCoinMetas.tdoge,
    allCoinMetas.tsol,
    allCoinMetas.tsolToken,
    allCoinMetas.tada,
    allCoinMetas.tdot,
    allCoinMetas.ttao,
    allCoinMetas.ticp,
    allCoinMetas.thbar,
    allCoinMetas.thbarToken,
    allCoinMetas.talgo,
    allCoinMetas.tbsc,
    allCoinMetas.tsui,
    allCoinMetas.tsuiToken,
    allCoinMetas.tflr,
    allCoinMetas.tsgb,
    allCoinMetas.txdc,
    allCoinMetas.twemix,
    allCoinMetas.tcoredao,
    allCoinMetas.toas,
    allCoinMetas.tton,
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
      allCoinMetas.etc,
      allCoinMetas.ethw,
      allCoinMetas.erc20,
      allCoinMetas.trx,
      allCoinMetas.trxToken,
      allCoinMetas.eos,
      allCoinMetas.avaxc,
      allCoinMetas.avaxcToken,
      allCoinMetas.arbeth,
      allCoinMetas.arbethToken,
      allCoinMetas.coredao,
      allCoinMetas.oas,
      allCoinMetas.flr,
      allCoinMetas.sgb,
      allCoinMetas.xdc,
      allCoinMetas.wemix,
      allCoinMetas.opeth,
      allCoinMetas.opethToken,
      allCoinMetas.near,
      allCoinMetas.dot,
      allCoinMetas.tao,
      allCoinMetas.icp,
      allCoinMetas.sol,
      allCoinMetas.solToken,
      allCoinMetas.polygon,
      allCoinMetas.polygonToken,
      allCoinMetas.bsc,
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
      allCoinMetas.hbarToken,
      allCoinMetas.algo,
      allCoinMetas.sui,
      allCoinMetas.suiToken,
      allCoinMetas['thorchain:rune'],
      allCoinMetas.baby,
      allCoinMetas.ton,
    ] as const,
    test: [
      allCoinMetas.tbtc,
      allCoinMetas.txrp,
      allCoinMetas.txrpToken,
      allCoinMetas.txlm,
      allCoinMetas.hteth,
      allCoinMetas.tetc,
      allCoinMetas.hterc20,
      allCoinMetas.ttrx,
      allCoinMetas.ttrxToken,
      allCoinMetas.teos,
      allCoinMetas.tavaxc,
      allCoinMetas.tavaxcToken,
      allCoinMetas.tarbeth,
      allCoinMetas.tarbethToken,
      allCoinMetas.tcoredao,
      allCoinMetas.toas,
      allCoinMetas.tflr,
      allCoinMetas.tsgb,
      allCoinMetas.txdc,
      allCoinMetas.twemix,
      allCoinMetas.topeth,
      allCoinMetas.topethToken,
      allCoinMetas.tnear,
      allCoinMetas.tdot,
      allCoinMetas.ttao,
      allCoinMetas.ticp,
      allCoinMetas.tsol,
      allCoinMetas.tsolToken,
      allCoinMetas.tpolygon,
      allCoinMetas.tpolygonToken,
      allCoinMetas.tbsc,
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
      allCoinMetas.thbarToken,
      allCoinMetas.talgo,
      allCoinMetas.tsui,
      allCoinMetas.tsuiToken,
      allCoinMetas['tthorchain:rune'],
      allCoinMetas.baby,
      allCoinMetas.tton,
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

export const evmCCRWrongChainCoins: Record<BitgoEnv, readonly CoinMetadata[]> =
  {
    prod: [
      allCoinMetas.polygon,
      allCoinMetas.eth,
      allCoinMetas.opeth,
      allCoinMetas.bsc,
      allCoinMetas.baseeth,
      allCoinMetas.arbeth,
      allCoinMetas.avaxc
    ] as const,
    test: [
      allCoinMetas.tpolygon,
      allCoinMetas.hteth,
      allCoinMetas.topeth,
      allCoinMetas.tbsc,
      allCoinMetas.tbaseeth,
      allCoinMetas.tarbeth,
      allCoinMetas.tavaxc
    ] as const,
  };

export const evmCCRIntendedChainCoins: Record<string, readonly CoinMetadata[]> =
  {
    polygon: [
      allCoinMetas.eth,
      allCoinMetas.arbeth,
      allCoinMetas.opeth,
    ] as const,
    tpolygon: [
      allCoinMetas.hteth,
      allCoinMetas.tarbeth,
      allCoinMetas.topeth,
    ] as const,
    eth: [
      allCoinMetas.polygon,
      allCoinMetas.arbeth,
      allCoinMetas.opeth,
    ] as const,
    hteth: [
      allCoinMetas.tpolygon,
      allCoinMetas.tarbeth,
      allCoinMetas.topeth,
    ] as const,
    topeth: [
      allCoinMetas.tarbeth,
      allCoinMetas.hteth,
      allCoinMetas.tpolygon,
    ] as const,
    opeth: [
      allCoinMetas.arbeth,
      allCoinMetas.eth,
      allCoinMetas.polygon,
    ] as const,
    bsc: [
      allCoinMetas.eth,
      allCoinMetas.arbeth,
      allCoinMetas.opeth,
      allCoinMetas.polygon,
    ] as const,
    tbsc: [
      allCoinMetas.hteth,
      allCoinMetas.tarbeth,
      allCoinMetas.topeth,
      allCoinMetas.tpolygon,
    ] as const,
    baseeth: [
      allCoinMetas.eth,
      allCoinMetas.arbeth,
      allCoinMetas.opeth,
      allCoinMetas.polygon,
    ] as const,
    tbaseeth: [
      allCoinMetas.hteth,
      allCoinMetas.tarbeth,
      allCoinMetas.topeth,
      allCoinMetas.tpolygon,
    ] as const,
    arbeth: [
      allCoinMetas.eth,
      allCoinMetas.polygon,
      allCoinMetas.opeth,
    ] as const,
    tarbeth: [
      allCoinMetas.hteth,
      allCoinMetas.tpolygon,
      allCoinMetas.topeth,
    ] as const,
    avaxc: [
      allCoinMetas.eth,
      allCoinMetas.polygon,
      allCoinMetas.opeth,
      allCoinMetas.arbeth,
    ] as const,
    tavaxc: [
      allCoinMetas.hteth,
      allCoinMetas.tpolygon,
      allCoinMetas.topeth,
      allCoinMetas.tarbeth,
    ] as const,
  };

export const broadcastTransactionCoins: Record<
  BitgoEnv,
  readonly CoinMetadata[]
> = {
  prod: [allCoinMetas.hbar, allCoinMetas.algo, allCoinMetas.sui] as const,
  test: [allCoinMetas.thbar, allCoinMetas.talgo, allCoinMetas.tsui] as const,
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

export const tokenParentCoins = {
  hterc20: 'hteth',
  erc20: 'eth',
  arbethToken: 'arbeth',
  tarbethToken: 'tarbeth',
  opethToken: 'opeth',
  topethToken: 'topeth',
  polygonToken: 'polygon',
  tpolygonToken: 'tpolygon',
  suiToken: 'sui',
  tsuiToken: 'tsui',
  trxToken: 'trx',
  ttrxToken: 'ttrx',
  txrpToken: 'txrp',
  hbarToken: 'hbar',
  thbarToken: 'thbar',
};

export type EvmCcrNonBitgoCoinConfigType = {
  name: string,
  chainId: number,
  networkId: number,
  defaultHardfork: string,
};

export const evmCcrNonBitgoCoins = ['tbaseeth', 'baseeth'] as const;
export type EvmCcrNonBitgoCoin = (typeof evmCcrNonBitgoCoins)[number]

export const evmCcrNonBitgoCoinConfig = {
  baseeth: {
    name: 'Base Chain',
    chainId: 8453,
    defaultHardfork: 'london',
  },
  tbaseeth: {
    name: 'Base Sepolia',
    chainId: 84532,
    defaultHardfork: 'london',
  },
};
