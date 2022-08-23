import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import { HashRouter } from 'react-router-dom';
import { BackToHomeHeader } from './BackToHomeHeader';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof BackToHomeHeader> = {
  title: 'Components/BackToHomeHeader',
  component: BackToHomeHeader,
  args: {
    Title: 'Title',
  },
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof BackToHomeHeader> = {};
