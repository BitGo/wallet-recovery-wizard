import CrossChainRecoveryForm from 'components/cross-chain';
import NonBitGoRecoveryForm from 'components/non-bitgo';
import UnsupportedTokenRecoveryForm from 'components/unsupported-token';
import MigratedRecoveryForm from 'components/migrated-legacy';
import UnsignedSweep from 'components/unsigned-sweep';

export default {
  main: [
    {
      title: 'Wrong Chain Recoveries',
      url: '/crosschain',
      description: 'Recover funds sent to the wrong chain, such as BTC sent to an LTC address.',
      needsLogin: true,
      NavComponent: CrossChainRecoveryForm,
    },
    {
      title: 'Unsupported Token Recoveries',
      url: '/unsupportedtoken',
      description: 'Recover ERC20 tokens that are not officially supported by BitGo.',
      needsLogin: true,
      NavComponent: UnsupportedTokenRecoveryForm,
    },
    {
      title: 'Non BitGo Recoveries',
      url: '/nonbitgo',
      description: 'Recover wallets using the user and backup key (sign a transaction without BitGo).',
      needsLogin: false,
      NavComponent: NonBitGoRecoveryForm,
    },
    {
      title: 'Migrated Legacy Wallet Recoveries',
      url: '/migratedlegacy',
      description: 'Recover unsupported migrated BCH, BSV, and BTG wallets',
      needsLogin: true,
      NavComponent: MigratedRecoveryForm,
    },
    {
      title: 'Build Unsigned Sweep',
      url: '/unsignedsweep',
      description: 'Build an unsigned transaction to sweep a wallet without using BitGo.',
      needsLogin: false,
      NavComponent: UnsignedSweep,
    },
  ],
};
