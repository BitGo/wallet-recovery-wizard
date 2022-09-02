import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { SuccessfulRecovery } from './SuccessfulRecovery';

const meta: ComponentMeta<typeof SuccessfulRecovery> = {
  component: SuccessfulRecovery,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof SuccessfulRecovery> = {};
