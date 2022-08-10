import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Selectfield } from './Selectfield';

const meta: ComponentMeta<typeof Selectfield> = {
  title: 'Components/Selectfield',
  component: Selectfield,
  args: {
    Label: 'Label',
    children: [
      <option key="">Select One</option>,
      <option key="apple">Apple</option>,
      <option key="orange">Orange</option>,
    ],
    HelperText: 'This is helper text',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof Selectfield> = {};
