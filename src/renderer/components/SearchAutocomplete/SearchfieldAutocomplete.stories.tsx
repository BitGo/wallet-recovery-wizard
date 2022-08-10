import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { SearchAutocomplete } from './SearchAutocomplete';
import { SearchAutocompleteItem } from './SearchAutocompleteItem';

const meta: ComponentMeta<typeof SearchAutocomplete> = {
  title: 'Components/SearchAutocomplete',
  component: SearchAutocomplete,
  args: {
    placeholder: 'Placeholder',
    children: [
      <SearchAutocompleteItem
        key="1"
        Title="Menu Item 1"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
      />,
      <SearchAutocompleteItem
        key="2"
        Title="Menu Item 2"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
      />,
      <SearchAutocompleteItem
        key="3"
        Title="Menu Item 3"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
      />,
      <SearchAutocompleteItem
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

export default meta;

export const Main: ComponentStoryObj<typeof SearchAutocomplete> = {};
