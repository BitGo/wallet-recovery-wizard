import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { BackToHomeHelperText } from './BackToHomeHelperText';

const meta: ComponentMeta<typeof BackToHomeHelperText> = {
  component: BackToHomeHelperText,
  args: {
    env: 'test',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof BackToHomeHelperText> = {};
