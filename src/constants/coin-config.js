import bchIcon from 'images/BCH_icon.png';
import btcIcon from 'images/BTC_icon.png';
import ltcIcon from 'images/LTC_icon.png';
import ethIcon from 'images/ETH_icon.png';
import btgIcon from 'images/BTG_icon.png';
import xrpIcon from 'images/XRP_icon.png';

export default {
  allCoins: {
    btc: {
      fullName: 'Bitcoin',
      supportedRecoveries: ['bch', 'ltc'],
      icon: btcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    bch: {
      fullName: 'Bitcoin Cash',
      supportedRecoveries: ['btc', 'ltc'],
      icon: bchIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    ltc: {
      fullName: 'Litecoin',
      supportedRecoveries: ['btc', 'bch'],
      icon: ltcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    btg: {
      fullName: 'Bitcoin Gold',
      supportedRecoveries: [],
      icon: btgIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
      ]
    },
    xrp: {
      fullName: 'Ripple',
      supportedRecoveries: [],
      icon: xrpIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
      ]
    },
    eth: {
      fullName: 'Ethereum',
      supportedRecoveries: ['btc'],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' }
      ]
    },
    tbtc: {
      fullName: 'Testnet Bitcoin',
      supportedRecoveries: ['bch', 'ltc'],
      icon: btcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    tbch: {
      fullName: 'Testnet Bitcoin Cash',
      supportedRecoveries: ['btc', 'ltc'],
      icon: bchIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    tltc: {
      fullName: 'Testnet Litecoin',
      supportedRecoveries: ['btc'],
      icon: ltcIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet', value: 'test' },
      ]
    },
    teth: {
      fullName: 'Testnet Ethereum',
      supportedRecoveries: ['btc'],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' }
      ]
    },
    token: {
      fullName: 'ERC20 Token',
      supportedRecoveries: [],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' }
      ]
    }
  },
  supportedRecoveries: {
    crossChain: ['btc', 'bch', 'ltc'],
    nonBitGo: ['eth', 'btc', 'ltc', 'bch', 'btg', 'token']
  }
}
