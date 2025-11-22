
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// List of Web3 packages to block on native platforms
const WEB3_PACKAGES = [
  'porto',
  '@wagmi/connectors',
  '@wagmi/core',
  '@web3modal/wagmi',
  '@web3modal/base',
  '@web3modal/scaffold',
  '@web3modal/ui',
  '@web3modal/core',
  '@web3modal/siwe',
  'wagmi',
  'viem',
  'ox',
  '@reown',
  '@walletconnect',
];

// List of native-only packages to block on web
const NATIVE_ONLY_PACKAGES = [
  'react-native-gesture-handler',
];

// List of native-only React Native internal modules to block on web
const NATIVE_ONLY_MODULES = [
  'react-native/Libraries/Core/InitializeCore',
  'react-native/Libraries/ReactPrivate/ReactNativePrivateInitializeCore',
  'react-native/Libraries/Utilities/codegenNativeComponent',
];

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  
  // Ensure platform-specific extensions are resolved correctly
  sourceExts: [
    'native.tsx',
    'native.ts',
    'native.jsx',
    'native.js',
    'ios.tsx',
    'ios.ts',
    'ios.jsx',
    'ios.js',
    'android.tsx',
    'android.ts',
    'android.jsx',
    'android.js',
    'web.tsx',
    'web.ts',
    'web.jsx',
    'web.js',
    ...(config.resolver?.sourceExts || []),
    'mjs',
    'cjs',
  ],
  
  resolveRequest: (context, moduleName, platform) => {
    // Block Web3 packages on native platforms
    if (platform !== 'web') {
      for (const pkg of WEB3_PACKAGES) {
        if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
          console.log(`🚫 Metro: Blocking ${moduleName} on ${platform}`);
          return { type: 'empty' };
        }
      }
    }
    
    // Block native-only packages on web platform
    if (platform === 'web') {
      for (const pkg of NATIVE_ONLY_PACKAGES) {
        if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
          console.log(`🚫 Metro: Blocking native module ${moduleName} on web`);
          return { type: 'empty' };
        }
      }
      
      // Block native-only React Native internal modules
      for (const module of NATIVE_ONLY_MODULES) {
        if (moduleName === module) {
          console.log(`🚫 Metro: Blocking native-only internal module ${moduleName} on web`);
          return { type: 'empty' };
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
