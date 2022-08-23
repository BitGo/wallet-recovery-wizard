import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Textfield } from './Textfield';

const meta: ComponentMeta<typeof Textfield> = {
  title: 'Components/Textfield',
  component: Textfield,
  args: {
    Disabled: false,
    HelperText: 'This is helper text',
    Invalid: false,
    Label: 'Label',
    placeholder: 'Placeholder',
    type: 'text',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Textfield> = {};
