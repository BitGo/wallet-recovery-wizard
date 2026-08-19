import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import App from '../App';

const meta: ComponentMeta<typeof App> = {
  component: App,
  parameters: {
    reactRouter: {
      initialEntries: ['/test/non-bitgo-recovery/btc/success'],
    },
    layout: 'fullscreen',
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof App> = {};

export const WithTransactionHex: ComponentStoryObj<typeof App> = {
  parameters: {
    reactRouter: {
      initialEntries: [
        {
          pathname: '/test/non-bitgo-recovery/btc/success',
          state: {
            txHex:
              '02000000000101aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899' +
              '0000000000ffffffff02c0c62d0000000000160014aabbccddeeff00112233445566778899aabb' +
              '00000000000000000000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      ],
    },
    layout: 'fullscreen',
  },
};
