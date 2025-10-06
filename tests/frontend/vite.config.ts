/**
 * 前端测试Vite配置
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./setup.tsx'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.config.*', '**/*.d.ts', 'dist/', 'coverage/'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        // Portfolio组件覆盖率要求
        './portfolio/**/*.{js,jsx,ts,tsx}': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        },
        // Dashboard组件覆盖率要求
        './dashboard/**/*.{js,jsx,ts,tsx}': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: [
      'portfolio/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'dashboard/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'utils/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: ['node_modules/', 'dist/', '.idea/', '.git/', '.cache/'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json'
    },
    watch: false,
    singleThread: false,
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    isolate: true,
    dangerouslyIgnoreUnhandledErrors: false,
    passWithNoTests: false,
    logHeapUsage: true,
    bail: 0,
    retry: 2,
    sequence: {
      concurrent: true,
      shuffle: false,
      seed: 42
    },
    env: {
      NODE_ENV: 'test',
      CI: process.env.CI || false
    },
    onConsoleLog: (log, type) => {
      // 过滤掉一些不必要的日志
      if (type === 'warning' && log.includes('React Strict Mode')) {
        return false;
      }
      if (type === 'log' && log.includes('[vite]')) {
        return false;
      }
      return true;
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
      '@portfolio': path.resolve(__dirname, '../../portfolio/src'),
      '@dashboard': path.resolve(__dirname, '../../dashboard/src'),
      '@shared': path.resolve(__dirname, '../../shared')
    }
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    __DEV__: true,
    __TEST__: true
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
});
