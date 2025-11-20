
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Add resolver configuration for Node.js polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    events: require.resolve('events/'),
    process: require.resolve('process/browser'),
  },
};

module.exports = config;
