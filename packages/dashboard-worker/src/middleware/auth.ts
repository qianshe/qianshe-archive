/**
 * 认证和权限验证优化中间件
 * 提供JWT验证、权限缓存和访问控制
 */

import jwt from 'jsonwebtoken';
import type { 
  AdminUser, 
  DashboardPermission, 
  AuthContext 
} from '../types';
import type {
  User as SharedUser,
  UserRole,
  Permission,
  ApiResponse,
  ErrorResponse
} from '../types/local-shared';

// 简化的用户信息接口（用于中间件）
interface MiddlewareUser {
  id: number;
  email: string;
  role: UserRole;
  permissions: string[];
}

interface PermissionCheck {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

interface AuthConfig {
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  allowSelfAccess?: boolean;
  resource?: string;
  action?: string;
}

interface AuthCache {
  user: MiddlewareUser;
  permissions: PermissionCheck[];
  timestamp: number;
  ttl: number;
}

export class AuthOptimizer {
  private jwtSecret: string;
  private kv: KVNamespace;
  private authCache: Map<string, AuthCache> = new Map();

  constructor(jwtSecret: string, kv: KVNamespace) {
    this.jwtSecret = jwtSecret;
    this.kv = kv;
  }

  /**
   * 验证JWT令牌
   */
  private async verifyToken(token: string): Promise<MiddlewareUser | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { sub: string; role: string; email?: string; permissions?: string[] };

      // 基础验证
      if (!decoded.sub || !decoded.role) {
        return null;
      }

      const userId = typeof decoded.sub === 'string' ? parseInt(decoded.sub) : decoded.sub;
      return {
        id: userId,
        userId: userId, // 确保 userId 和 id 一致
        email: decoded.email || '',
        role: decoded.role as UserRole,
        permissions: decoded.permissions || []
      } as unknown as MiddlewareUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取用户权限
   */
  private async getUserPermissions(userId: number, role: UserRole): Promise<PermissionCheck[]> {
    try {
      // 尝试从KV获取缓存的权限
      const cacheKey = `user_permissions:${userId}`;
      const cached = await this.kv.get(cacheKey);

      if (cached) {
        const cacheData = JSON.parse(cached);
        if (Date.now() - cacheData.timestamp < cacheData.ttl * 1000) {
          return cacheData.permissions;
        }
      }

      // 从数据库获取权限
      const permissions = await this.getPermissionsFromDatabase(userId, role);

      // 缓存权限
      await this.kv.put(
        cacheKey,
        JSON.stringify({
          permissions,
          timestamp: Date.now(),
          ttl: 1800 // 30分钟缓存
        }),
        {
          expirationTtl: 1800
        }
      );

      return permissions;
    } catch (error) {
      if (process.env.ENVIRONMENT === 'development') {
        console.error('Error getting user permissions:', error);
      }
      return [];
    }
  }

  /**
   * 从数据库获取权限
   */
  private async getPermissionsFromDatabase(userId: number, role: UserRole): Promise<PermissionCheck[]> {
    // 这里应该查询数据库获取用户权限
    // 暂时返回基于角色的默认权限
    const rolePermissions: Record<UserRole, PermissionCheck[]> = {
      admin: [{ resource: '*', action: '*' }],
      moderator: [
        { resource: 'posts', action: 'create' },
        { resource: 'posts', action: 'read' },
        { resource: 'posts', action: 'update' },
        { resource: 'posts', action: 'delete' },
        { resource: 'comments', action: 'read' },
        { resource: 'comments', action: 'approve' },
        { resource: 'comments', action: 'delete' },
        { resource: 'users', action: 'read' }
      ],
      user: [
        { resource: 'posts', action: 'create' },
        { resource: 'posts', action: 'read' },
        { resource: 'comments', action: 'create' },
        { resource: 'comments', action: 'read' }
      ],
      guest: [
        { resource: 'posts', action: 'read' },
        { resource: 'comments', action: 'read' }
      ]
    };

    return rolePermissions[role] || rolePermissions.guest;
  }

