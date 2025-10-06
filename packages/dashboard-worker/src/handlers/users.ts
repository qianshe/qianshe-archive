import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import type { UserRole } from '../types';

// 用户类型定义
type User = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  userId: number;
};

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  ENVIRONMENT: string;
};

const userRoutes = new Hono<{
  Bindings: Bindings;
  Variables: {
    user: User;
  };
}>();

// 用户创建/更新验证模式
const userSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'moderator', 'user']),
  display_name: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  is_active: z.boolean().default(true)
});

// 查询参数验证模式
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  search: z.string().optional(),
  role: z.enum(['admin', 'moderator', 'user']).optional(),
  is_active: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'username', 'last_login_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// 获取用户列表（仅管理员）
userRoutes.get('/', requireRole('admin' as UserRole), async c => {
  try {
    // 正确处理查询参数
    const queries = c.req.queries();
    const queryObj: Record<string, string> = {};

    // 将查询参数对象转换为可迭代的格式
    for (const [key, values] of Object.entries(queries)) {
      queryObj[key] = values[0] || ''; // 取第一个值
    }

    const query = querySchema.parse(queryObj);

    // 构建WHERE条件
    const conditions = [];
    const params = [];

    if (query.search) {
      conditions.push('(username LIKE ? OR email LIKE ? OR display_name LIKE ?)');
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (query.role) {
      conditions.push('role = ?');
      params.push(query.role);
    }

    if (query.is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(query.is_active ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM users
      ${whereClause}
    `;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first();
    const total = (countResult as any)?.total || 0;

    // 获取用户列表（不包含密码哈希）
    const usersQuery = `
      SELECT
        id, username, email, display_name, role, bio, avatar_url, website_url,
        is_active, last_login_at, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${query.sort_by} ${query.sort_order}
      LIMIT ? OFFSET ?
    `;

    const users = await c.env.DB.prepare(usersQuery)
      .bind(...params, query.limit, (query.page - 1) * query.limit)
      .all();

    return c.json({
      success: true,
      data: {
        users: users.results,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit)
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取单个用户
userRoutes.get('/:id', async c => {
  const id = parseInt(c.req.param('id'));
  const currentUser = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid user ID');
  }

  // 检查权限：用户只能查看自己的信息，管理员可以查看所有用户
  if (id !== currentUser.userId && currentUser.role !== 'admin') {
    throw createError.forbidden('You do not have permission to view this user');
  }

  const user = await c.env.DB.prepare(
    `
    SELECT
      id, username, email, display_name, role, bio, avatar_url, website_url,
      is_active, last_login_at, created_at, updated_at
    FROM users
    WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!user) {
    throw createError.notFound('User not found');
  }

  return c.json({
    success: true,
    data: { user }
  });
});

// 创建用户（仅管理员）
userRoutes.post('/', requireRole('admin' as UserRole), async c => {
  try {
    const body = await c.req.json();
    const userData = userSchema.parse(body);

    if (!userData.password) {
      throw createError.badRequest('Password is required when creating a user');
    }

    // 检查用户名和邮箱唯一性
    const existingUser = await c.env.DB.prepare(
      `
      SELECT id FROM users WHERE username = ? OR email = ?
    `
    )
      .bind(userData.username, userData.email)
      .first();

    if (existingUser) {
      throw createError.conflict('Username or email already exists');
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // 创建用户
    const result = await c.env.DB.prepare(
      `
      INSERT INTO users (
        username, email, password_hash, role, display_name, bio, avatar_url,
        website_url, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `
    )
      .bind(
        userData.username,
        userData.email,
        passwordHash,
        userData.role,
        userData.display_name || '',
        userData.bio || '',
        userData.avatar_url || '',
        userData.website_url || '',
        userData.is_active ? 1 : 0
      )
      .run();

    // 获取创建的用户（不包含密码哈希）
    const newUser = await c.env.DB.prepare(
      `
      SELECT
        id, username, email, display_name, role, bio, avatar_url, website_url,
        is_active, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
    `
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(
      {
        success: true,
        data: { user: newUser }
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 更新用户
userRoutes.put('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'));
    const currentUser = c.get('user');
    const body = await c.req.json();
    const userData = userSchema.parse(body);

    if (isNaN(id)) {
      throw createError.badRequest('Invalid user ID');
    }

    // 检查权限：用户只能更新自己的信息，管理员可以更新所有用户
    if (id !== currentUser.userId && currentUser.role !== 'admin') {
      throw createError.forbidden('You do not have permission to update this user');
    }

    // 非管理员不能修改角色和状态
    if (currentUser.role !== 'admin') {
      delete userData.role;
      delete userData.is_active;
    }

    // 检查用户是否存在
    const existingUser = await c.env.DB.prepare(
      `
      SELECT id FROM users WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!existingUser) {
      throw createError.notFound('User not found');
    }

    // 如果更改了用户名或邮箱，检查唯一性
    if (userData.username || userData.email) {
      const current = await c.env.DB.prepare(
        `
        SELECT username, email FROM users WHERE id = ?
      `
      )
        .bind(id)
        .first();

      if (
        (userData.username && userData.username !== (current as any).username) ||
        (userData.email && userData.email !== (current as any).email)
      ) {
        const conflict = await c.env.DB.prepare(
          `
          SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?
        `
        )
          .bind(
            userData.username || (current as any).username,
            userData.email || (current as any).email,
            id
          )
          .first();

        if (conflict) {
          throw createError.conflict('Username or email already exists');
        }
      }
    }

    // 构建更新查询
    const updates = [];
    const params = [];

    if (userData.username) {
      updates.push('username = ?');
      params.push(userData.username);
    }
    if (userData.email) {
      updates.push('email = ?');
      params.push(userData.email);
    }
    if (userData.password) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }
    if (userData.role !== undefined) {
      updates.push('role = ?');
      params.push(userData.role);
    }
    if (userData.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(userData.display_name);
    }
    if (userData.bio !== undefined) {
      updates.push('bio = ?');
      params.push(userData.bio);
    }
    if (userData.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(userData.avatar_url);
    }
    if (userData.website_url !== undefined) {
      updates.push('website_url = ?');
      params.push(userData.website_url);
    }
    if (userData.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(userData.is_active ? 1 : 0);
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    await c.env.DB.prepare(
      `
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `
    )
      .bind(...params)
      .run();

    // 获取更新后的用户
    const updatedUser = await c.env.DB.prepare(
      `
      SELECT
        id, username, email, display_name, role, bio, avatar_url, website_url,
        is_active, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
    `
    )
      .bind(id)
      .first();

    return c.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除用户（仅管理员）
userRoutes.delete('/:id', requireRole('admin' as UserRole), async c => {
  const id = parseInt(c.req.param('id'));
  const currentUser = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid user ID');
  }

  // 不能删除自己
  if (id === currentUser.userId) {
    throw createError.badRequest('You cannot delete yourself');
  }

  // 检查用户是否存在
  const existingUser = await c.env.DB.prepare(
    `
    SELECT id FROM users WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!existingUser) {
    throw createError.notFound('User not found');
  }

  // 软删除：将用户设置为非活跃状态
  await c.env.DB.prepare(
    `
    UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?
  `
  )
    .bind(id)
    .run();

  return c.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// 获取用户统计
userRoutes.get('/stats/overview', requireRole('admin' as UserRole), async c => {
  const stats = await c.env.DB.prepare(
    `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
      COUNT(CASE WHEN role = 'moderator' THEN 1 END) as moderators,
      COUNT(CASE WHEN role = 'user' THEN 1 END) as users,
      COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
      COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive,
      COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as this_week,
      COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as this_month,
      COUNT(CASE WHEN last_login_at >= datetime('now', '-7 days') THEN 1 END) as active_this_week,
      COUNT(CASE WHEN last_login_at >= datetime('now', '-30 days') THEN 1 END) as active_this_month
    FROM users
  `
  ).first();

  return c.json({
    success: true,
    data: { stats }
  });
});

export { userRoutes };
