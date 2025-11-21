
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove the FileStore cache configuration that might be causing issues
config.cacheStores = [];

// Configure resolver with proper node module handling
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'cjs', 'mjs'],
  assetExts: config.resolver?.assetExts || [],
};

// Simplify transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
