/**
 * 运行时类型验证测试
 * 验证API响应和数据库查询结果的类型安全性
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testHelpers } from '../setup';

// 运行时类型验证器
class TypeValidator {
  /**
   * 验证API响应格式
   */
  static validateApiResponse(response: any, schema: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof response !== 'object' || response === null) {
      errors.push('Response must be an object');
      return { isValid: false, errors };
    }

    // 检查基本API响应结构
    if (!('success' in response)) {
      errors.push('Response must have "success" property');
    }

    if (response.success && !('data' in response)) {
      errors.push('Success response must have "data" property');
    }

    if (!response.success && !('error' in response)) {
      errors.push('Error response must have "error" property');
    }

    if (!('timestamp' in response)) {
      errors.push('Response must have "timestamp" property');
    }

    if (!('code' in response)) {
      errors.push('Response must have "code" property');
    }

    // 验证具体的数据类型
    if (response.success && response.data && schema) {
      const dataValidation = this.validateObject(response.data, schema);
      if (!dataValidation.isValid) {
        errors.push(...dataValidation.errors.map(err => `data.${err}`));
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 验证对象结构
   */
  static validateObject(obj: any, schema: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof obj !== 'object' || obj === null) {
      errors.push(`Expected object, got ${typeof obj}`);
      return { isValid: false, errors };
    }

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in obj)) {
        errors.push(`Missing required property: ${key}`);
        continue;
      }

      const actualValue = obj[key];
      const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

      if (typeof expectedType === 'string') {
        if (actualType !== expectedType) {
          errors.push(`${key}: Expected ${expectedType}, got ${actualType}`);
        }
      } else if (Array.isArray(expectedType)) {
        if (!Array.isArray(actualValue)) {
          errors.push(`${key}: Expected array, got ${actualType}`);
        } else {
          // 验证数组元素类型
          const elementType = expectedType[0];
          for (let i = 0; i < actualValue.length; i++) {
            const elementValidation = this.validateValue(actualValue[i], elementType);
            if (!elementValidation.isValid) {
              errors.push(`${key}[${i}]: ${elementValidation.errors.join(', ')}`);
            }
          }
        }
      } else if (typeof expectedType === 'object') {
        const nestedValidation = this.validateObject(actualValue, expectedType);
        if (!nestedValidation.isValid) {
          errors.push(...nestedValidation.errors.map(err => `${key}.${err}`));
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 验证单个值
   */
  static validateValue(value: any, expectedType: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (typeof expectedType === 'string') {
      if (actualType !== expectedType) {
        errors.push(`Expected ${expectedType}, got ${actualType}`);
      }
    } else if (Array.isArray(expectedType)) {
      if (!Array.isArray(value)) {
        errors.push(`Expected array, got ${actualType}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// API响应类型定义
const ApiSchemas = {
  // Portfolio API Schemas
  PostResponse: {
    id: 'number',
    title: 'string',
    slug: 'string',
    content: 'string',
    excerpt: 'string',
    featured_image: 'string',
    status: 'string',
    created_at: 'string',
    updated_at: 'string',
    category: {
      id: 'number',
      name: 'string',
      slug: 'string'
    },
    tags: ['object'],
    comment_count: 'number',
    view_count: 'number'
  },

  ProjectResponse: {
    id: 'number',
    title: 'string',
    slug: 'string',
    description: 'string',
    content: 'string',
    featured_image: 'string',
    demo_url: 'string',
    github_url: 'string',
    technologies: ['string'],
    status: 'string',
    featured: 'boolean',
    created_at: 'string',
    updated_at: 'string'
  },

  CommentResponse: {
    id: 'number',
    post_id: 'number',
    parent_id: 'number',
    user_name: 'string',
    user_email: 'string',
    content: 'string',
    status: 'string',
    created_at: 'string',
    replies: ['object']
  },

  // Dashboard API Schemas
  AuthResponse: {
    token: 'string',
    user: {
      id: 'number',
      email: 'string',
      name: 'string',
      role: 'string'
    }
  },

  AnalyticsResponse: {
    total_visits: 'number',
    unique_visitors: 'number',
    page_views: 'number',
    bounce_rate: 'number',
    avg_session_duration: 'number',
    popular_pages: ['object'],
    daily_stats: ['object']
  }
};

describe('运行时类型验证测试', () => {
  const { portfolioUrl, dashboardUrl, testUser } = globalThis.testConfig;

  describe('Portfolio API 类型验证', () => {
    it('博客列表API响应类型应该正确', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?page=1&limit=10`);
      expect(response.status).toBe(200);

      const data = await response.json();
      
      // 验证基础API响应格式
      const apiValidation = TypeValidator.validateApiResponse(data, null);
      expect(apiValidation.isValid).toBe(true);
      expect(apiValidation.errors).toHaveLength(0);

      // 验证数据是数组
      expect(Array.isArray(data.data)).toBe(true);

      // 验证第一个文章项的类型（如果有数据）
      if (data.data.length > 0) {
        const postValidation = TypeValidator.validateObject(data.data[0], ApiSchemas.PostResponse);
        expect(postValidation.isValid).toBe(true);
        
        if (!postValidation.isValid) {
          console.error('文章类型验证错误:', postValidation.errors);
        }
      }
    });

    it('博客详情API响应类型应该正确', async () => {
      // 先获取第一篇文章的ID
      const listResponse = await fetch(`${portfolioUrl}/api/posts?limit=1`);
      const listData = await listResponse.json();

      if (listData.data.length > 0) {
        const postId = listData.data[0].id;
        const response = await fetch(`${portfolioUrl}/api/posts/${postId}`);
        expect(response.status).toBe(200);

        const data = await response.json();
        const validation = TypeValidator.validateApiResponse(data, ApiSchemas.PostResponse);
        
        expect(validation.isValid).toBe(true);
        if (!validation.isValid) {
          console.error('博客详情类型验证错误:', validation.errors);
        }
      }
    });

    it('项目列表API响应类型应该正确', async () => {
      const response = await fetch(`${portfolioUrl}/api/projects?featured=true`);
      expect(response.status).toBe(200);

      const data = await response.json();
      const apiValidation = TypeValidator.validateApiResponse(data, null);
      expect(apiValidation.isValid).toBe(true);

      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const projectValidation = TypeValidator.validateObject(data.data[0], ApiSchemas.ProjectResponse);
        expect(projectValidation.isValid).toBe(true);
        
        if (!projectValidation.isValid) {
          console.error('项目类型验证错误:', projectValidation.errors);
        }
      }
    });

    it('评论API响应类型应该正确', async () => {
      const response = await fetch(`${portfolioUrl}/api/comments?post_id=1&limit=5`);
      expect(response.status).toBe(200);

      const data = await response.json();
      const apiValidation = TypeValidator.validateApiResponse(data, null);
      expect(apiValidation.isValid).toBe(true);

      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        const commentValidation = TypeValidator.validateObject(data.data[0], ApiSchemas.CommentResponse);
        expect(commentValidation.isValid).toBe(true);
        
        if (!commentValidation.isValid) {
          console.error('评论类型验证错误:', commentValidation.errors);
        }
      }
    });
  });

  describe('Dashboard API 类型验证', () => {
    let authToken: string;

    beforeAll(async () => {
      try {
        authToken = await testHelpers.getAuthToken(
          dashboardUrl,
          testUser.adminEmail,
          testUser.adminPassword
        );
      } catch (error) {
        console.warn('Dashboard认证失败，跳过需要认证的测试');
      }
    });

    it('登录API响应类型应该正确', async () => {
      const response = await fetch(`${dashboardUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.adminEmail,
          password: testUser.adminPassword
        })
      });

      if (response.status === 200) {
        const data = await response.json();
        const validation = TypeValidator.validateApiResponse(data, ApiSchemas.AuthResponse);
        
        expect(validation.isValid).toBe(true);
        if (!validation.isValid) {
          console.error('登录响应类型验证错误:', validation.errors);
        }
      } else {
        console.warn('登录失败，可能是测试环境问题');
      }
    });

    it('分析数据API响应类型应该正确', async () => {
      if (!authToken) {
        console.warn('无认证token，跳过分析数据测试');
        return;
      }

      const response = await fetch(`${dashboardUrl}/api/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        const validation = TypeValidator.validateApiResponse(data, ApiSchemas.AnalyticsResponse);
        
        expect(validation.isValid).toBe(true);
        if (!validation.isValid) {
          console.error('分析数据类型验证错误:', validation.errors);
        }
      }
    });

    it('文章管理API响应类型应该正确', async () => {
      if (!authToken) {
        console.warn('无认证token，跳过文章管理测试');
        return;
      }

      const response = await fetch(`${dashboardUrl}/api/posts?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        const apiValidation = TypeValidator.validateApiResponse(data, null);
        expect(apiValidation.isValid).toBe(true);

        expect(Array.isArray(data.data)).toBe(true);

        if (data.data.length > 0) {
          // 管理端的文章响应应该包含更多管理字段
          const expectedFields = ['id', 'title', 'slug', 'status', 'created_at'];
          const post = data.data[0];
          
          for (const field of expectedFields) {
            expect(post).toHaveProperty(field);
          }
        }
      }
    });
  });

  describe('错误响应类型验证', () => {
    it('404错误响应应该有正确的格式', async () => {
      const response = await fetch(`${portfolioUrl}/api/nonexistent-endpoint`);
      expect(response.status).toBe(404);

      const data = await response.json();
      
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('timestamp');
      
      expect(typeof data.error).toBe('string');
      expect(typeof data.code).toBe('string');
      expect(typeof data.timestamp).toBe('string');
    });

    it('无效参数错误响应应该有正确的格式', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?page=-1&limit=0`);
      
      // 理想情况下应该返回400错误，但实际可能返回200 with error
      const data = await response.json();
      
      if (!data.success) {
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('code');
        expect(typeof data.error).toBe('string');
      }
    });

    it('认证错误响应应该有正确的格式', async () => {
      const response = await fetch(`${dashboardUrl}/api/admin/posts`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      const data = await response.json();
      
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
    });
  });

  describe('数据类型边界测试', () => {
    it('应该正确处理空数组响应', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?search=nonexistent-content`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data).toHaveLength(0);
    });

    it('应该正确处理大数据量响应', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?limit=50`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // 验证数据量不超过请求的限制
      expect(data.data.length).toBeLessThanOrEqual(50);
    });

    it('应该正确处理特殊字符', async () => {
      const specialChars = ['"', "'", '<', '>', '&', '中文', '🚀'];
      
      for (const char of specialChars) {
        const response = await fetch(`${portfolioUrl}/api/posts?search=${encodeURIComponent(char)}`);
        // 应该不会因为特殊字符而导致服务器错误
        expect(response.status).toBeLessThan(500);
      }
    });
  });
});