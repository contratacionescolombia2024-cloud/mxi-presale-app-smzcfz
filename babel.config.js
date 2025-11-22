
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            buffer: 'buffer',
            process: 'process/browser.js',
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
          },
        },
      ],
    ],
  };
};
