import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      // Dependencies
      'node_modules/**',
      '**/node_modules/**',

      // Build outputs
      'dist/**',
      'build/**',
      '**/dist/**',
      '**/build/**',

      // Static assets and generated files
      'static/**',
      '**/static/**',
      '*.min.js',
      '*.min.css',
      '*.min.*',

      // Cache and logs
      '.cache/**',
      '*.cache',
      '*.log',
      'logs/**',

      // Environment files
      '.env*',

      // Package manager locks
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',

      // IDE files
      '.vscode/**',
      '.idea/**',
      '*.swp',
      '*.swo',

      // Test coverage
      'coverage/**',

      // Tests
      'tests/**',
      '**/tests/**',

      // Type definitions (interface/type declarations with unused params are normal)
      '**/types/**',
      'shared/types/**',
      '**/*.d.ts',

      // Scripts (console statements and utility scripts)
      'scripts/**',
      '**/scripts/**',

      // OS files
      '.DS_Store',
      'Thumbs.db',

      // Deployment artifacts
      'worker/dist/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      react: {
        version: 'detect'
      }
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Node.js and browser globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        URL: 'readonly',
        performance: 'readonly',
        PerformanceObserver: 'readonly',

        // Web API globals
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // DOM globals
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLElement: 'readonly',
        Document: 'readonly',
        Window: 'readonly',

        // Cloudflare Workers globals
        D1Database: 'readonly',
        KVNamespace: 'readonly',
        R2Bucket: 'readonly',
        ScheduledEvent: 'readonly',
        env: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react-hooks': reactHooks
    },
    rules: {
      // TypeScript rules - relaxed for large codebase
      '@typescript-eslint/no-unused-vars': [
        'warn',  // Changed from 'error' to 'warn'
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      'no-unused-vars': 'off',  // Let TypeScript handle this
      '@typescript-eslint/no-explicit-any': 'off',  // Allow any types

      // React Hooks rules - disabled due to compatibility issues
      // 'react-hooks/rules-of-hooks': 'error',
      // 'react-hooks/exhaustive-deps': 'warn',

      // General rules - relaxed
      'no-console': 'off',  // Allow console in all files
      'no-debugger': 'warn',  // Changed to warn
      'no-alert': 'warn',
      'no-eval': 'error',  // Keep as error (security)
      'no-implied-eval': 'error',  // Keep as error (security)
      'no-new-func': 'warn',
      'no-script-url': 'warn',
      'no-unused-expressions': 'warn',  // Changed to warn
      'no-use-before-define': 'off',
      'prefer-const': 'warn',  // Changed to warn
      'no-var': 'warn',  // Changed to warn
      'object-shorthand': 'off',  // Disabled
      'prefer-arrow-callback': 'off',  // Disabled
      'prefer-template': 'off',  // Disabled
      'template-curly-spacing': 'off',
      'arrow-spacing': 'off',
      // Code style - all disabled for flexibility
      'comma-dangle': 'off',
      quotes: 'off',
      semi: 'off',
      indent: 'off',
      'max-len': 'off',
      
      // Additional relaxed rules
      'no-undef': 'warn',
      'no-prototype-builtins': 'warn',
      'no-case-declarations': 'warn',
      'no-redeclare': 'warn',
      'no-empty-pattern': 'warn'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn'
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {}
  },
  {
    files: ['vite.config.ts', 'tailwind.config.js', 'postcss.config.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  }
];
