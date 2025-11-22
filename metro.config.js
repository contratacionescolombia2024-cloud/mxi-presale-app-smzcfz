
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
  // IMPORTANT: Order matters! More specific extensions should come first
  sourceExts: [
    // Platform-specific extensions (most specific first)
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
    // Default extensions
    ...(config.resolver?.sourceExts || []),
    'mjs',
    'cjs',
  ],
  
  resolveRequest: (context, moduleName, platform) => {
    // Block Web3 packages on native platforms (iOS and Android)
    if (platform !== 'web') {
      // Check if the module is a Web3 package or starts with one
      for (const pkg of WEB3_PACKAGES) {
        if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
          console.log(`🚫 Metro: Blocking Web3 package "${moduleName}" on ${platform}`);
          return { type: 'empty' };
        }
      }
      
      // Block any .web.* files from being loaded on native
      if (moduleName.includes('.web.')) {
        console.log(`🚫 Metro: Blocking web-specific file "${moduleName}" on ${platform}`);
        return { type: 'empty' };
      }
      
      // Block web3Config.web specifically
      if (moduleName.includes('web3Config.web') || moduleName.includes('config/web3Config.web')) {
        console.log(`🚫 Metro: Blocking web3Config.web on ${platform}`);
        return { type: 'empty' };
      }
      
      // Block WalletContext.web specifically
      if (moduleName.includes('WalletContext.web') || moduleName.includes('contexts/WalletContext.web')) {
        console.log(`🚫 Metro: Blocking WalletContext.web on ${platform}`);
        return { type: 'empty' };
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
