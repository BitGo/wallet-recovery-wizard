import bchIcon from 'images/BCH_icon.png';
import btcIcon from 'images/BTC_icon.png';
import bsvIcon from 'images/BSV_icon.png';
import ltcIcon from 'images/LTC_icon.png';
import zecIcon from 'images/ZEC_icon.png';
import ethIcon from 'images/ETH_icon.png';
import btgIcon from 'images/BTG_icon.png';
import xrpIcon from 'images/XRP_icon.png';
import dashIcon from 'images/DASH_icon.png';
import xlmIcon from 'images/XLM_icon.png';
import trxIcon from 'images/TRX_icon.png';

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
    },
    bsv: {
      fullName: 'Bitcoin SV',
      supportedRecoveries: [],
      icon: bsvIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ],
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
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
      ],
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
  },
  supportedRecoveries: {
    crossChain: ['btc', 'bch', 'ltc'],
    nonBitGo: {
      test: ['btc', 'eth', 'xrp', 'xlm', 'ltc', 'dash', 'zec', 'btg', 'token', 'trx'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv'],
    },
    unsignedSweep: {
      test: ['btc', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv'],
    },
    migrated: {
      test: ['bch', 'bsv'],
      prod: ['bch', 'btg', 'bsv'],
    },
  },
};
