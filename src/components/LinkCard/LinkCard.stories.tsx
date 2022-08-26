import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { LinkCard } from './LinkCard';
import { LinkCardItem } from './LinkCardItem';

const meta: ComponentMeta<typeof LinkCard> = {
  component: LinkCard,
  subcomponents: { LinkCardItem },
  args: {
    Title: 'Available Offline',
    Width: 'fill',
    children: [
      <LinkCardItem
        key="1"
        href="https://example.com"
        target="_blank"
        Title="Non-BitGo Recovery"
        Description="Recover wallets using the user and backup key (sign a transaction without BitGo)."
      />,
      <LinkCardItem
        key="2"
        href="https://example.com"
        target="_blank"
        Title="Build Unsigned Sweep"
        Description="Build an unsigned transaction to sweep a wallet without using BitGo."
      />,
    ],
  },
};

export default meta;

export const Main: ComponentStoryObj<typeof LinkCard> = {};
