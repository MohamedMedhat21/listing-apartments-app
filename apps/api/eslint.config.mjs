import rootConfig from '../../eslint.config.mjs';
import globals from 'globals';

export default [
  ...rootConfig,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      // NestJS's DI container reads the runtime class reference from
      // constructor parameter types via reflect-metadata. `import type`
      // erases that reference at compile time, silently breaking injection
      // for any provider imported that way. Not safe to enable here.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
