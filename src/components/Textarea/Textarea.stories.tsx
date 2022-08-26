import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: ComponentMeta<typeof Textarea> = {
  component: Textarea,
  args: {
    Disabled: false,
    HelperText: 'This is helper text',
    Invalid: false,
    Label: 'Label',
    placeholder: 'Placeholder',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Textarea> = {};
