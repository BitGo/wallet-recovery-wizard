import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { CoinsSelectAutocomplete } from './CoinsSelectAutocomplete';

const meta: ComponentMeta<typeof CoinsSelectAutocomplete> = {
  component: CoinsSelectAutocomplete,
  parameters: {
    reactRouter: {
      routePath: '/non-bitgo-recovery/:env',
      routeParams: { env: 'test' },
    },
  },
};

export default meta;

export const Testnet: ComponentStoryObj<typeof CoinsSelectAutocomplete> = {};

export const Mainnet: ComponentStoryObj<typeof CoinsSelectAutocomplete> = {
  parameters: {
    reactRouter: {
      routePath: '/non-bitgo-recovery/:env',
      routeParams: { env: 'prod' },
    },
  },
};
