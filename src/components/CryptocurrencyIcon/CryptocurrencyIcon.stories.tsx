import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { CryptocurrencyIcon } from './CryptocurrencyIcon';

const meta: ComponentMeta<typeof CryptocurrencyIcon> = {
  component: CryptocurrencyIcon,
  args: {
    Name: 'bch',
    Size: 'large',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof CryptocurrencyIcon> = {};