  /**
   * 检查权限
   */
  private async checkPermission(
    user: MiddlewareUser,
    requiredPermissions: string[],
    resource?: string,
    action?: string
  ): Promise<boolean> {
    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return true;
    }

    // 如果没有权限要求，允许访问
    if (requiredPermissions.length === 0) {
      return true;
    }

    // 获取用户所有权限
    const userPermissions =
      user.permissions.length > 0
        ? user.permissions.map(p => {
          const [res, act] = p.split(':');
          return { resource: res, action: act };
        })
        : await this.getUserPermissions(user.id, user.role);

    // 检查是否有所需权限
    return requiredPermissions.some(requiredPermission => {
      return userPermissions.some(userPermission => {
        // 检查权限格式
        const [res, act] = requiredPermission.split(':');
        const userResource = userPermission.resource;
        const userAction = userPermission.action;

        // 通配符权限
        if (userResource === '*' && userAction === '*') {
          return true;
        }

        // 资源通配符
        if (userResource === '*' && userAction === act) {
          return true;
        }

        // 动作通配符
        if (userResource === res && userAction === '*') {
          return true;
        }

        // 完全匹配
        return userResource === res && userAction === act;
      });
    });
  }

  /**
   * 从请求中提取令牌
   */
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  /**
   * 检查自访问权限
   */
  private async checkSelfAccess(request: Request, user: MiddlewareUser, resource?: string): Promise<boolean> {
    if (!resource) {
      return false;
    }

    // 从URL中提取资源ID
    const url = new URL(request.url);
    const resourceParts = resource.split('/');
    const resourceId = url.pathname.split('/').pop();

    if (!resourceId || isNaN(parseInt(resourceId))) {
      return false;
    }

    // 检查是否为用户自己的资源
    switch (resourceParts[0]) {
      case 'users':
        return user.id === parseInt(resourceId);

      case 'posts':
        // 检查是否为文章作者
        const db = (request as { env?: { SHARED_DB?: D1Database } }).env?.SHARED_DB;
        if (!db) return false;

        try {
          const result = await db
            .prepare('SELECT author_id FROM posts WHERE id = ?')
            .bind(parseInt(resourceId))
            .first();
          return result && result.author_id === user.id;
        } catch (error) {
          return false;
        }

      case 'comments':
        // 检查是否为评论作者
        return false; // 暂时返回false，需要根据实际业务逻辑处理

      default:
        return false;
    }
  }

  /**
   * 创建认证中间件
   */
  middleware(config?: AuthConfig) {
    return async (c: { req: { raw: Request }; set: (key: string, value: unknown) => void; json: (data: unknown, status?: number) => Response }, next: () => Promise<void>) => {
      const startTime = Date.now();

      try {
        // 提取令牌
        const token = this.extractToken(c.req.raw);
        if (!token) {
          const errorResponse: ErrorResponse = {
            success: false,
            error: 'Authentication token is required',
            code: 'AUTH_REQUIRED',
            timestamp: Date.now()
          };
          return c.json(errorResponse, 401);
        }

        // 验证令牌
        const user = await this.verifyToken(token);
        if (!user) {
          const errorResponse: ErrorResponse = {
            success: false,
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
            timestamp: Date.now()
          };
          return c.json(errorResponse, 401);
        }

        // 检查角色
        if (config?.requiredRole && user.role !== config.requiredRole && user.role !== 'admin') {
          const errorResponse: ErrorResponse = {
            success: false,
            error: 'Insufficient role privileges',
            code: 'INSUFFICIENT_ROLE',
            timestamp: Date.now()
          };
          return c.json(errorResponse, 403);
        }

        // 检查权限
        const requiredPermissions = config?.requiredPermissions || [];
        const hasPermission = await this.checkPermission(
          user,
          requiredPermissions,
          config?.resource,
          config?.action
        );

        if (!hasPermission) {
          // 检查自访问权限
          if (config?.allowSelfAccess) {
            const selfAccess = await this.checkSelfAccess(c.req.raw, user, config.resource);
            if (!selfAccess) {
              const errorResponse: ErrorResponse = {
                success: false,
                error: 'Access denied',
                code: 'ACCESS_DENIED',
                timestamp: Date.now()
              };
              return c.json(errorResponse, 403);
            }
          } else {
            const errorResponse: ErrorResponse = {
              success: false,
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS',
              timestamp: Date.now()
            };
            return c.json(errorResponse, 403);
          }
        }

        // 将用户信息注入到上下文
        c.set('user', user);

        // 记录认证时间
        c.set('authTime', Date.now() - startTime);

        await next();
      } catch (error) {
        if (process.env.ENVIRONMENT === 'development') {
          console.error('Auth middleware error:', error);
        }
        const errorResponse: ErrorResponse = {
          success: false,
          error: 'Authentication service unavailable',
          code: 'AUTH_ERROR',
          timestamp: Date.now()
        };
        return c.json(errorResponse, 500);
      }
    };
  }

