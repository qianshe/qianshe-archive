import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',

    // 全局设置
    globals: true,

    // 测试超时时间
    testTimeout: 30000,

    // hook超时时间
    hookTimeout: 30000,

    // 并发测试
    threads: true,

    // 测试文件匹配模式
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'tests/**/*.test.{js,ts,jsx,tsx}'],

    // 排除文件
    exclude: ['node_modules', 'dist', '.git', 'coverage'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.config.{js,ts}', '**/dist/**', 'coverage/**'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // 环境变量
    env: {
      NODE_ENV: 'test'
    },

    // 设置文件
    setupFiles: ['tests/setup.ts']
  },

  // 解析配置
  resolve: {
    alias: {
      '@': './src',
      '@tests': './tests'
    }
  }
});
