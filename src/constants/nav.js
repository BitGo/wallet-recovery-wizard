import CrossChainRecoveryForm from 'components/cross-chain';
import NonBitGoRecoveryForm from 'components/non-bitgo';
import UnsupportedTokenRecoveryForm from 'components/unsupported-token';
import MigratedBchRecoveryForm from 'components/migrated-bch';

export default {
  main: [
    {
      title: 'Wrong Chain Recoveries',
      url: '/crosschain',
      description: 'Recover funds sent to the wrong chain, such as BTC sent to an LTC address.',
      needsLogin: true,
      NavComponent: CrossChainRecoveryForm
    },
    {
      title: 'Unsupported Token Recoveries',
      url: '/unsupportedtoken',
      description: 'Recover ERC20 tokens that are not officially supported by BitGo.',
      needsLogin: true,
      NavComponent: UnsupportedTokenRecoveryForm
    },
    {
      title: 'Non BitGo Recoveries',
      url: '/nonbitgo',
      description: 'Recover wallets using the user and backup key (sign a transaction without BitGo).',
      needsLogin: false,
      NavComponent: NonBitGoRecoveryForm
    },
    {
      title: 'Migrated Bitcoin Cash Recoveries',
      url: '/migratedbch',
      description: 'Recover unsupported migrated Bitcoin Cash wallets',
      needsLogin: true,
      NavComponent: MigratedBchRecoveryForm
    }
  ]
};