  /**
   * 创建可选认证中间件（不要求认证，但如果提供了令牌则验证）
   */
  optionalMiddleware() {
    return async (c: { req: { raw: Request }; set: (key: string, value: unknown) => void; json: (data: unknown, status?: number) => Response }, next: () => Promise<void>) => {
      const token = this.extractToken(c.req.raw);

      if (token) {
        const user = await this.verifyToken(token);
        if (user) {
          c.set('user', user);
        }
      }

      await next();
    };
  }

  /**
   * 清除用户缓存
   */
  async clearUserCache(userId: number): Promise<void> {
    const cacheKey = `user_permissions:${userId}`;
    await this.kv.delete(cacheKey);
  }

  /**
   * 获取活跃用户统计
   */
  async getActiveUsers(): Promise<{ count: number; users: MiddlewareUser[] }> {
    // 这里可以从KV获取活跃用户信息
    // 暂时返回示例数据
    return {
      count: 0,
      users: []
    };
  }
}

/**
 * 预定义的权限配置
 */
export const permissionConfigs = {
  // 管理员权限
  admin: {
    requiredRole: 'admin' as UserRole
  },

  // 版主权限
  moderator: {
    requiredRole: 'moderator' as UserRole
  },

  // 作者权限
  author: {
    requiredRole: 'author' as UserRole
  },

  // 编辑权限
  editor: {
    requiredRole: 'editor' as UserRole
  },

  // 只读权限
  viewer: {
    requiredRole: 'viewer' as UserRole
  },

  // 内容管理权限
  contentManager: {
    requiredPermissions: ['posts:create', 'posts:update', 'posts:delete']
  },

  // 用户管理权限
  userManager: {
    requiredPermissions: ['users:read', 'users:update', 'users:delete']
  },

  // 自访问权限
  selfAccess: {
    requiredPermissions: ['posts:read'],
    allowSelfAccess: true
  }
};

// 辅助函数：检查资源访问权限
export async function canAccessResource(c: { env: { SHARED_DB: D1Database }; get: (key: string) => AdminUser }, resourceType: string, resourceId: number): Promise<boolean> {
  const user = c.get('user');
  
  // 管理员可以访问所有资源
  if (user.role === 'admin') {
    return true;
  }

  switch (resourceType) {
    case 'post':
      // 检查是否为文章作者
      const post = await c.env.SHARED_DB.prepare(
        'SELECT author_id FROM posts WHERE id = ?'
      ).bind(resourceId).first();
      
      return post && post.author_id === user.userId;

    case 'comment':
      // 检查是否为评论作者
      const comment = await c.env.SHARED_DB.prepare(
        'SELECT user_email FROM comments WHERE id = ?'
      ).bind(resourceId).first();
      
      return comment && comment.user_email === user.email;

    case 'user':
      // 用户只能访问自己的信息
      return resourceId === user.userId;

    default:
      return false;
  }
}

// 辅助函数：要求特定角色
export const requireRole = (role: UserRole) => {
  return AuthOptimizer.prototype.middleware.call({ jwtSecret: '', kv: null }, { requiredRole: role });
};

// 辅助函数：要求特定权限
export const requirePermission = (permission: string) => {
  return AuthOptimizer.prototype.middleware.call({ jwtSecret: '', kv: null }, { requiredPermissions: [permission] });
};