import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import type { 
  LoginRequest, 
  LoginResponse, 
  AdminUser, 
  DashboardEnv 
} from '../types';
import type {
  AuthResponse,
  TokenPair,
  ApiResponse,
  ErrorResponse
} from '../types/local-shared';

const authRoutes = new Hono<{ 
  Bindings: DashboardEnv;
  Variables: {
    user: AdminUser;
  }
}>();

// 登录请求验证模式
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional()
});

// 刷新token请求验证模式
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// 生成JWT token
function generateTokens(
  userId: number, 
  username: string, 
  role: string, 
  jwtSecret: string
): TokenPair {
  const accessToken = jwt.sign(
    { 
      sub: userId,
      username, 
      role,
      scope: 'access'
    }, 
    jwtSecret, 
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { 
      sub: userId,
      username, 
      role,
      type: 'refresh',
      scope: 'refresh'
    }, 
    jwtSecret, 
    { expiresIn: '7d' }
  );

  return { 
    access_token: accessToken, 
    refresh_token: refreshToken,
    expires_in: 3600,
    token_type: 'Bearer'
  };
}

// 数据库用户到AdminUser的转换
interface DatabaseUser extends Record<string, unknown> {
  id: number;
  username: string;
  email?: string;
  password_hash?: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  login_count?: number;
  created_at?: string;
  updated_at?: string;
}

function mapDbUserToAdminUser(dbUser: DatabaseUser): AdminUser {
  return {
    id: dbUser.id,
    userId: dbUser.id, // 添加userId以保持兼容性
    email: dbUser.email || '',
    username: dbUser.username,
    nickname: dbUser.username || dbUser.email?.split('@')[0] || '',
    role: dbUser.role as 'admin' | 'user' | 'moderator',
    login_count: dbUser.login_count || 0,
    status: dbUser.is_active ? ('active' as const) : ('inactive' as const),
    created_at: dbUser.created_at || new Date().toISOString(),
    updated_at: dbUser.updated_at || new Date().toISOString()
  };
}

// 用户登录
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = loginSchema.parse(body);

    // 查找用户
    const user = await c.env.SHARED_DB.prepare(
      `
      SELECT id, username, email, password_hash, role, is_active, last_login_at, login_count, created_at, updated_at
      FROM users
      WHERE username = ? OR email = ?
    `
    )
      .bind(username, username)
      .first();

    if (!user) {
      throw createError.unauthorized('Invalid username or password');
    }

    // 检查用户是否激活
    if (!(user as DatabaseUser).is_active) {
      throw createError.unauthorized('Account is disabled');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, (user as DatabaseUser).password_hash || '');
    if (!isValidPassword) {
      throw createError.unauthorized('Invalid username or password');
    }

    const adminUser = mapDbUserToAdminUser(user as DatabaseUser);

    // 生成tokens
    const tokens = generateTokens(
      adminUser.id,
      adminUser.username || adminUser.nickname,
      adminUser.role,
      c.env.JWT_SECRET
    );

    // 更新最后登录时间
    await c.env.SHARED_DB.prepare(
      `
      UPDATE users SET last_login_at = datetime('now'), login_count = login_count + 1 WHERE id = ?
    `
    )
      .bind(adminUser.id)
      .run();

    // 记录登录日志
    await c.env.SHARED_DB.prepare(
      `
      INSERT INTO user_sessions (user_id, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `
    )
      .bind(
        adminUser.id,
        c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
        c.req.header('User-Agent') || 'unknown'
      )
      .run();

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: adminUser,
        token: tokens.access_token,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 管理员快速登录（使用环境变量中的管理员密码）
