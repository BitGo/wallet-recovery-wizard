import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import App from '../App';

const meta: ComponentMeta<typeof App> = {
  component: App,
  parameters: {
    reactRouter: {
      initialEntries: ['/test/broadcast-transaction/hbar/success'],
    },
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof App> = {};
