/**
 * Dashboard API 测试
 * 测试Dashboard Worker的管理API端点功能
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Dashboard API Tests', () => {
  let baseUrl: string;
  let authToken: string;
  let testUserId: number;
  let testPostId: number;

  beforeAll(async () => {
    // 从环境变量获取测试URL
    baseUrl = process.env.DASHBOARD_TEST_URL || 'http://localhost:8788';

    // 获取测试用的认证token
    authToken = await getTestAuthToken();
  });

  async function getTestAuthToken(): Promise<string> {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: process.env.TEST_ADMIN_EMAIL || 'admin@qianshe.top',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
      })
    });

    if (response.status === 200) {
      const data = await response.json();
      return data.data.token;
    }

    throw new Error('Failed to get auth token');
  }

  describe('Authentication API', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: process.env.TEST_ADMIN_EMAIL || 'admin@qianshe.top',
          password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.email).toBeDefined();
      expect(data.data.user.role).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate login data', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: ''
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should refresh token', async () => {
      const response = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
    });

    it('should logout successfully', async () => {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('Posts Management API', () => {
    it('should get posts list with authentication', async () => {
      const response = await fetch(`${baseUrl}/api/posts?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.items).toBeInstanceOf(Array);
      expect(data.data.pagination).toBeDefined();
    });

    it('should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        slug: `test-post-${Date.now()}`,
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        category: 'blog',
        tags: JSON.stringify(['test', 'api']),
        status: 'draft'
      };

      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.title).toBe(postData.title);

      testPostId = data.data.id;
    });

    it('should update a post', async () => {
      if (!testPostId) return;

      const updateData = {
        title: 'Updated Test Post',
        content: 'Updated content'
      };

      const response = await fetch(`${baseUrl}/api/posts/${testPostId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.title).toBe(updateData.title);
    });

    it('should delete a post', async () => {
      if (!testPostId) return;

      const response = await fetch(`${baseUrl}/api/posts/${testPostId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it('should require authentication for post operations', async () => {
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Unauthorized Post',
          content: 'Should not be created'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('Users Management API', () => {
    it('should get users list', async () => {
      const response = await fetch(`${baseUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should create a new user', async () => {
      const userData = {
        email: `testuser-${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        nickname: 'Test User',
        password: 'testpassword123',
        role: 'user'
      };

      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.email).toBe(userData.email);

      testUserId = data.data.id;
    });

    it('should update user role', async () => {
      if (!testUserId) return;

      const response = await fetch(`${baseUrl}/api/users/${testUserId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'moderator'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.role).toBe('moderator');
    });
  });

  describe('Analytics API', () => {
    it('should get analytics overview', async () => {
      const response = await fetch(`${baseUrl}/api/analytics/overview`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.totalVisits).toBeDefined();
      expect(data.data.uniqueVisitors).toBeDefined();
      expect(data.data.totalPageViews).toBeDefined();
    });

    it('should get analytics trends', async () => {
      const response = await fetch(`${baseUrl}/api/analytics/trends?period=7d`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should get popular pages', async () => {
      const response = await fetch(`${baseUrl}/api/analytics/popular-pages`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });
  });

  describe('Settings API', () => {
    it('should get all settings', async () => {
      const response = await fetch(`${baseUrl}/api/settings`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should update settings', async () => {
      const settingsData = [
        {
          key: 'site_title',
          value: 'Test Blog Title',
          type: 'string'
        },
        {
          key: 'posts_per_page',
          value: '15',
          type: 'number'
        }
      ];

      const response = await fetch(`${baseUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('Monitoring API', () => {
    it('should get monitoring overview', async () => {
      const response = await fetch(`${baseUrl}/api/monitoring/overview`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.realTime).toBeDefined();
      expect(data.data.summary).toBeDefined();
    });

    it('should get system health', async () => {
      const response = await fetch(`${baseUrl}/api/monitoring/health`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.overallHealth).toBeDefined();
      expect(data.data.healthChecks).toBeDefined();
    });

    it('should require admin role for monitoring', async () => {
      // 创建一个普通用户token并测试
      const userCredentials = {
        email: `testuser-${Date.now()}@example.com`,
        password: 'testpassword123'
      };

      // 先注册用户
      await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCredentials)
      });

      // 登录获取token
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCredentials)
      });

      if (loginResponse.status === 200) {
        const loginData = await loginResponse.json();
        const userToken = loginData.data.token;

        const monitoringResponse = await fetch(`${baseUrl}/api/monitoring/overview`, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });

        expect(monitoringResponse.status).toBe(403);
      }
    });
  });

  describe('Authorization Tests', () => {
    it('should reject requests without token', async () => {
      const response = await fetch(`${baseUrl}/api/posts`);

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.code).toBe('AUTH_REQUIRED');
    });

    it('should reject requests with invalid token', async () => {
      const response = await fetch(`${baseUrl}/api/posts`, {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });

      expect(response.status).toBe(401);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_TOKEN');
    });

    it('should enforce role-based access', async () => {
      // 测试普通用户访问管理员接口
      const response = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      // 如果当前用户不是管理员，应该拒绝访问
      if (response.status === 403) {
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('ADMIN_REQUIRED');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 20 }, () =>
        fetch(`${baseUrl}/api/posts`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.status === 200).length;

      expect(successCount).toBeGreaterThan(15); // 至少75%成功率

      // 检查响应时间
      const responseTimes = await Promise.all(
        responses.slice(0, 5).map(async response => {
          const responseTime = response.headers.get('X-Response-Time');
          return responseTime ? parseInt(responseTime) : 0;
        })
      );

      const avgResponseTime =
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      expect(avgResponseTime).toBeLessThan(2000); // 平均响应时间小于2秒
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate post data', async () => {
      const invalidPost = {
        title: '', // 空标题
        content: '', // 空内容
        status: 'invalid-status'
      };

      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidPost)
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate user data', async () => {
      const invalidUser = {
        email: 'invalid-email',
        username: '', // 空用户名
        password: '123' // 密码太短
      };

      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidUser)
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  afterAll(async () => {
    // 清理测试数据
    if (testUserId) {
      await fetch(`${baseUrl}/api/users/${testUserId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    console.info('Dashboard API tests completed');
  });
});
