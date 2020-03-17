module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@digihcs/acexis'],
  extends: [
    './node_modules/@digihcs/eslint-plugin-acexis/eslintDefaultsBackend.js'
    // 'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: 'module'
  },
  rules: {
  },
};
