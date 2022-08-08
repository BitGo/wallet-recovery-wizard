/* eslint-env node */

module.exports = [
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: '.',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: require.resolve('swc-loader'),
      options: {
        env: {
          coreJs: '3.22',
        },
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            dynamicImport: true,
          },
          target: 'es2019',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    },
  },
  {
    test: /\.(png|jpe?g|gif|svg|ico|icns)$/i,
    type: 'asset/resource',
  },
];
