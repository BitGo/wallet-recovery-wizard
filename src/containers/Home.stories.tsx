import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Home } from './Home';

const meta: ComponentMeta<typeof Home> = {
  component: Home,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Home> = {};
