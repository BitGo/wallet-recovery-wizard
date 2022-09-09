import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from './Icon';

const meta: ComponentMeta<typeof Icon> = {
  component: Icon,
};

export default meta;

export const Small: ComponentStoryObj<typeof Icon> = {
  args: {
    Size: 'small',
    Name: 'filter',
  },
};

export const Medium: ComponentStoryObj<typeof Icon> = {
  args: {
    Size: 'medium',
    Name: 'filter',
  },
};

export const Large: ComponentStoryObj<typeof Icon> = {
  args: {
    Size: 'large',
    Name: 'filter',
  },
};
