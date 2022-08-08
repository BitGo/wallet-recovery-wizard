/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push(
  {
    test: /\.css$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
    ],
  },
  {
    test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
    type: 'asset',
  }
);

module.exports = {
  module: {
    rules,
  },
  target: 'web',
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
