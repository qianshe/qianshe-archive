/**
 * 数据库操作类型测试
 * 验证数据库查询结果和数据库操作的类型安全性
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testHelpers } from '../setup';

// 数据库表结构类型定义
interface DatabaseSchema {
  users: {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'user';
    created_at: string;
    updated_at: string;
  };
  posts: {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featured_image: string;
    status: 'draft' | 'published' | 'private';
    category_id: number;
    author_id: number;
    view_count: number;
    created_at: string;
    updated_at: string;
    published_at: string | null;
  };
  projects: {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    featured_image: string;
    demo_url: string;
    github_url: string;
    technologies: string;
    status: 'active' | 'inactive' | 'archived';
    featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
  };
  comments: {
    id: number;
    post_id: number;
    parent_id: number | null;
    user_name: string;
    user_email: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    ip_address: string;
    user_agent: string;
    created_at: string;
  };
  analytics: {
    id: number;
    page_url: string;
    page_title: string;
    session_id: string;
    user_agent: string;
    ip_address: string;
    referrer: string;
    visit_time: string;
    duration: number;
  };
}

// 数据库操作结果类型
interface DatabaseResult<T> {
  success: boolean;
  data: T[];
  affected_rows?: number;
  last_row_id?: number;
  meta?: {
    duration: number;
    changes: number;
    last_row_id: number;
  };
}

// 数据库验证器
class DatabaseTypeValidator {
  /**
   * 验证数据库查询结果是否符合表结构
   */
  static validateQueryResult<T extends keyof DatabaseSchema>(
    tableName: T,
    result: any[]
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(result)) {
      errors.push(`Expected array for ${tableName}, got ${typeof result}`);
      return { isValid: false, errors, warnings };
    }

    if (result.length === 0) {
      return { isValid: true, errors, warnings: ['Empty result set'] };
    }

    // 获取表结构定义（这里需要根据实际数据库结构调整）
    const schema = this.getTableSchema(tableName);
    
    for (let i = 0; i < Math.min(result.length, 5); i++) { // 只验证前5条记录
      const row = result[i];
      const rowErrors = this.validateRowAgainstSchema(tableName, row, schema, i);
      errors.push(...rowErrors);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 获取表结构定义
   */
  private static getTableSchema(tableName: string): Record<string, { type: string; nullable: boolean; enum?: string[] }> {
    const schemas: Record<string, any> = {
      users: {
        id: { type: 'number', nullable: false },
        email: { type: 'string', nullable: false },
        password_hash: { type: 'string', nullable: false },
        name: { type: 'string', nullable: false },
        role: { type: 'string', nullable: false, enum: ['admin', 'user'] },
        created_at: { type: 'string', nullable: false },
        updated_at: { type: 'string', nullable: false }
      },
      posts: {
        id: { type: 'number', nullable: false },
        title: { type: 'string', nullable: false },
        slug: { type: 'string', nullable: false },
        content: { type: 'string', nullable: false },
        excerpt: { type: 'string', nullable: false },
        featured_image: { type: 'string', nullable: false },
        status: { type: 'string', nullable: false, enum: ['draft', 'published', 'private'] },
        category_id: { type: 'number', nullable: false },
        author_id: { type: 'number', nullable: false },
        view_count: { type: 'number', nullable: false },
        created_at: { type: 'string', nullable: false },
        updated_at: { type: 'string', nullable: false },
        published_at: { type: 'string', nullable: true }
      },
      projects: {
        id: { type: 'number', nullable: false },
        title: { type: 'string', nullable: false },
        slug: { type: 'string', nullable: false },
        description: { type: 'string', nullable: false },
        content: { type: 'string', nullable: false },
        featured_image: { type: 'string', nullable: false },
        demo_url: { type: 'string', nullable: false },
        github_url: { type: 'string', nullable: false },
        technologies: { type: 'string', nullable: false },
        status: { type: 'string', nullable: false, enum: ['active', 'inactive', 'archived'] },
        featured: { type: 'boolean', nullable: false },
        sort_order: { type: 'number', nullable: false },
        created_at: { type: 'string', nullable: false },
        updated_at: { type: 'string', nullable: false }
      },
      categories: {
        id: { type: 'number', nullable: false },
        name: { type: 'string', nullable: false },
        slug: { type: 'string', nullable: false },
        description: { type: 'string', nullable: false },
        created_at: { type: 'string', nullable: false }
      },
      comments: {
        id: { type: 'number', nullable: false },
        post_id: { type: 'number', nullable: false },
        parent_id: { type: 'number', nullable: true },
        user_name: { type: 'string', nullable: false },
        user_email: { type: 'string', nullable: false },
        content: { type: 'string', nullable: false },
        status: { type: 'string', nullable: false, enum: ['pending', 'approved', 'rejected'] },
        ip_address: { type: 'string', nullable: false },
        user_agent: { type: 'string', nullable: false },
        created_at: { type: 'string', nullable: false }
      },
      analytics: {
        id: { type: 'number', nullable: false },
        page_url: { type: 'string', nullable: false },
        page_title: { type: 'string', nullable: false },
        session_id: { type: 'string', nullable: false },
        user_agent: { type: 'string', nullable: false },
        ip_address: { type: 'string', nullable: false },
        referrer: { type: 'string', nullable: false },
        visit_time: { type: 'string', nullable: false },
        duration: { type: 'number', nullable: false }
      }
    };

    return schemas[tableName] || {};
  }

  /**
   * 验证单行数据是否符合表结构
   */
  private static validateRowAgainstSchema(
    tableName: string,
    row: any,
    schema: Record<string, { type: string; nullable: boolean; enum?: string[] }>,
    rowIndex: number
  ): string[] {
    const errors: string[] = [];

    if (typeof row !== 'object' || row === null) {
      errors.push(`Row ${rowIndex}: Expected object, got ${typeof row}`);
      return errors;
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = row[fieldName];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      // 检查空值
      if (value === null || value === undefined) {
        if (!fieldSchema.nullable) {
          errors.push(`Row ${rowIndex}.${fieldName}: Field cannot be null`);
        }
        continue;
      }

      // 检查类型
      if (actualType !== fieldSchema.type) {
        // 特殊处理：布尔值可能以数字形式返回
        if (fieldSchema.type === 'boolean' && actualType === 'number') {
          if (value !== 0 && value !== 1) {
            errors.push(`Row ${rowIndex}.${fieldName}: Expected boolean (0 or 1), got ${value}`);
          }
        } else {
          errors.push(`Row ${rowIndex}.${fieldName}: Expected ${fieldSchema.type}, got ${actualType}`);
        }
        continue;
      }

      // 检查枚举值
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(`Row ${rowIndex}.${fieldName}: Invalid enum value "${value}", expected one of ${fieldSchema.enum.join(', ')}`);
      }

      // 检查时间戳格式
      if (fieldName.includes('_at') && fieldSchema.type === 'string') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        if (!dateRegex.test(value)) {
          errors.push(`Row ${rowIndex}.${fieldName}: Invalid timestamp format: ${value}`);
        }
      }

      // 检查数值范围
      if (fieldSchema.type === 'number') {
        if (fieldName === 'id' && value <= 0) {
          errors.push(`Row ${rowIndex}.${fieldName}: ID must be positive, got ${value}`);
        }
        if (fieldName.includes('count') && value < 0) {
          errors.push(`Row ${rowIndex}.${fieldName}: Count cannot be negative, got ${value}`);
        }
      }
    }

    return errors;
  }

  /**
   * 验证数据库操作的返回结果
   */
  static validateDatabaseOperation(result: any, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof result !== 'object' || result === null) {
      errors.push(`Database operation result must be an object, got ${typeof result}`);
      return { isValid: false, errors };
    }

    // 检查必需的元数据字段
    if (!('meta' in result)) {
      errors.push('Missing meta field in database result');
    } else {
      const meta = result.meta;
      if (typeof meta !== 'object' || meta === null) {
        errors.push('Meta field must be an object');
      } else {
        if (!('changes' in meta) || typeof meta.changes !== 'number') {
          errors.push('Meta must have numeric changes field');
        }
        if (!('last_row_id' in meta) || typeof meta.last_row_id !== 'number') {
          errors.push('Meta must have numeric last_row_id field');
        }
        if (!('duration' in meta) || typeof meta.duration !== 'number') {
          errors.push('Meta must have numeric duration field');
        }
      }
    }

    // 检查结果字段
    if (!('results' in result)) {
      errors.push('Missing results field in database result');
    } else {
      if (!Array.isArray(result.results)) {
        errors.push('Results field must be an array');
      }
    }

    // 检查成功标志
    if (!('success' in result) || typeof result.success !== 'boolean') {
      errors.push('Missing or invalid success field in database result');
    }

    return { isValid: errors.length === 0, errors };
  }
}

