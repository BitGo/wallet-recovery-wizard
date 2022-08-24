import type { StorybookViteConfig } from '@storybook/builder-vite';
import { loadConfigFromFile, mergeConfig } from 'vite';

const config: StorybookViteConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-react-router-v6',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  features: {
    interactionsDebugger: true,
    storyStoreV7: true,
  },
  async viteFinal(config, { configType }) {
    // @ts-ignore
    const { config: userConfig } = await loadConfigFromFile(
      // @ts-ignore
      '../vite.config.ts'
    );

    return mergeConfig(config, {
      ...userConfig,
      // manually specify plugins to avoid conflict
      plugins: [],
    });
  },
};

export default config;
