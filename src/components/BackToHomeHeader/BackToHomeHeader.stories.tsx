import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { BackToHomeHeader } from './BackToHomeHeader';

const meta: ComponentMeta<typeof BackToHomeHeader> = {
  component: BackToHomeHeader,
  args: {
    Title: 'Title',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof BackToHomeHeader> = {};