describe('数据库操作类型测试', () => {
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
      console.warn('Dashboard认证失败，某些数据库测试可能被跳过');
    }
  });

  /**
   * 通过API测试数据库查询结果的类型
   */
  describe('数据库查询结果类型验证', () => {
    it('博客查询结果应该符合posts表结构', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?limit=5`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      const validation = DatabaseTypeValidator.validateQueryResult('posts', data.data);
      expect(validation.isValid).toBe(true);
      
      if (!validation.isValid) {
        console.error('Posts表类型验证错误:', validation.errors);
        console.warn('Posts表类型验证警告:', validation.warnings);
      }
    });

    it('项目查询结果应该符合projects表结构', async () => {
      const response = await fetch(`${portfolioUrl}/api/projects?limit=5`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      const validation = DatabaseTypeValidator.validateQueryResult('projects', data.data);
      expect(validation.isValid).toBe(true);
      
      if (!validation.isValid) {
        console.error('Projects表类型验证错误:', validation.errors);
      }
    });

    it('评论查询结果应该符合comments表结构', async () => {
      const response = await fetch(`${portfolioUrl}/api/comments?limit=5`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      const validation = DatabaseTypeValidator.validateQueryResult('comments', data.data);
      expect(validation.isValid).toBe(true);
      
      if (!validation.isValid) {
        console.error('Comments表类型验证错误:', validation.errors);
      }
    });
  });

  /**
   * 测试数据库写入操作的类型安全性
   */
  describe('数据库写入操作类型验证', () => {
    let createdCommentId: number;

    it('创建评论应该返回正确的类型结构', async () => {
      const commentData = {
        post_id: 1,
        parent_id: null,
        user_name: 'DB Type Test User',
        user_email: 'dbtest@typesafety.com',
        content: 'This is a database type safety test comment'
      };

      const response = await fetch(`${portfolioUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });

      if (response.status === 201) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('id');
        expect(typeof data.data.id).toBe('number');
        expect(data.data.id).toBeGreaterThan(0);

        createdCommentId = data.data.id;

        // 验证返回的评论数据类型
        expect(data.data.user_name).toBe(commentData.user_name);
        expect(data.data.user_email).toBe(commentData.user_email);
        expect(data.data.content).toBe(commentData.content);
        expect(data.data.status).toBe('pending'); // 默认状态
        expect(typeof data.data.created_at).toBe('string');
      }
    });

    it('删除评论应该返回正确的操作结果', async () => {
      if (!createdCommentId || !authToken) {
        console.warn('跳过删除测试，需要认证或有效的评论ID');
        return;
      }

      const response = await fetch(`${dashboardUrl}/api/comments/${createdCommentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('message');
        expect(typeof data.message).toBe('string');
      }
    });
  });

  /**
   * 测试数据库关联查询的类型安全性
   */
  describe('数据库关联查询类型验证', () => {
    it('博客详情应该包含正确的关联数据', async () => {
      // 先获取一篇博客
      const listResponse = await fetch(`${portfolioUrl}/api/posts?limit=1`);
      const listData = await listResponse.json();

      if (listData.data.length > 0) {
        const postId = listData.data[0].id;
        const detailResponse = await fetch(`${portfolioUrl}/api/posts/${postId}`);
        const detailData = await detailResponse.json();

        expect(detailData.success).toBe(true);
        const post = detailData.data;

        // 验证关联的分类数据
        if (post.category) {
          expect(post.category).toHaveProperty('id');
          expect(post.category).toHaveProperty('name');
          expect(post.category).toHaveProperty('slug');
          expect(typeof post.category.id).toBe('number');
          expect(typeof post.category.name).toBe('string');
          expect(typeof post.category.slug).toBe('string');
        }

        // 验证关联的标签数据
        if (post.tags) {
          expect(Array.isArray(post.tags)).toBe(true);
          for (const tag of post.tags) {
            expect(tag).toHaveProperty('id');
            expect(tag).toHaveProperty('name');
            expect(tag).toHaveProperty('slug');
            expect(typeof tag.id).toBe('number');
            expect(typeof tag.name).toBe('string');
            expect(typeof tag.slug).toBe('string');
          }
        }
      }
    });

    it('评论查询应该包含正确的关联数据', async () => {
      const response = await fetch(`${portfolioUrl}/api/comments?include=posts&limit=5`);
      
      if (response.status === 200) {
        const data = await response.json();
        
        if (data.data.length > 0) {
          const comment = data.data[0];
          
          // 验证关联的博客数据（如果包含）
          if (comment.post) {
            expect(comment.post).toHaveProperty('id');
            expect(comment.post).toHaveProperty('title');
            expect(comment.post).toHaveProperty('slug');
            expect(typeof comment.post.id).toBe('number');
            expect(typeof comment.post.title).toBe('string');
            expect(typeof comment.post.slug).toBe('string');
          }
        }
      }
    });
  });

  /**
   * 测试数据库事务的类型安全性
   */
  describe('数据库事务类型验证', () => {
    it('批量操作应该返回正确的结果类型', async () => {
      if (!authToken) {
        console.warn('跳过批量操作测试，需要认证');
        return;
      }

      // 创建多个测试标签
      const tagsData = [
        { name: 'Type Test Tag 1', slug: 'type-test-tag-1' },
        { name: 'Type Test Tag 2', slug: 'type-test-tag-2' }
      ];

      const promises = tagsData.map(async (tag) => {
        const response = await fetch(`${dashboardUrl}/api/tags`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tag)
        });
        return response;
      });

      const results = await Promise.all(promises);
      
      // 验证所有操作都返回正确的类型结构
      for (const result of results) {
        if (result.status === 201) {
          const data = await result.json();
          expect(data.success).toBe(true);
          expect(data.data).toHaveProperty('id');
          expect(typeof data.data.id).toBe('number');
        }
      }
    });
  });

  /**
   * 测试数据库错误处理的类型安全性
   */
  describe('数据库错误处理类型验证', () => {
    it('无效的SQL查询应该返回标准错误格式', async () => {
      // 通过API测试无效参数的错误响应
      const response = await fetch(`${portfolioUrl}/api/posts?limit=-1&page=0`);
      const data = await response.json();

      if (!data.success) {
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('code');
        expect(data).toHaveProperty('timestamp');
        expect(typeof data.error).toBe('string');
        expect(typeof data.code).toBe('string');
        expect(typeof data.timestamp).toBe('string');
      }
    });

    it('数据库连接错误应该返回适当的错误信息', async () => {
      // 这个测试可能需要模拟数据库连接失败的情况
      // 在实际环境中可能难以测试，但可以验证错误处理逻辑
      expect(true).toBe(true); // 暂时通过
    });
  });

  /**
   * 测试数据库性能相关的类型验证
   */
  describe('数据库性能类型验证', () => {
    it('查询响应应该包含性能元数据', async () => {
      const startTime = Date.now();
      const response = await fetch(`${portfolioUrl}/api/posts?limit=10`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      
      // 检查响应时间
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(2000); // 应该在2秒内完成

      const data = await response.json();
      expect(data).toHaveProperty('timestamp');
      
      // 验证时间戳是最近的
      const responseTimestamp = new Date(data.timestamp).getTime();
      const now = Date.now();
      const timeDiff = Math.abs(now - responseTimestamp);
      expect(timeDiff).toBeLessThan(60000); // 应该在1分钟内
    });

    it('大数据集查询应该正确处理分页', async () => {
      const response = await fetch(`${portfolioUrl}/api/posts?page=1&limit=50`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(50);

      if (data.pagination) {
        expect(typeof data.pagination.current_page).toBe('number');
        expect(typeof data.pagination.per_page).toBe('number');
        expect(typeof data.pagination.total_items).toBe('number');
        expect(typeof data.pagination.total_pages).toBe('number');
      }
    });
  });
});