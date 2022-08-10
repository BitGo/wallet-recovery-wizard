import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Icon } from '../Icon';
import { SelectAutocomplete } from './SelectAutocomplete';
import { SelectAutocompleteItem } from './SelectAutocompleteItem';

const meta: ComponentMeta<typeof SelectAutocomplete> = {
  title: 'Components/SelectAutocomplete',
  component: SelectAutocomplete,
  args: {
    placeholder: 'Placeholder',
    children: [
      <SelectAutocompleteItem
        key="1"
        Title="Menu Item 1"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
        value="1"
      />,
      <SelectAutocompleteItem
        key="2"
        Title="Menu Item 2"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
        value="2"
      />,
      <SelectAutocompleteItem
        key="3"
        Title="Menu Item 3"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
        value="3"
      />,
      <SelectAutocompleteItem
        key="4"
        Title="Menu Item 4"
        Description="Testnet Bitcoin"
        IconLeft={<Icon Name="download" Size="large" />}
        Meta="Meta"
        Tag="button"
        value="4"
      />,
    ],
    Label: 'Label',
    HelperText: 'This is helper text',
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof SelectAutocomplete> = {};
