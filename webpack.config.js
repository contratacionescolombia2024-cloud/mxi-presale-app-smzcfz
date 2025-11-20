
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@walletconnect'],
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
    http: false,
    https: false,
    os: false,
    url: false,
    assert: false,
    zlib: false,
    path: false,
    fs: false,
  };

  // Add ProvidePlugin to inject globals
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  return config;
};
