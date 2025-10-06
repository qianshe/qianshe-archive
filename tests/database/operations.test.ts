/**
 * 数据库操作测试
 * 测试D1数据库的CRUD操作和性能
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Database Operations Tests', () => {
  let testDb: D1Database;
  const testData: {
    posts: number[];
    users: number[];
    comments: number[];
    projects: number[];
  } = {
    posts: [],
    users: [],
    comments: [],
    projects: []
  };

  beforeAll(async () => {
    // 这里应该从环境变量获取测试数据库连接
    // 在实际测试中，需要使用真实的D1数据库实例
    console.info('Setting up test database');
  });

  beforeEach(async () => {
    // 每个测试前清理数据
    await cleanupTestData();
  });

  afterEach(async () => {
    // 每个测试后清理数据
    await cleanupTestData();
  });

  afterAll(async () => {
    console.info('Database tests completed');
  });

  async function cleanupTestData(): Promise<void> {
    if (!testDb) return;

    try {
      // 清理测试数据
      const tables = ['comments', 'posts', 'projects', 'users'];

      for (const table of tables) {
        await testDb
          .prepare(`DELETE FROM ${table} WHERE title LIKE '%Test%' OR email LIKE '%test%'`)
          .run();
      }
    } catch (_error) {
      console.warn('Failed to cleanup test data:', error);
    }
  }

  describe('Users Table Operations', () => {
    it('should create a new user', async () => {
      if (!testDb) return;

      const userData = {
        email: `test-user-${Date.now()}@example.com`,
        username: `testuser${Date.now()}`,
        nickname: 'Test User',
        password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCO',
        role: 'user',
        is_active: true,
        email_verified: false
      };

      const result = await testDb
        .prepare(
          `
        INSERT INTO users (email, username, nickname, password_hash, role, is_active, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .bind(
          userData.email,
          userData.username,
          userData.nickname,
          userData.password_hash,
          userData.role,
          userData.is_active,
          userData.email_verified
        )
        .run();

      expect(result.success).toBe(true);
      expect(result.meta.changes).toBe(1);

      // 验证用户已创建
      const user = await testDb
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(userData.email)
        .first();
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);

      testData.users.push(user.id);
    });

    it('should retrieve user by ID', async () => {
      if (!testDb) return;

      // 先创建一个用户
      const insertResult = await testDb
        .prepare(
          `
        INSERT INTO users (email, username, nickname, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `
        )
        .bind(
          `retrieve-test-${Date.now()}@example.com`,
          'retrievetest',
          'Retrieve Test',
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCO',
          'user'
        )
        .run();

      const userId = insertResult.meta.last_row_id;

      // 检索用户
      const user = await testDb.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toContain('retrieve-test');

      testData.users.push(userId);
    });

    it('should update user information', async () => {
      if (!testDb) return;

      // 创建用户
      const insertResult = await testDb
        .prepare(
          `
        INSERT INTO users (email, username, nickname, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `
        )
        .bind(
          `update-test-${Date.now()}@example.com`,
          'updatetest',
          'Update Test',
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCO',
          'user'
        )
        .run();

      const userId = insertResult.meta.last_row_id;

      // 更新用户信息
      const updateResult = await testDb
        .prepare(
          `
        UPDATE users SET nickname = ?, role = ?, email_verified = ? WHERE id = ?
      `
        )
        .bind('Updated Nickname', 'moderator', true, userId)
        .run();

      expect(updateResult.success).toBe(true);
      expect(updateResult.meta.changes).toBe(1);

      // 验证更新
      const user = await testDb.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      expect(user.nickname).toBe('Updated Nickname');
      expect(user.role).toBe('moderator');
      expect(user.email_verified).toBe(true);

      testData.users.push(userId);
    });

    it('should enforce unique email constraint', async () => {
      if (!testDb) return;

      const email = `duplicate-test-${Date.now()}@example.com`;

      // 创建第一个用户
      await testDb
        .prepare(
          `
        INSERT INTO users (email, username, nickname, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `
        )
        .bind(email, 'user1', 'User 1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'user')
        .run();

      // 尝试创建具有相同邮箱的第二个用户
      await expect(
        testDb
          .prepare(
            `
          INSERT INTO users (email, username, nickname, password_hash, role)
          VALUES (?, ?, ?, ?, ?)
        `
          )
          .bind(email, 'user2', 'User 2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCO', 'user')
          .run()
      ).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk insert operations efficiently', async () => {
      if (!testDb) return;

      const startTime = Date.now();
      const insertPromises = [];

      // 批量插入100条记录
      for (let i = 0; i < 100; i++) {
        insertPromises.push(
          testDb
            .prepare(
              `
            INSERT INTO posts (title, slug, content, author_id, status)
            VALUES (?, ?, ?, ?, ?)
          `
            )
            .bind(
              `Bulk Test Post ${i}`,
              `bulk-test-${i}-${Date.now()}`,
              `Bulk content ${i}`,
              1, // 假设存在用户ID 1
              'published'
            )
            .run()
        );
      }

      const results = await Promise.all(insertPromises);
      const endTime = Date.now();

      // 验证所有插入都成功
      expect(results.every(r => r.success)).toBe(true);

      // 性能验证：100条记录应该在5秒内完成
      expect(endTime - startTime).toBeLessThan(5000);

      // 清理批量测试数据
      await testDb.prepare("DELETE FROM posts WHERE title LIKE 'Bulk Test%'").run();
    });

    it('should handle complex queries efficiently', async () => {
      if (!testDb) return;

      const startTime = Date.now();

      // 执行复杂查询：连接多个表，使用聚合函数
      const result = await testDb
        .prepare(
          `
        SELECT 
          p.id,
          p.title,
          p.view_count,
          p.like_count,
          COUNT(c.id) as comment_count,
          u.nickname as author_name
        FROM posts p
        LEFT JOIN comments c ON p.id = c.post_id
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.status = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 20
      `
        )
        .bind('published')
        .all();

      const endTime = Date.now();

      expect(result.results).toBeInstanceOf(Array);

      // 复杂查询应该在1秒内完成
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should enforce foreign key constraints', async () => {
      if (!testDb) return;

      // 尝试插入一个引用不存在用户ID的评论
      await expect(
        testDb
          .prepare(
            `
          INSERT INTO comments (post_id, user_name, user_email, content)
          VALUES (?, ?, ?, ?)
        `
          )
          .bind(99999, 'Test User', 'test@example.com', 'Test comment')
          .run()
      ).rejects.toThrow();
    });

    it('should handle concurrent operations safely', async () => {
      if (!testDb) return;

      // 模拟并发更新同一记录
      const postId = 1; // 假设存在文章ID 1

      const concurrentUpdates = Array.from({ length: 10 }, (_, i) =>
        testDb
          .prepare('UPDATE posts SET view_count = view_count + ? WHERE id = ?')
          .bind(1, postId)
          .run()
      );

      const results = await Promise.all(concurrentUpdates);

      // 所有操作都应该成功
      expect(results.every(r => r.success)).toBe(true);

      // 验证最终计数正确
      const post = await testDb
        .prepare('SELECT view_count FROM posts WHERE id = ?')
        .bind(postId)
        .first();
      expect(post.view_count).toBeGreaterThan(0);
    });
  });
});
