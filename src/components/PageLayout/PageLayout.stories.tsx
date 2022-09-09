import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { PageLayout } from './PageLayout';

const meta: ComponentMeta<typeof PageLayout> = {
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    Title: 'Title',
    Description: 'Description',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof PageLayout> = {};
