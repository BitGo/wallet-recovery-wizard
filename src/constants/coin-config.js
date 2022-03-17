import bchIcon from 'images/BCH_icon.png';
import bchaIcon from 'images/BCHA_icon.png';
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
import eosIcon from 'images/EOS_icon.png';

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
      ],
      replayableNetworks: ['bch', 'bcha'],
    },
    ltc: {
      fullName: 'Litecoin',
      supportedRecoveries: ['btc', 'bch'],
      icon: ltcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
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
        { label: 'Testnet (Goerli)', value: 'test' },
      ],
    },
    token: {
      fullName: 'ERC20 Token',
      supportedRecoveries: [],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Goerli)', value: 'test' },
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
      test: ['btc', 'eth', 'xrp', 'xlm', 'token', 'trx', 'eos'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos'],
    },
    unsignedSweep: {
      test: ['btc', 'xrp', 'xlm', 'eth', 'token', 'trx', 'eos'],
      prod: ['btc', 'bch', 'ltc', 'xrp', 'xlm', 'dash', 'zec', 'btg', 'eth', 'token', 'trx', 'bsv', 'bcha', 'eos'],
    },
    migrated: {
      test: ['bch', 'bsv'],
      prod: ['bch', 'btg', 'bsv'],
    },
  },
  supportKeyDerivationForDebugging: ['btc', 'bch', 'ltc', 'dash', 'zec', 'btg', 'bsv', 'bcha'],
};
