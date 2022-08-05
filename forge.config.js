/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
// const { utils } = require("@electron-forge/core");
/**
 * @type {{
 *  packagerConfig: import('electron-packager').Options
 *  makers: ({
 *    name: '@electron-forge/maker-squirrel',
 *    config: import('@electron-forge/maker-squirrel').MakerSquirrelConfig
 *  } | {
 *    name: '@electron-forge/maker-dmg',
 *    config: import('@electron-forge/maker-dmg').MakerDMGConfig
 *  } |  {
 *    name: '@electron-forge/maker-deb',
 *    config: import('@electron-forge/maker-deb').MakerDebConfig
 *  } | {
 *    name: '@electron-forge/maker-rpm',
 *    config: import('@electron-forge/maker-rpm').MakerRpmConfig
 *  })[]
 *  plugins: [
 *    '@electron-forge/plugin-webpack',
 *    import('@electron-forge/plugin-webpack').WebpackPluginConfig
 *  ][]
 *  publishers: ({
 *    name: '@electron-forge/publisher-github',
 *    config: import('@electron-forge/publisher-github').PublisherGithubConfig
 *  })[]
 * }
 */
module.exports = {
  packagerConfig: {
    executableName: 'wallet-recovery-wizard',
    name: 'Wallet Recovery Wizard',
    icon: './assets/icon',
    extraResource: ['assets'],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Wallet Recovery Wizard',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          lintianOverrides: ['changelog-file-missing-in-native-package'],
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {},
      },
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              name: 'main_window',
              preload: {
                js: './src/renderer/preload.ts',
              },
            },
          ],
        },
      },
    ],
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'BitGo',
          name: 'wallet-recovery-wizard',
        },
        draft: false,
      },
    },
  ],
};
