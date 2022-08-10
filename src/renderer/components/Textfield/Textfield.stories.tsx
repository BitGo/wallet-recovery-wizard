import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Textfield } from './Textfield';

const meta: ComponentMeta<typeof Textfield> = {
  title: 'Components/Textfield',
  component: Textfield,
  args: {
    Label: 'Label',
    HelperText: 'This is helper text',
    type: 'text',
    placeholder: 'Placeholder',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Textfield> = {};
