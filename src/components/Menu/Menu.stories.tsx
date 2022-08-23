import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

const meta: ComponentMeta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  subcomponents: { MenuItem },
  args: {
    children: [
      <MenuItem key="1" Title="Menu Item 1" />,
      <MenuItem key="2" Title="Menu Item 2" Description="Testnet Bitcoin" />,
      <MenuItem
        key="3"
        Title="Menu Item 3"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
      />,
      <MenuItem
        key="4"
        Title="Menu Item 4"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
      />,
    ],
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Menu> = {};

export const NavTag: ComponentStoryObj<typeof Menu> = {
  args: {
    Tag: 'nav',
    children: [
      <MenuItem key="1" Title="Menu Item 1" Tag="button" />,
      <MenuItem
        key="2"
        Title="Menu Item 2"
        Description="Testnet Bitcoin"
        Tag="button"
      />,
      <MenuItem
        key="3"
        Title="Menu Item 3"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Tag="button"
      />,
      <MenuItem
        key="4"
        Title="Menu Item 4"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
      />,
    ],
  },
};
