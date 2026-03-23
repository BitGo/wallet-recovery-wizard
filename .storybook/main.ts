import type { StorybookViteConfig } from '@storybook/builder-vite';
import { resolve as pathResolve } from 'path';
import { mergeConfig } from 'vite';

const config: StorybookViteConfig = {
  stories: [
    { titlePrefix: 'Components', directory: '../src/components' },
    { titlePrefix: 'Containers', directory: '../src/containers' },
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    './react-router-storybook-addon',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    buildStoriesJson: true,
    interactionsDebugger: true,
    storyStoreV7: true,
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: { alias: { '~': pathResolve(__dirname, '../src') } },
      plugins: [],
    });
  },
};

export default config;
