import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { Menu, MenuItem } from '../Menu';
import { Searchfield } from '../Searchfield';
import { Popover } from './Popover';

const meta: ComponentMeta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    open: true,
    Target: <Searchfield />,
    children: (
      <Menu Tag="nav">
        <MenuItem
          Title="Menu Item 1"
          Description="Testnet Bitcoin"
          IconLeft={<Icon Name="download" Size="large" />}
          Meta="Meta"
          Tag="button"
        />
        <MenuItem
          Title="Menu Item 2"
          Description="Testnet Bitcoin"
          IconLeft={<Icon Name="download" Size="large" />}
          Meta="Meta"
          Tag="button"
        />
        <MenuItem
          Title="Menu Item 3"
          Description="Testnet Bitcoin"
          IconLeft={<Icon Name="download" Size="large" />}
          Meta="Meta"
          Tag="button"
        />
        <MenuItem
          Title="Menu Item 4"
          Description="Testnet Bitcoin"
          IconLeft={<Icon Name="download" Size="large" />}
          Meta="Meta"
          Tag="button"
        />
      </Menu>
    ),
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Popover> = {};
