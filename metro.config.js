
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs'],
  
  resolveRequest: (context, moduleName, platform) => {
    // Block Web3 packages on native platforms only
    const web3Packages = [
      'porto',
      '@wagmi/connectors',
      '@web3modal/wagmi',
      '@web3modal/base',
      '@web3modal/scaffold',
      '@web3modal/ui',
      'wagmi',
      'viem',
      'ox/',
    ];

    if (platform !== 'web') {
      for (const pkg of web3Packages) {
        if (moduleName.includes(pkg)) {
          return { type: 'empty' };
        }
      }
    }
    
    // Handle .js extensions in TypeScript imports
    if (moduleName.endsWith('.js')) {
      const withoutExtension = moduleName.replace(/\.js$/, '');
      try {
        return context.resolveRequest(context, withoutExtension, platform);
      } catch (e) {
        try {
          return context.resolveRequest(context, withoutExtension + '.ts', platform);
        } catch (e2) {
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
