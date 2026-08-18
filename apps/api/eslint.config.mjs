import rootConfig from '../../eslint.config.mjs';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
