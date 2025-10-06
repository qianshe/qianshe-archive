/**
 * 测试设置文件
 * 配置测试环境、全局变量和辅助函数
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// 全局测试配置
declare global {
  namespace globalThis {
    var testConfig: {
      portfolioUrl: string;
      dashboardUrl: string;
      testUser: {
        email: string;
        password: string;
        adminEmail: string;
        adminPassword: string;
      };
    };
  }
}

// 设置全局测试配置
beforeAll(async () => {
  // 从环境变量读取配置
  globalThis.testConfig = {
    portfolioUrl: process.env.PORTFOLIO_TEST_URL || 'http://localhost:8787',
    dashboardUrl: process.env.DASHBOARD_TEST_URL || 'http://localhost:8788',
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'testpassword123',
      adminEmail: process.env.TEST_ADMIN_EMAIL || 'admin@qianshe.top',
      adminPassword: process.env.TEST_ADMIN_PASSWORD || 'admin123'
    }
  };

  console.info('Test environment setup completed');
  console.info('Portfolio URL:', globalThis.testConfig.portfolioUrl);
  console.info('Dashboard URL:', globalThis.testConfig.dashboardUrl);
});

afterAll(async () => {
  console.info('Test environment cleanup completed');
});

// 每个测试前的清理
beforeEach(async () => {
  // 可以在这里添加每个测试前的准备工作
});

afterEach(async () => {
  // 可以在这里添加每个测试后的清理工作
});

// 测试辅助函数
export const testHelpers = {
  /**
   * 获取认证token
   */
  async getAuthToken(url: string, email: string, password: string): Promise<string> {
    const response = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.status !== 200) {
      throw new Error(`Failed to authenticate: ${response.status}`);
    }

    const data = await response.json();
    return data.data.token;
  },

  /**
   * 等待指定时间
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 生成随机测试数据
   */
  generateTestData: {
    email: (prefix: string = 'test') => `${prefix}-${Date.now()}@example.com`,
    username: (prefix: string = 'testuser') => `${prefix}${Date.now()}`,
    title: (prefix: string = 'Test') => `${prefix} Title ${Date.now()}`,
    slug: (prefix: string = 'test') => `${prefix}-${Date.now()}`,
    content: (prefix: string = 'Test') =>
      `This is ${prefix} content created at ${new Date().toISOString()}`
  },

  /**
   * 清理测试数据
   */
  async cleanupTestData(url: string, token: string, testIds: number[]): Promise<void> {
    for (const id of testIds) {
      try {
        await fetch(`${url}/api/test/cleanup/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (_error) {
        console.warn(`Failed to cleanup test data ${id}:`, error);
      }
    }
  },

  /**
   * 创建测试用的评论
   */
  async createTestComment(url: string, postId: number, commentData?: any): Promise<any> {
    const defaultComment = {
      post_id: postId,
      user_name: 'Test Commenter',
      user_email: `commenter-${Date.now()}@example.com`,
      content: 'This is a test comment'
    };

    const response = await fetch(`${url}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...defaultComment, ...commentData })
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create test comment: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * 验证API响应格式
   */
  validateApiResponse(response: any, expectedSuccess: boolean = true): void {
    expect(response).toHaveProperty('success');
    expect(response.success).toBe(expectedSuccess);

    if (expectedSuccess) {
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('error');
    }

    expect(response).toHaveProperty('timestamp');
    expect(response).toHaveProperty('code');
  },

  /**
   * 检查性能指标
   */
  checkPerformanceMetrics(response: Response, maxResponseTime: number = 2000): void {
    const responseTime = response.headers.get('X-Response-Time');
    if (responseTime) {
      const time = parseInt(responseTime);
      expect(time).toBeLessThan(maxResponseTime);
    }

    // 检查缓存头
    const cacheControl = response.headers.get('Cache-Control');
    if (cacheControl) {
      expect(cacheControl).toMatch(/public|private|no-cache/);
    }
  },

  /**
   * 模拟用户行为
   */
  async simulateUserBehavior(
    url: string,
    actions: Array<{
      type: 'visit' | 'comment' | 'like';
      data?: any;
    }>
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'visit':
          await fetch(`${url}/api/analytics/track`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              page_url: action.data?.url || '/test-page',
              page_title: action.data?.title || 'Test Page',
              session_id: `test-session-${Date.now()}`,
              user_agent: 'Test Agent',
              ip_address: '127.0.0.1'
            })
          });
          break;

        case 'comment':
          if (action.data?.postId) {
            await testHelpers.createTestComment(url, action.data.postId, action.data.comment);
          }
          break;

        case 'like':
          // 实现点赞行为模拟
          break;

        default:
          console.warn(`Unknown action type: ${action.type}`);
      }

      // 添加随机延迟模拟真实用户行为
      await testHelpers.wait(Math.random() * 1000 + 500);
    }
  }
};

// 全局导出测试辅助函数
(globalThis as any).testHelpers = testHelpers;

// 错误处理增强
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});
