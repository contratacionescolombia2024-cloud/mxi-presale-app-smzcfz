
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
    buffer: path.resolve(__dirname, 'node_modules/buffer/'),
    stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
    crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
    events: path.resolve(__dirname, 'node_modules/events/'),
    process: path.resolve(__dirname, 'node_modules/process/browser.js'),
    vm: path.resolve(__dirname, 'node_modules/vm-browserify'),
    util: path.resolve(__dirname, 'node_modules/util/'),
  },
  sourceExts: [...(config.resolver.sourceExts || []), 'cjs'],
};

// Add custom resolver to handle polyfills
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Map Node.js built-ins to their polyfills
  const polyfillMap = {
    'buffer': path.resolve(__dirname, 'node_modules/buffer/'),
    'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
    'crypto': path.resolve(__dirname, 'node_modules/crypto-browserify'),
    'events': path.resolve(__dirname, 'node_modules/events/'),
    'process': path.resolve(__dirname, 'node_modules/process/browser.js'),
    'vm': path.resolve(__dirname, 'node_modules/vm-browserify'),
    'util': path.resolve(__dirname, 'node_modules/util/'),
  };

  if (polyfillMap[moduleName]) {
    return {
      filePath: polyfillMap[moduleName],
      type: 'sourceFile',
    };
  }

  // Use the original resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
