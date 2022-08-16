import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import EthereumForm from './EthereumForm';
import { HashRouter } from 'react-router-dom';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof EthereumForm> = {
  title: 'containers/Forms/EthereumForm',
  component: EthereumForm,
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof EthereumForm> = {};
