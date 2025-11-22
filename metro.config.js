
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Configure resolver to handle Web3 packages
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs'],
  
  // Blacklist problematic packages on native platforms
  blockList: [
    // Block porto connector on native platforms (it only works on web)
    /node_modules\/porto\/.*/,
    /node_modules\/@wagmi\/connectors\/dist\/esm\/porto\.js/,
  ],
  
  resolveRequest: (context, moduleName, platform) => {
    // Skip porto imports on native platforms
    if (platform !== 'web' && (moduleName.includes('porto') || moduleName.includes('ox/'))) {
      return {
        type: 'empty',
      };
    }
    
    // Handle .js extensions in TypeScript imports
    if (moduleName.endsWith('.js')) {
      const withoutExtension = moduleName.replace(/\.js$/, '');
      try {
        // Try without extension first
        return context.resolveRequest(context, withoutExtension, platform);
      } catch (e) {
        try {
          // Try with .ts extension
          return context.resolveRequest(context, withoutExtension + '.ts', platform);
        } catch (e2) {
          // Try with .tsx extension
          try {
            return context.resolveRequest(context, withoutExtension + '.tsx', platform);
          } catch (e3) {
            // Fall through to default resolution
          }
        }
      }
    }
    
    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Add transformer configuration for better handling of node_modules
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
