import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { AlertBanner } from './AlertBanner';

const meta: ComponentMeta<typeof AlertBanner> = {
  component: AlertBanner,
  args: {
    Variant: 'destructive',
    children: [<span key="1">This is a warning!</span>],
  },
};

export default meta;

export const NoIcon: ComponentStoryObj<typeof AlertBanner> = {};

export const IconLeft: ComponentStoryObj<typeof AlertBanner> = {
  args: {
    IconLeft: <Icon Name="warning-sign" Size="small" />,
  },
};

export const IconRight: ComponentStoryObj<typeof AlertBanner> = {
  args: {
    IconRight: <Icon Name="warning-sign" Size="small" />,
  },
};
