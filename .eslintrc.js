
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import'],
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: ['/dist/*', '/public/*', '/babel-plugins/*', 'node_modules/', '.expo/'],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/ban-tslint-comment": "off",
    "react/no-unescaped-entities": "off",
    "import/no-unresolved": "off",
    "prefer-const": "warn",
    "react/prop-types": "off",
    "no-case-declarations": "off",
    "no-empty": "off",
    "react/display-name": "off",
    "no-var": "warn",
    "no-console": "off",
    "no-debugger": "warn",
    "no-unused-vars": "off",
    "react/jsx-key": "warn",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "warn",
  },
  overrides: [
    {
      files: ['metro.config.js', 'babel.config.js', 'webpack.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
