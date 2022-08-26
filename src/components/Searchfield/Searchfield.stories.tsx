import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Searchfield } from './Searchfield';

const meta: ComponentMeta<typeof Searchfield> = {
  component: Searchfield,
  args: {
    placeholder: 'Placeholder',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Searchfield> = {};
