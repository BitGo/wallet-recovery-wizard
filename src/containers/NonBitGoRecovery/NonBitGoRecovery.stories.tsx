import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import NonBitGoRecovery from './NonBitGoRecovery';

const meta: ComponentMeta<typeof NonBitGoRecovery> = {
  component: NonBitGoRecovery,
  parameters: {
    layout: 'fullscreen',
    reactRouter: {
      routePath: '/non-bitgo-recovery/:env',
      routeParams: { env: 'test' },
    },
  },
};

export default meta;

export const Testnet: ComponentStoryObj<typeof NonBitGoRecovery> = {};

export const Mainnet: ComponentStoryObj<typeof NonBitGoRecovery> = {
  parameters: {
    reactRouter: {
      routeParams: { env: 'prod' },
    },
  },
};
