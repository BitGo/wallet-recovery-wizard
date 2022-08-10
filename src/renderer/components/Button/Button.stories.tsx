import { expect } from '@storybook/jest';
import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { Icon } from '../Icon/Icon';
import { Button } from './Button';

const meta: ComponentMeta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  subcomponents: { IconLeft: Icon, IconRight: Icon },
  args: {
    Variant: 'primary',
    children: 'Button',
    Width: 'hug',
  },
  argTypes: {
    onClick: {
      action: 'onClick',
    },
  },
};

export default meta;

export const Primary: ComponentStoryObj<typeof Button> = {
  args: {
    Variant: 'primary',
  },
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(args.onClick).toHaveBeenCalled());
  },
};

export const Secondary: ComponentStoryObj<typeof Button> = {
  args: {
    Variant: 'secondary',
  },
};

export const Tertiary: ComponentStoryObj<typeof Button> = {
  args: {
    Variant: 'tertiary',
  },
};

export const Success: ComponentStoryObj<typeof Button> = {
  args: {
    Variant: 'success',
  },
};

export const Destructive: ComponentStoryObj<typeof Button> = {
  args: {
    Variant: 'destructive',
  },
};

export const Disabled: ComponentStoryObj<typeof Button> = {
  args: {
    Disabled: true,
    disabled: true,
  },
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(args.onClick).not.toHaveBeenCalled());
  },
};

export const Link: ComponentStoryObj<typeof Button> = {
  args: {
    Tag: 'a',
    href: 'http://example.com',
    target: '_blank',
  },
};

export const Hug: ComponentStoryObj<typeof Button> = {
  args: {
    Width: 'hug',
  },
};

export const Fill: ComponentStoryObj<typeof Button> = {
  args: {
    Width: 'fill',
  },
};

export const IconLeft: ComponentStoryObj<typeof Button> = {
  args: {
    IconLeft: <Icon Name="filter" Size="small" />,
  },
};

export const IconRight: ComponentStoryObj<typeof Button> = {
  args: {
    IconRight: <Icon Name="filter" Size="small" />,
  },
};
