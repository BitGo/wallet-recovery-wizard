import {
  ComponentMeta,
  ComponentStoryObj,
  DecoratorFn,
} from '@storybook/react';
import { HashRouter } from 'react-router-dom';
import { RecoveryCoinsSelectAutocomplete } from './RecoveryCoinsSelectAutocomplete';

const RouterDecorator: DecoratorFn = (StoryFn, context) => {
  return <HashRouter>{StoryFn(context)}</HashRouter>;
};

const meta: ComponentMeta<typeof RecoveryCoinsSelectAutocomplete> = {
  title: 'Components/RecoveryCoinsSelectAutocomplete',
  component: RecoveryCoinsSelectAutocomplete,
  decorators: [RouterDecorator],
  args: {
    BitGoEnvironment: 'test',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof RecoveryCoinsSelectAutocomplete> =
  {};
