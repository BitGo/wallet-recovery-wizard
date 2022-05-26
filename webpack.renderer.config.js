const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const webpack = require('webpack')
const relocateLoader = require('@vercel/webpack-asset-relocator-loader');
const FileManagerPlugin = require('filemanager-webpack-plugin');

function getOptimization() {
  if (process.env.NODE_ENV !== 'production') {
    return {
      runtimeChunk: true,
    }
  }
  return {
    minimize: false,
  }
}

module.exports = {
  target: 'electron-renderer',
  module: {
    rules: [
      // fixes this weird issue: https://github.com/ashtuchkin/iconv-lite/issues/205
      {
        test: /node_modules[\/\\](iconv-lite)[\/\\].+/,
        resolve: {
          aliasFields: ['main'],
        },
      },
      // Add support for native node modules
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
            outputAssetBase: 'native_modules',
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2020',
          tsconfigRaw: require('./tsconfig.json'),
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|ico)$/,
        use: [
          {
            loader: 'file-loader',
            // https://github.com/nfl/react-helmet/issues/448
            options: { esModule: false },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'svg-url-loader'],
      },
    ],
  },
  optimization: getOptimization(),
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.IS_DEVELOPMENT': JSON.stringify(process.env.IS_DEVELOPMENT),
    }),
    {
      apply(compiler) {
        compiler.hooks.compilation.tap("@vercel/webpack-asset-relocator-loader", compilation => {
          relocateLoader.initAssetCache(compilation, 'native_modules');
        });
      }
    },
    new FileManagerPlugin({
      runOnceInWatchMode: true,
      events: {
        onStart: {
          // Hack to make sure we use the node opengpg version, for some reason
          // the bitgojs bundle is referencing the browser version
          delete: ['./node_modules/openpgp/dist/openpgp.min.mjs'],
          copy: [
            {
              source: './node_modules/openpgp/dist/node/openpgp.min.mjs',
              destination: `./node_modules/openpgp/dist/openpgp.min.mjs`,
            },
          ],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      // https://stackoverflow.com/a/57758576
      // react-dom should be only installed in app in order for react hooks and
      // react router to work
      react: path.resolve(process.cwd(), 'node_modules/react'),
      'react-router': path.resolve(process.cwd(), 'node_modules/react-router'),
      'react-router-dom': path.resolve(process.cwd(), 'node_modules/react-router-dom'),
      'theme-ui': path.resolve(process.cwd(), 'node_modules/theme-ui'),
      formik: path.resolve(process.cwd(), 'node_modules/formik'),
      vm2: path.resolve(process.cwd(), 'node_modules/vm2'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
}