authRoutes.post('/admin-login', async (c) => {
  try {
    const body = await c.req.json();
    const { password } = z
      .object({
        password: z.string().min(1, 'Password is required')
      })
      .parse(body);

    // 验证管理员密码
    const envPassword = c.env.ADMIN_PASSWORD?.trim();
    const inputPassword = password.trim();
    
    console.log('[DEBUG] Admin login attempt:', {
      passwordProvided: !!inputPassword,
      envPasswordExists: !!envPassword,
      passwordLength: inputPassword.length,
      envPasswordLength: envPassword?.length || 0
    });

    if (!envPassword) {
      throw createError.unauthorized('Server configuration error: ADMIN_PASSWORD not set');
    }

    if (inputPassword !== envPassword) {
      console.log('[DEBUG] Password mismatch');
      throw createError.unauthorized('Invalid admin password');
    }
    
    console.log('[DEBUG] Password verified successfully');

    // 查找或创建管理员用户
    let adminUser = await c.env.SHARED_DB.prepare(
      `
      SELECT id, username, email, role, is_active, last_login_at, login_count, created_at, updated_at
      FROM users
      WHERE role = 'admin' AND is_active = 1
      ORDER BY id ASC LIMIT 1
    `
    ).first();

    if (!adminUser) {
      // 如果没有管理员用户，创建一个默认的
      const hashedPassword = await bcrypt.hash(c.env.ADMIN_PASSWORD, 10);
      const result = await c.env.SHARED_DB.prepare(
        `
        INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 'admin', 1, datetime('now'), datetime('now'))
      `
      )
        .bind('admin', 'admin@qianshe.top', hashedPassword)
        .run();

      adminUser = await c.env.SHARED_DB.prepare(
        `
        SELECT id, username, email, role, is_active, last_login_at, login_count, created_at, updated_at
        FROM users WHERE id = ?
      `
      )
        .bind(result.meta.last_row_id)
        .first();
    }

    const user = mapDbUserToAdminUser(adminUser as DatabaseUser);

    // 生成tokens
    const tokens = generateTokens(
      user.id,
      user.username || user.nickname,
      user.role,
      c.env.JWT_SECRET
    );

    // 更新最后登录时间
    await c.env.SHARED_DB.prepare(
      `
      UPDATE users SET last_login_at = datetime('now'), login_count = login_count + 1 WHERE id = ?
    `
    )
      .bind(user.id)
      .run();

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user,
        token: tokens.access_token,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 刷新token
authRoutes.post('/refresh', async (c) => {
  try {
    const body = await c.req.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    // 验证refresh token
    const decoded = jwt.verify(refreshToken, c.env.JWT_SECRET) as jwt.JwtPayload & { sub: number; type: string };

    if (decoded.type !== 'refresh') {
      throw createError.unauthorized('Invalid refresh token');
    }

    // 查找用户
    const user = await c.env.SHARED_DB.prepare(
      `
      SELECT id, username, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = ? AND is_active = 1
    `
    )
      .bind(decoded.sub)
      .first();

    if (!user) {
      throw createError.unauthorized('User not found or inactive');
    }

    const adminUser = mapDbUserToAdminUser(user as DatabaseUser);

    // 生成新的tokens
    const tokens = generateTokens(
      adminUser.id,
      adminUser.username || adminUser.nickname,
      adminUser.role,
      c.env.JWT_SECRET
    );

    const response: ApiResponse<{ tokens: TokenPair }> = {
      success: true,
      data: { tokens },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
});

// 登出
authRoutes.post('/logout', async (c) => {
  // 在实际应用中，可以将token加入黑名单
  // 这里简化处理，客户端删除token即可
  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Logged out successfully',
    timestamp: Date.now()
  };

  return c.json(response);
});

// 验证token有效性
authRoutes.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET) as jwt.JwtPayload & { sub: number; role: string };

    // 查找用户
    const user = await c.env.SHARED_DB.prepare(
      `
      SELECT id, username, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = ? AND is_active = 1
    `
    )
      .bind(decoded.sub)
      .first();

    if (!user) {
      throw createError.unauthorized('User not found or inactive');
    }

    const adminUser = mapDbUserToAdminUser(user as DatabaseUser);

    const response: ApiResponse<{ user: AdminUser }> = {
      success: true,
      data: { user: adminUser },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError.unauthorized('Invalid token');
    }
    throw error;
  }
});

export { authRoutes };