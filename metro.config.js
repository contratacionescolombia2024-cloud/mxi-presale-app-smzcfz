
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Add resolver configuration for Node.js built-ins
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser.js'),
    events: require.resolve('events/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    vm: require.resolve('vm-browserify'),
    assert: require.resolve('assert/'),
    util: require.resolve('util/'),
    string_decoder: require.resolve('string_decoder/'),
  },
};

module.exports = config;
