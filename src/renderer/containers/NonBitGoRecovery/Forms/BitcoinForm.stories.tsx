import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import BitcoinForm from './BitcoinForm';
import { HashRouter } from 'react-router-dom';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof BitcoinForm> = {
  title: 'containers/Forms/BitcoinForm',
  component: BitcoinForm,
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof BitcoinForm> = {};
