import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import NonBitGoRecovery from './NonBitGoRecovery';
import { HashRouter } from 'react-router-dom';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof NonBitGoRecovery> = {
  title: 'containers/NonBitGoRecovery',
  component: NonBitGoRecovery,
  decorators: [RouterDecorator],
};

export default meta;

export const Main: ComponentStoryObj<typeof NonBitGoRecovery> = {};
