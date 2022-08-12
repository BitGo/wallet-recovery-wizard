import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import Home from './Home';
import { HashRouter } from 'react-router-dom';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof Home> = {
  title: 'containers/Home',
  component: Home,
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof Home> = {};
