import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.cache/**',
      'backend/node_modules/**',
      'coverage/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        node: true,
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      // Module resolution
      'no-undef': 'error',  // Catch undefined variables (including from bad imports)
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',

      // Potential errors
      'no-duplicate-imports': 'error',
      'no-self-assign': 'error',
      'no-return-await': 'warn',

      // Code quality
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error'
    }
  },
  {
    // Backend-specific rules
    files: ['backend/**/*.js'],
    rules: {
      'no-throw-literal': 'error',
      'no-async-promise-executor': 'warn'
    }
  },
  {
    // Test files
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  }
];
