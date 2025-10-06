/**
 * Portfolio API 测试
 * 测试Portfolio Worker的API端点功能
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Portfolio API Tests', () => {
  let baseUrl: string;
  let authToken: string;

  beforeAll(async () => {
    // 从环境变量获取测试URL
    baseUrl = process.env.PORTFOLIO_TEST_URL || 'http://localhost:8787';

    // 如果需要认证，可以在这里获取token
    // authToken = await getTestAuthToken();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/health`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe('OK');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Posts API', () => {
    it('should get posts list', async () => {
      const response = await fetch(`${baseUrl}/api/posts?page=1&limit=10`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.items).toBeInstanceOf(Array);
      expect(data.data.pagination).toBeDefined();
    });

    it('should get posts with filters', async () => {
      const response = await fetch(`${baseUrl}/api/posts?category=blog&status=published`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.items).toBeInstanceOf(Array);
    });

    it('should get single post', async () => {
      // 先获取文章列表，然后测试第一个文章
      const listResponse = await fetch(`${baseUrl}/api/posts?limit=1`);
      const listData = await listResponse.json();

      if (listData.data.items.length > 0) {
        const postId = listData.data.items[0].id;
        const response = await fetch(`${baseUrl}/api/posts/${postId}`);

        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.id).toBe(postId);
        expect(data.data.title).toBeDefined();
        expect(data.data.content).toBeDefined();
      }
    });

    it('should handle non-existent post', async () => {
      const response = await fetch(`${baseUrl}/api/posts/99999`);

      expect(response.status).toBe(404);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should validate post parameters', async () => {
      // 测试无效的分页参数
      const response = await fetch(`${baseUrl}/api/posts?page=-1&limit=0`);

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('Projects API', () => {
    it('should get projects list', async () => {
      const response = await fetch(`${baseUrl}/api/projects`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should filter projects by status', async () => {
      const response = await fetch(`${baseUrl}/api/projects?status=active`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should get single project', async () => {
      const listResponse = await fetch(`${baseUrl}/api/projects?limit=1`);
      const listData = await listResponse.json();

      if (listData.data.length > 0) {
        const projectId = listData.data[0].id;
        const response = await fetch(`${baseUrl}/api/projects/${projectId}`);

        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.data.id).toBe(projectId);
        expect(data.data.title).toBeDefined();
        expect(data.data.description).toBeDefined();
      }
    });
  });

  describe('Comments API', () => {
    let testPostId: number;

    beforeAll(async () => {
      // 获取一个测试用的文章ID
      const response = await fetch(`${baseUrl}/api/posts?limit=1`);
      const data = await response.json();
      if (data.data.items.length > 0) {
        testPostId = data.data.items[0].id;
      }
    });

    it('should get comments for a post', async () => {
      if (!testPostId) return;

      const response = await fetch(`${baseUrl}/api/comments?post_id=${testPostId}`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should create a comment', async () => {
      if (!testPostId) return;

      const commentData = {
        post_id: testPostId,
        user_name: 'Test User',
        user_email: 'test@example.com',
        content: 'This is a test comment'
      };

      const response = await fetch(`${baseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.content).toBe(commentData.content);
    });

    it('should validate comment data', async () => {
      const invalidComment = {
        user_name: '',
        user_email: 'invalid-email',
        content: ''
      };

      const response = await fetch(`${baseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidComment)
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('Settings API', () => {
    it('should get public settings', async () => {
      const response = await fetch(`${baseUrl}/api/settings`);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Object);

      // 验证返回的是公开设置
      Object.keys(data.data).forEach(key => {
        expect(typeof data.data[key]).not.toBe('function');
      });
    });
  });

  describe('Analytics API', () => {
    it('should accept analytics tracking data', async () => {
      const analyticsData = {
        page_url: '/test-page',
        page_title: 'Test Page',
        referrer: 'https://example.com',
        user_agent: 'Test Agent',
        ip_address: '127.0.0.1',
        session_id: 'test-session-123'
      };

      const response = await fetch(`${baseUrl}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('CORS Tests', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should handle rate limiting', async () => {
      // 发送多个快速请求来测试限流
      const promises = Array.from({ length: 10 }, () => fetch(`${baseUrl}/api/posts`));

      const responses = await Promise.all(promises);

      // 大部分请求应该成功，但可能会有限流
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount + rateLimitedCount).toBe(10);

      // 如果有被限流的请求，验证响应头
      if (rateLimitedCount > 0) {
        const rateLimitedResponse = responses.find(r => r.status === 429);
        expect(rateLimitedResponse?.headers.get('X-RateLimit-Limit')).toBeDefined();
        expect(rateLimitedResponse?.headers.get('Retry-After')).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await fetch(`${baseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle missing endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/nonexistent`);

      expect(response.status).toBe(404);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });
  });

  describe('Security Tests', () => {
    it('should sanitize HTML in comments', async () => {
      const maliciousComment = {
        post_id: 1,
        user_name: '<script>alert("xss")</script>',
        user_email: 'test@example.com',
        content: '<img src=x onerror=alert("xss")>Malicious content'
      };

      const response = await fetch(`${baseUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(maliciousComment)
      });

      if (response.status === 201) {
        const data = await response.json();

        // 验证HTML被清理
        expect(data.data.user_name).not.toContain('<script>');
        expect(data.data.content).not.toContain('<img');
        expect(data.data.content).not.toContain('onerror');
      }
    });

    it('should prevent SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE posts; --";

      const response = await fetch(
        `${baseUrl}/api/posts?search=${encodeURIComponent(maliciousInput)}`
      );

      // 请求应该成功但不应该造成任何破坏
      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  afterAll(async () => {
    // 清理测试数据
    console.info('Portfolio API tests completed');
  });
});
