import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { RecoveryCoinsSelectAutocomplete } from './RecoveryCoinsSelectAutocomplete';

const meta: ComponentMeta<typeof RecoveryCoinsSelectAutocomplete> = {
  title: 'Components/RecoveryCoinsSelectAutocomplete',
  component: RecoveryCoinsSelectAutocomplete,
  parameters: {
    reactRouter: {
      routePath: '/non-bitgo-recovery/:env',
      routeParams: { env: 'test' },
    },
  },
};

export default meta;

export const Testnet: ComponentStoryObj<
  typeof RecoveryCoinsSelectAutocomplete
> = {};

export const Mainnet: ComponentStoryObj<
  typeof RecoveryCoinsSelectAutocomplete
> = {
  parameters: {
    reactRouter: {
      routePath: '/non-bitgo-recovery/:env',
      routeParams: { env: 'prod' },
    },
  },
};
