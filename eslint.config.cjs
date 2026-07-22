const tsPlugin = require('@typescript-eslint/eslint-plugin');
const functional = require('eslint-plugin-functional');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      functional,
    },
    rules: {
      // include TypeScript recommended rules from the plugin
      ...(tsPlugin && tsPlugin.configs && tsPlugin.configs.recommended && tsPlugin.configs.recommended.rules ? tsPlugin.configs.recommended.rules : {}),
      'functional/no-expression-statement': 'off',
    },
  },
];
