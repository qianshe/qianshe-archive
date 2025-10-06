/**
 * 用户验收测试 Playwright 配置
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.test.ts',

  /* 运行配置 */
  timeout: 30000,
  expect: {
    timeout: 10000
  },

  /* 并行执行配置 */
  fullyParallel: true,
  retries: 1,
  workers: process.env.CI ? 2 : 4,

  /* 测试报告配置 */
  reporter: [
    ['list'],
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],

  /* 项目配置 */
  use: {
    baseURL: process.env.PORTFOLIO_URL || 'https://portfolio.qianshe.top',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  /* 项目配置 */
  projects: [
    {
      name: 'portfolio',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PORTFOLIO_URL || 'https://portfolio.qianshe.top'
      }
    },
    {
      name: 'dashboard',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.DASHBOARD_URL || 'https://dashboard.qianshe.top'
      }
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.PORTFOLIO_URL || 'https://portfolio.qianshe.top'
      }
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        baseURL: process.env.PORTFOLIO_URL || 'https://portfolio.qianshe.top'
      }
    }
  ],

  /* Web服务器配置（用于本地测试） */
  webServer: {
    command: process.env.NODE_ENV === 'production' ? undefined : 'npm run dev',
    port: process.env.NODE_ENV === 'production' ? undefined : 8787,
    reuseExistingServer: true,
    timeout: 120000
  },

  /* 全局设置 */
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  /* 元件配置 */
  metadata: {
    testRunId: process.env.TEST_RUN_ID || Date.now().toString(),
    environment: process.env.NODE_ENV || 'test',
    version: '1.0.0',
    projectName: 'QianShe UAT'
  }
});
