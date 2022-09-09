import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Selectfield } from './Selectfield';

const meta: ComponentMeta<typeof Selectfield> = {
  component: Selectfield,
  args: {
    children: [
      <option key="">Select One</option>,
      <option key="apple">Apple</option>,
      <option key="orange">Orange</option>,
    ],
    Disabled: false,
    HelperText: 'This is helper text',
    Invalid: false,
    Label: 'Label',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Selectfield> = {};
