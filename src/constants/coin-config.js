import bchIcon from 'images/BCH_icon.png';
import btcIcon from 'images/BTC_icon.png';
import ltcIcon from 'images/LTC_icon.png';
import ethIcon from 'images/ETH_icon.png';

export default {
  allCoins: {
    btc: {
      fullName: 'Bitcoin',
      supportedRecoveries: ['bch', 'ltc'],
      icon: btcIcon
    },
    bch: {
      fullName: 'Bitcoin Cash',
      supportedRecoveries: ['btc'],
      icon: bchIcon
    },
    ltc: {
      fullName: 'Litecoin',
      supportedRecoveries: ['btc'],
      icon: ltcIcon
    },
    eth: {
      fullName: 'Ethereum',
      supportedRecoveries: ['btc'],
      icon: ethIcon,
      envOptions: [
        { label: 'Mainnet', value: 'prod' },
        { label: 'Testnet (Kovan)', value: 'test' }
      ]
    }
  },
  supportedRecoveries: {
    crossChain: ['btc', 'bch', 'ltc'],
    nonBitGo: ['eth']
  }
}