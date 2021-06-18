import bchIcon from '@src/images/BCH_icon.png';
import bchaIcon from '@src/images/BCHA_icon.png';
import btcIcon from '@src/images/BTC_icon.png';
import bsvIcon from '@src/images/BSV_icon.png';
import ltcIcon from '@src/images/LTC_icon.png';
import zecIcon from '@src/images/ZEC_icon.png';
import ethIcon from '@src/images/ETH_icon.png';
import btgIcon from '@src/images/BTG_icon.png';
import xrpIcon from '@src/images/XRP_icon.png';
import dashIcon from '@src/images/DASH_icon.png';
import xlmIcon from '@src/images/XLM_icon.png';
import trxIcon from '@src/images/TRX_icon.png';
import eosIcon from '@src/images/EOS_icon.png';

export default {
  allCoins: {
    btc: {
      fullName: 'Bitcoin',
      supportedRecoveries: ['bch', 'ltc'],
      icon: btcIcon,
      recoverP2wsh: true,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    bch: {
      fullName: 'Bitcoin Cash',
      supportedRecoveries: ['btc', 'ltc'],
      icon: bchIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
      replayableNetworks: ['bsv', 'bcha'],
    },
    bcha: {
      fullName: 'Bitcoin ABC',
      icon: bchaIcon,
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
      replayableNetworks: ['bch', 'bsv'],
    },
    bsv: {
      fullName: 'Bitcoin SV',
      supportedRecoveries: [],
      icon: bsvIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
      replayableNetworks: ['bch', 'bcha'],
    },
    ltc: {
      fullName: 'Litecoin',
      supportedRecoveries: ['btc', 'bch'],
      icon: ltcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    btg: {
      fullName: 'Bitcoin Gold',
      supportedRecoveries: [],
      icon: btgIcon,
      envOptions: [{ label: 'Mainnet', value: 'prod' }],
    },
    zec: {
      fullName: 'Zcash',
      supportedRecoveries: [],
      icon: zecIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    xrp: {
      fullName: 'Ripple',
      supportedRecoveries: [],
      icon: xrpIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    dash: {
      fullName: 'Dash',
      supportedRecoveries: [],
      icon: dashIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    xlm: {
      fullName: 'Stellar',
      supportedRecoveries: [],
      icon: xlmIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
    eth: {
      fullName: 'Ethereum',
      supportedRecoveries: ['btc'],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' },
      ],
    },
    token: {
      fullName: 'ERC20 Token',
      supportedRecoveries: [],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' },
      ],
    },
    trx: {
      fullName: 'Tron',
      supportedRecoveries: [],
      icon: trxIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Tronex)', value: 'test' },
      ],
    },
    eos: {
      fullName: 'EOS',
      supportedRecoveries: [],
      icon: eosIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
    },
  },
  supportedRecoveries: {
    crossChain: ['btc', 'bch', 'ltc'],
    nonBitGo: {
      test: ['btc', 'eth', 'xrp', 'xlm', 'ltc', 'dash', 'zec', 'btg', 'token', 'trx', 'eos'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos'],
    },
    unsignedSweep: {
      test: ['btc', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'eos'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos'],
    },
    migrated: {
      test: ['bch', 'bsv'],
      prod: ['bch', 'btg', 'bsv'],
    },
  },
  supportKeyDerivationForDebugging: ['btc', 'bch', 'ltc', 'dash', 'zec', 'btg', 'bsv', 'bcha'],
};
