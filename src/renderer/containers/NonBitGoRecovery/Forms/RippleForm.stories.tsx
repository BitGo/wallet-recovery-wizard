import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import RippleForm from './RippleForm';
import { HashRouter } from 'react-router-dom';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof RippleForm> = {
  title: 'containers/Forms/RippleForm',
  component: RippleForm,
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof RippleForm> = {};
