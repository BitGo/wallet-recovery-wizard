import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: ComponentMeta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    Label: 'Label',
    HelperText: 'This is helper text',
    placeholder: 'Placeholder',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Textarea> = {};
