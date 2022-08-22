/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  target: 'electron-main',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve('src', 'assets'),
          to: path.resolve('.webpack', 'assets'),
        },
      ],
    }),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
  ],
  node: {
    __dirname: true,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  externals: {
    hexoid: 'hexoid',
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer:
      process.env.NODE_ENV === 'production'
        ? [
            new TerserPlugin({
              terserOptions: {
                warnings: false,
                compress: {
                  comparisons: false,
                },
                parse: {},
                mangle: {
                  reserved: ['BigInteger', 'ECPair', 'Point', 'BIP32'],
                },
                output: {
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
            }),
          ]
        : [],
  },
};
