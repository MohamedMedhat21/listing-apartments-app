// Shared ESLint 9 flat config, imported by apps/api. apps/web extends
// eslint-config-next directly (see apps/web/eslint.config.mjs) because
// Next's flat preset is not composable the same way; the rules below are
// still the intended baseline for all TypeScript in this repo.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.js',
      '**/*.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Deliberately NOT enabling @typescript-eslint/consistent-type-imports:
      // its autofix converts constructor-parameter imports to `import type`
      // whenever a class is only referenced as a type in that file. NestJS's
      // DI container reads the runtime class reference via reflect-metadata,
      // so that "fix" silently breaks dependency injection. `lint-staged`
      // runs `eslint --fix` from the repo root during every commit, and
      // ESLint's flat config resolves from cwd only (it does not search
      // into subdirectories for a nearer config), so a per-app override
      // cannot shield apps/api from this rule during a commit. Not enabling
      // it anywhere is the only reliable fix.
    },
  },
);
