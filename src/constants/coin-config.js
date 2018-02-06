import bchIcon from 'images/BCH_icon.png';
import btcIcon from 'images/BTC_icon.png';
import ltcIcon from 'images/LTC_icon.png';

export default {
  bch: {
    fullName: 'Bitcoin Cash',
    supportedRecoveries: ['btc'],
    icon: bchIcon
  },
  btc: {
    fullName: 'Bitcoin',
    supportedRecoveries: ['bch', 'ltc'],
    icon: btcIcon
  },
  ltc: {
    fullName: 'Litecoin',
    supportedRecoveries: ['btc'],
    icon: ltcIcon
  }
}