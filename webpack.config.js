
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@walletconnect',
          'ethereumjs-util',
          'ethers',
          '@ethersproject',
        ],
      },
    },
    argv
  );

  // Add polyfills for Node.js built-ins
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    events: require.resolve('events/'),
    process: require.resolve('process/browser'),
    vm: require.resolve('vm-browserify'),
    util: require.resolve('util/'),
    http: false,
    https: false,
    os: false,
    url: false,
    assert: false,
    zlib: false,
    path: false,
    fs: false,
  };

  // Add ProvidePlugin to inject globals automatically
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  // Add DefinePlugin to define process.env
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.browser': 'true',
    })
  );

  return config;
};
