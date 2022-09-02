import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import App from '../App';

const meta: ComponentMeta<typeof App> = {
  component: App,
  parameters: {
    reactRouter: {
      initialEntries: ['/test/non-bitgo-recovery/btc/success'],
    },
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof App> = {};
