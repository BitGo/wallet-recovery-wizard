import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { Notice } from './Notice';

const meta: ComponentMeta<typeof Notice> = {
  title: 'Components/Notice',
  component: Notice,
  args: {
    Variant: 'Secondary',
    children: [<span key="1">This is a notice.</span>],
  },
};

export default meta;

export const NoIcon: ComponentStoryObj<typeof Notice> = {};

export const IconLeft: ComponentStoryObj<typeof Notice> = {
  args: {
    IconLeft: <Icon Name="warning-sign" Size="small" />,
  },
};

export const IconRight: ComponentStoryObj<typeof Notice> = {
  args: {
    IconRight: <Icon Name="warning-sign" Size="small" />,
  },
};
