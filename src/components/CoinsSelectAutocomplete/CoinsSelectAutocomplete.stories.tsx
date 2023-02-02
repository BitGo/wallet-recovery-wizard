import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import {
  buildUnsignedSweepCoins,
  nonBitgoRecoveryCoins,
} from '~/helpers/config';
import { BackToHomeHelperText } from '../BackToHomeHelperText';
import { CoinsSelectAutocomplete } from './CoinsSelectAutocomplete';

const meta: ComponentMeta<typeof CoinsSelectAutocomplete> = {
  component: CoinsSelectAutocomplete,
  parameters: {
    reactRouter: {
      initialEntries: ['/test/coins-select-autocomplete'],
      RouteComponent({ children }: { children: React.ReactNode }) {
        return (
          <Routes>
            <Route path="/:env/coins-select-autocomplete" element={children} />
          </Routes>
        );
      },
    },
  },
};

export default meta;

export const TestnetBuildUnsignedSweep: ComponentStoryObj<
  typeof CoinsSelectAutocomplete
> = {
  args: {
    coins: buildUnsignedSweepCoins['test'],
    helperText: <BackToHomeHelperText env={'test'} />,
  },
};

export const MainnetBuildUnsignedSweep: ComponentStoryObj<
  typeof CoinsSelectAutocomplete
> = {
  args: {
    coins: buildUnsignedSweepCoins['prod'],
    helperText: <BackToHomeHelperText env={'prod'} />,
  },
};

export const TestnetNonBitgoRecovery: ComponentStoryObj<
  typeof CoinsSelectAutocomplete
> = {
  args: {
    coins: nonBitgoRecoveryCoins['test'],
    helperText: <BackToHomeHelperText env={'test'} />,
  },
};

export const MainnetNonBitgoRecovery: ComponentStoryObj<
  typeof CoinsSelectAutocomplete
> = {
  args: {
    coins: nonBitgoRecoveryCoins['prod'],
    helperText: <BackToHomeHelperText env={'prod'} />,
  },
};
