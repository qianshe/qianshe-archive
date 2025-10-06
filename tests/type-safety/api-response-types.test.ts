/**
 * API响应类型测试
 * 专门测试API接口的响应类型一致性和正确性
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testHelpers } from '../setup';

// API类型定义接口
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  description: string;
  expectedStatus: number;
  responseSchema?: any;
  requestBodySchema?: any;
  requiresAuth?: boolean;
}

// Portfolio API端点定义
const portfolioApiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    url: '/api/posts',
    description: '获取博客列表',
    expectedStatus: 200,
    responseSchema: {
      success: 'boolean',
      data: ['object'],
      pagination: {
        current_page: 'number',
        total_pages: 'number',
        total_items: 'number',
        per_page: 'number'
      },
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'GET',
    url: '/api/posts/{id}',
    description: '获取博客详情',
    expectedStatus: 200,
    responseSchema: {
      success: 'boolean',
      data: {
        id: 'number',
        title: 'string',
        slug: 'string',
        content: 'string',
        excerpt: 'string',
        featured_image: 'string',
        status: 'string',
        created_at: 'string',
        updated_at: 'string',
        category: 'object',
        tags: ['object'],
        comment_count: 'number',
        view_count: 'number'
      },
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'GET',
    url: '/api/projects',
    description: '获取项目列表',
    expectedStatus: 200,
    responseSchema: {
      success: 'boolean',
      data: ['object'],
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'GET',
    url: '/api/comments',
    description: '获取评论列表',
    expectedStatus: 200,
    responseSchema: {
      success: 'boolean',
      data: ['object'],
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'POST',
    url: '/api/comments',
    description: '创建评论',
    expectedStatus: 201,
    requestBodySchema: {
      post_id: 'number',
      parent_id: 'number',
      user_name: 'string',
      user_email: 'string',
      content: 'string'
    },
    responseSchema: {
      success: 'boolean',
      data: {
        id: 'number',
        post_id: 'number',
        user_name: 'string',
        user_email: 'string',
        content: 'string',
        status: 'string',
        created_at: 'string'
      },
      timestamp: 'string',
      code: 'string'
    }
  }
];

// Dashboard API端点定义
const dashboardApiEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    url: '/api/auth/login',
    description: '管理员登录',
    expectedStatus: 200,
    requestBodySchema: {
      email: 'string',
      password: 'string'
    },
    responseSchema: {
      success: 'boolean',
      data: {
        token: 'string',
        user: {
          id: 'number',
          email: 'string',
          name: 'string',
          role: 'string'
        }
      },
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'GET',
    url: '/api/posts',
    description: '获取文章管理列表',
    expectedStatus: 200,
    requiresAuth: true,
    responseSchema: {
      success: 'boolean',
      data: ['object'],
      pagination: 'object',
      timestamp: 'string',
      code: 'string'
    }
  },
  {
    method: 'GET',
    url: '/api/analytics/overview',
    description: '获取分析概览',
    expectedStatus: 200,
    requiresAuth: true,
    responseSchema: {
      success: 'boolean',
      data: {
        total_visits: 'number',
        unique_visitors: 'number',
        page_views: 'number',
        bounce_rate: 'number',
        avg_session_duration: 'number'
      },
      timestamp: 'string',
      code: 'string'
    }
  }
];

describe('API响应类型测试', () => {
  const { portfolioUrl, dashboardUrl, testUser } = globalThis.testConfig;
  let authToken: string;

  beforeAll(async () => {
    try {
      authToken = await testHelpers.getAuthToken(
        dashboardUrl,
        testUser.adminEmail,
        testUser.adminPassword
      );
    } catch (error) {
      console.warn('Dashboard认证失败，某些测试可能被跳过');
    }
  });

  /**
   * 验证响应是否符合类型定义
   */
  function validateResponseType(response: any, schema: any, path: string = ''): string[] {
    const errors: string[] = [];

    if (!schema || typeof schema !== 'object') {
      return errors;
    }

    for (const [key, expectedType] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in response)) {
        errors.push(`Missing required property: ${currentPath}`);
        continue;
      }

      const actualValue = response[key];
      const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

      if (typeof expectedType === 'string') {
        if (actualType !== expectedType) {
          errors.push(`${currentPath}: Expected ${expectedType}, got ${actualType}`);
        }
      } else if (Array.isArray(expectedType)) {
        if (!Array.isArray(actualValue)) {
          errors.push(`${currentPath}: Expected array, got ${actualType}`);
        } else if (actualValue.length > 0) {
          // 验证数组元素类型
          const elementSchema = expectedType[0];
          const elementValidation = validateResponseType(actualValue[0], elementSchema, `${currentPath}[0]`);
          errors.push(...elementValidation);
        }
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        const nestedValidation = validateResponseType(actualValue, expectedType, currentPath);
        errors.push(...nestedValidation);
      }
    }

    return errors;
  }

  /**
   * 执行API请求并验证类型
   */
  async function testApiEndpoint(
    baseUrl: string,
    endpoint: ApiEndpoint,
    testData?: any
  ): Promise<{
    status: number;
    response: any;
    typeErrors: string[];
    isCorrect: boolean;
  }> {
    const url = endpoint.url.replace('{id}', '1'); // 使用测试ID
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (endpoint.requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${url}`, {
        method: endpoint.method,
        headers,
        body: testData ? JSON.stringify(testData) : undefined
      });
    } catch (error) {
      return {
        status: 0,
        response: null,
        typeErrors: [`Request failed: ${error}`],
        isCorrect: false
      };
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch (error) {
      return {
        status: response.status,
        response: null,
        typeErrors: [`Failed to parse JSON response: ${error}`],
        isCorrect: false
      };
    }

    const typeErrors = endpoint.responseSchema 
      ? validateResponseType(responseData, endpoint.responseSchema)
      : [];

    return {
      status: response.status,
      response: responseData,
      typeErrors,
      isCorrect: response.status === endpoint.expectedStatus && typeErrors.length === 0
    };
  }

  describe('Portfolio API类型一致性测试', () => {
    it('博客列表API应该返回正确的类型结构', async () => {
      const endpoint = portfolioApiEndpoints.find(e => e.url === '/api/posts')!;
      const result = await testApiEndpoint(portfolioUrl, endpoint);

      expect(result.status).toBe(endpoint.expectedStatus);
      expect(result.response).toHaveProperty('success', true);
      expect(result.response).toHaveProperty('data');
      expect(Array.isArray(result.response.data)).toBe(true);

      if (result.response.data.length > 0) {
        const post = result.response.data[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('created_at');
        
        // 验证时间戳格式
        expect(typeof post.created_at).toBe('string');
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        expect(post.created_at).toMatch(dateRegex);
      }

      expect(result.typeErrors).toHaveLength(0);
    });

    it('博客详情API应该返回完整的文章对象', async () => {
      // 先获取文章列表
      const listEndpoint = portfolioApiEndpoints.find(e => e.url === '/api/posts')!;
      const listResult = await testApiEndpoint(portfolioUrl, listEndpoint);

      if (listResult.response && listResult.response.data.length > 0) {
        const postId = listResult.response.data[0].id;
        const detailEndpoint = portfolioApiEndpoints.find(e => e.url === '/api/posts/{id}')!;
        
        const result = await testApiEndpoint(portfolioUrl, { ...detailEndpoint, url: `/api/posts/${postId}` });

        expect(result.status).toBe(200);
        expect(result.response.success).toBe(true);
        expect(result.response.data).toHaveProperty('id', postId);

        // 验证所有必需字段都存在且类型正确
        const post = result.response.data;
        const requiredFields = ['title', 'slug', 'content', 'excerpt', 'status', 'created_at', 'updated_at'];
        for (const field of requiredFields) {
          expect(post).toHaveProperty(field);
          expect(typeof post[field]).toBe('string');
        }

        expect(typeof post.id).toBe('number');
        expect(typeof post.comment_count).toBe('number');
        expect(typeof post.view_count).toBe('number');
      }
    });

    it('项目列表API应该返回项目类型数据', async () => {
      const endpoint = portfolioApiEndpoints.find(e => e.url === '/api/projects')!;
      const result = await testApiEndpoint(portfolioUrl, endpoint);

      expect(result.status).toBe(200);
      expect(result.response.success).toBe(true);
      expect(Array.isArray(result.response.data)).toBe(true);

      if (result.response.data.length > 0) {
        const project = result.response.data[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('slug');
        expect(project).toHaveProperty('description');
        expect(project).toHaveProperty('technologies');
        
        expect(Array.isArray(project.technologies)).toBe(true);
        expect(typeof project.featured).toBe('boolean');
      }
    });

    it('评论API应该正确处理创建请求', async () => {
      const endpoint = portfolioApiEndpoints.find(e => e.url === '/api/comments' && e.method === 'POST')!;
      
      const testData = {
        post_id: 1,
        parent_id: null,
        user_name: 'Type Test User',
        user_email: 'test@typesafety.com',
        content: 'This is a type safety test comment'
      };

      const result = await testApiEndpoint(portfolioUrl, endpoint, testData);

      expect(result.status).toBe(201);
      expect(result.response.success).toBe(true);
      expect(result.response.data).toHaveProperty('id');
      expect(result.response.data.user_name).toBe(testData.user_name);
      expect(result.response.data.user_email).toBe(testData.user_email);
      expect(result.response.data.content).toBe(testData.content);
    });
  });

  describe('Dashboard API类型一致性测试', () => {
    it('登录API应该返回认证响应类型', async () => {
      const endpoint = dashboardApiEndpoints.find(e => e.url === '/api/auth/login')!;
      
      const testData = {
        email: testUser.adminEmail,
        password: testUser.adminPassword
      };

      const result = await testApiEndpoint(dashboardUrl, endpoint, testData);

      if (result.status === 200) {
        expect(result.response.success).toBe(true);
        expect(result.response.data).toHaveProperty('token');
        expect(result.response.data).toHaveProperty('user');
        
        expect(typeof result.response.data.token).toBe('string');
        expect(result.response.data.user).toHaveProperty('id');
        expect(result.response.data.user).toHaveProperty('email');
        expect(result.response.data.user).toHaveProperty('name');
        expect(result.response.data.user).toHaveProperty('role');
      }
    });

    it('文章管理API应该返回管理类型数据', async () => {
      if (!authToken) {
        console.warn('跳过需要认证的测试');
        return;
      }

      const endpoint = dashboardApiEndpoints.find(e => e.url === '/api/posts' && e.requiresAuth)!;
      const result = await testApiEndpoint(dashboardUrl, endpoint);

      if (result.status === 200) {
        expect(result.response.success).toBe(true);
        expect(Array.isArray(result.response.data)).toBe(true);

        if (result.response.data.length > 0) {
          const post = result.response.data[0];
          // 管理端应该包含额外的管理字段
          expect(post).toHaveProperty('id');
          expect(post).toHaveProperty('title');
          expect(post).toHaveProperty('status');
          expect(post).toHaveProperty('created_at');
          
          // 可能包含的管理字段
          const possibleFields = ['author', 'published_at', 'analytics'];
          const hasManagementFields = possibleFields.some(field => field in post);
          
          if (hasManagementFields) {
            console.log('发现管理字段:', possibleFields.filter(field => field in post));
          }
        }
      }
    });

    it('分析数据API应该返回数值类型', async () => {
      if (!authToken) {
        console.warn('跳过需要认证的测试');
        return;
      }

      const endpoint = dashboardApiEndpoints.find(e => e.url === '/api/analytics/overview')!;
      const result = await testApiEndpoint(dashboardUrl, endpoint);

      if (result.status === 200) {
        expect(result.response.success).toBe(true);
        expect(result.response.data).toHaveProperty('total_visits');
        expect(result.response.data).toHaveProperty('unique_visitors');
        expect(result.response.data).toHaveProperty('page_views');
        
        // 验证数值类型
        const numericFields = ['total_visits', 'unique_visitors', 'page_views', 'bounce_rate', 'avg_session_duration'];
        for (const field of numericFields) {
          if (field in result.response.data) {
            expect(typeof result.response.data[field]).toBe('number');
            expect(result.response.data[field]).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });
  });

  describe('API响应时间戳格式测试', () => {
    it('所有API都应该返回ISO格式时间戳', async () => {
      const endpoints = [
        { url: `${portfolioUrl}/api/posts`, name: 'Posts List' },
        { url: `${portfolioUrl}/api/projects`, name: 'Projects List' }
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('timestamp');

        const timestamp = data.timestamp;
        expect(typeof timestamp).toBe('string');
        
        // 验证ISO 8601格式
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        expect(timestamp).toMatch(dateRegex);
        
        // 验证可以被Date解析
        expect(() => new Date(timestamp)).not.toThrow();
      }
    });
  });

  describe('API响应代码格式测试', () => {
    it('所有API都应该返回标准的响应代码', async () => {
      const testCases = [
        { url: `${portfolioUrl}/api/posts`, expectedCode: 'SUCCESS' },
        { url: `${portfolioUrl}/api/nonexistent`, expectedCode: 'NOT_FOUND' }
      ];

      for (const testCase of testCases) {
        const response = await fetch(testCase.url);
        const data = await response.json();
        
        expect(data).toHaveProperty('code');
        expect(typeof data.code).toBe('string');
        expect(data.code.length).toBeGreaterThan(0);
        
        console.log(`${testCase.url} -> ${response.status} -> ${data.code}`);
      }
    });
  });

  describe('API错误响应类型测试', () => {
    it('400错误应该返回标准错误格式', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?page=-1`);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('timestamp');

      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });

    it('404错误应该返回标准错误格式', async () => {
      const response = await fetch(`${portfolioUrl}/api/nonexistent-endpoint`);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('timestamp');
      expect(data.code).toBe('NOT_FOUND');
    });
  });

  describe('API分页响应类型测试', () => {
    it('分页API应该返回正确的分页信息', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?page=1&limit=5`);
      const data = await response.json();

      if (data.success && data.pagination) {
        expect(data.pagination).toHaveProperty('current_page', 1);
        expect(data.pagination).toHaveProperty('per_page', 5);
        expect(data.pagination).toHaveProperty('total_items');
        expect(data.pagination).toHaveProperty('total_pages');
        
        expect(typeof data.pagination.current_page).toBe('number');
        expect(typeof data.pagination.per_page).toBe('number');
        expect(typeof data.pagination.total_items).toBe('number');
        expect(typeof data.pagination.total_pages).toBe('number');
        
        expect(data.pagination.total_items).toBeGreaterThanOrEqual(0);
        expect(data.pagination.total_pages).toBeGreaterThanOrEqual(0);
        
        // 验证分页逻辑
        if (data.pagination.total_items > 0) {
          expect(data.pagination.total_pages).toBeGreaterThanOrEqual(1);
          expect(data.data.length).toBeLessThanOrEqual(5);
        }
      }
    });
  });
});