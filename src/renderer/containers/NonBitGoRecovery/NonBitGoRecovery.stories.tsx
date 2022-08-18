import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import NonBitGoRecovery from './NonBitGoRecovery';
import { HashRouter } from 'react-router-dom';
import { BitcoinForm, EthereumForm, NoCoinSelected, RippleForm } from './Forms';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof NonBitGoRecovery> = {
  title: 'containers/NonBitGoRecovery',
  component: NonBitGoRecovery,
  subcomponents: { BitcoinForm, EthereumForm, NoCoinSelected, RippleForm },
  decorators: [RouterDecorator],
  args: {
    BitGoEnvironment: 'test',
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof NonBitGoRecovery> = {};
