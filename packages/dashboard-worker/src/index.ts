import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import { authRoutes } from './handlers/auth';
import { postRoutes } from './handlers/posts';
import { projectRoutes } from './handlers/projects';
import { commentRoutes } from './handlers/comments';
import { userRoutes } from './handlers/users';
import { analyticsRoutes } from './handlers/analytics';
import { uploadRoutes } from './handlers/upload';
import { settingsRoutes } from './handlers/settings';
// import { authMiddleware } from './middleware/auth';
// import { errorHandler } from './middleware/errorHandler';
import { DatabaseOptimizer } from './middleware/database';
import { AuthOptimizer, permissionConfigs } from './middleware/auth';
import type { AdminUser } from './types';

// 中间件变量类型
interface Variables {
  user?: AdminUser;
  dbOptimizer?: DatabaseOptimizer;
}

type Bindings = {
  SHARED_DB: D1Database;
  SESSIONS_KV: KVNamespace;
  CACHE_KV: KVNamespace;
  UPLOADS_BUCKET: R2Bucket;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ENVIRONMENT: string;
  SITE_URL: string;
  API_BASE_URL: string;
  __STATIC_CONTENT?: KVNamespace;
};

// 创建性能优化中间件实例
const createMiddlewareInstances = (env: Bindings) => {
  const dbOptimizer = new DatabaseOptimizer(env.SHARED_DB);
  const authOptimizer = new AuthOptimizer(env.JWT_SECRET, env.SESSIONS_KV);

  return {
    dbOptimizer,
    authOptimizer
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 全局性能中间件
app.use('*', async (c, next) => {
  const startTime = Date.now();

  // 添加性能头
  c.header('X-Powered-By', 'Cloudflare Workers');
  c.header('X-Response-ID', Math.random().toString(36).substring(2));
  c.header('X-Backend', 'qianshe-dashboard');

  await next();

  // 计算响应时间
  const responseTime = Date.now() - startTime;
  c.header('X-Response-Time', `${responseTime}ms`);

  // 添加数据库统计信息
  const { dbOptimizer } = createMiddlewareInstances(c.env);
  const stats = dbOptimizer.getQueryStats();
  if (stats.length > 0) {
    const avgQueryTime = stats.reduce((sum, stat) => sum + stat.avgTime, 0) / stats.length;
    c.header('X-DB-Avg-Time', `${avgQueryTime.toFixed(2)}ms`);
    c.header('X-DB-Queries', stats.length.toString());
  }
});

// 数据库优化中间件
app.use('*', async (c, next) => {
  const { dbOptimizer } = createMiddlewareInstances(c.env);
  c.set('dbOptimizer', dbOptimizer);
  await next();
});

// CORS配置
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8788', 'https://dashboard.qianshe.top'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  })
);

// 日志中间件
app.use(
  '*',
  logger((message, ...rest) => {
    // Only log in development environment
    const env = process.env.ENVIRONMENT || 'development';
    if (env === 'development') {
      console.log(`[${new Date().toISOString()}] ${message}`, ...rest);
    }
  })
);

// 健康检查（不经过认证）
app.get('/health', c => {
  return c.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
    version: '2.0.0',
    uptime: Date.now() - (globalThis as typeof globalThis).startTime || 0
  });
});

// 性能监控端点
app.get('/api/performance/stats', async c => {
  const { dbOptimizer } = createMiddlewareInstances(c.env);
  const dbStats = dbOptimizer.getQueryStats();

  return c.json({
    success: true,
    data: {
      database: {
        queryCount: dbStats.length,
        avgQueryTime:
          dbStats.length > 0
            ? dbStats.reduce((sum, stat) => sum + stat.avgTime, 0) / dbStats.length
            : 0,
        slowQueries: dbStats.filter(stat => stat.avgTime > 1000)
      },
      cache: {
        // 这里可以添加缓存统计
      }
    }
  });
});

// 公开路由（不需要认证）
app.route('/api/auth', authRoutes);

// 公开的analytics追踪接口
app.post('/api/analytics/track', async c => {
  const analyticsHandler = await import('./handlers/analytics');
  // 创建一个简单的ExecutionContext
  const executionContext: ExecutionContext = {
    waitUntil: (promise: Promise<unknown>) => promise,
    passThroughOnException: () => {},
    props: {}
  };
  return analyticsHandler.analyticsRoutes.fetch(c.req.raw, c.env, executionContext);
});

// 受保护的路由中间件
app.use('/api/*', async (c, next) => {
  const { authOptimizer } = createMiddlewareInstances(c.env);

  // 应用认证中间件
  const authMiddleware = authOptimizer.middleware();
  return authMiddleware(c, next);
});

// 管理员权限路由
app.use('/api/admin/*', async (c, next) => {
  const { authOptimizer } = createMiddlewareInstances(c.env);

  const adminMiddleware = authOptimizer.middleware(permissionConfigs.admin);
  return adminMiddleware(c, next);
});

// API路由（需要认证）
app.route('/api/posts', postRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/comments', commentRoutes);
app.route('/api/users', userRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/settings', settingsRoutes);

// 管理员路由
app.use('/api/admin/*', async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json(
      {
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      },
      403
    );
  }
  await next();
});

// 清除缓存端点
app.post('/api/admin/clear-cache', async c => {
  const { dbOptimizer, authOptimizer } = createMiddlewareInstances(c.env);
  const user = c.get('user');

  if (!user || user.role !== 'admin') {
    return c.json(
      {
        success: false,
        error: 'Admin access required'
      },
      403
    );
  }

  const { pattern } = (await c.req.json()) as { pattern?: string };

  // 清除数据库缓存
  dbOptimizer.clearCache(pattern);

  // 清除认证缓存
  if (pattern === 'all') {
    // 清除所有用户的权限缓存
    // 这里可以实现批量清除逻辑
  }

  return c.json({
    success: true,
    message: 'Cache cleared successfully'
  });
});

// 增强的错误处理中间件
app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    // Only log errors in development environment
    if (c.env.ENVIRONMENT === 'development') {
      console.error('Unhandled error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: c.req.url,
        method: c.req.method,
        user: c.get('user')?.id || 'anonymous',
        timestamp: new Date().toISOString()
      });
    }

    const isDevelopment = c.env.ENVIRONMENT === 'development';

    return c.json(
      {
        success: false,
        error: isDevelopment
          ? error instanceof Error
            ? error.message
            : 'Unknown error'
          : 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId: c.req.header('X-Response-ID') || Math.random().toString(36).substring(2)
      },
      500
    );
  }
});

// 静态文件服务 - 处理所有非 API 请求
app.get('*', async c => {
  const url = new URL(c.req.url);
  const pathname = url.pathname;

  // API 路由已经在前面处理,如果到了这里说明是 404
  if (pathname.startsWith('/api')) {
    return c.json(
      {
        success: false,
        error: 'API endpoint not found',
        code: 'NOT_FOUND',
        availableEndpoints: [
          '/health',
          '/api/auth/*',
          '/api/posts/*',
          '/api/projects/*',
          '/api/comments/*',
          '/api/users/*',
          '/api/analytics/*',
          '/api/upload/*',
          '/api/settings/*',
          '/api/admin/*'
        ]
      },
      404
    );
  }

  // 尝试从 KV 获取静态资源
  try {
    // 创建 ExecutionContext
    const executionContext: ExecutionContext = {
      waitUntil: (promise: Promise<unknown>) => promise,
      passThroughOnException: () => {},
      props: {}
    };

    const asset = await getAssetFromKV(
      {
        request: c.req.raw,
        waitUntil: (promise: Promise<unknown>) => executionContext.waitUntil(promise)
      },
      {
        ASSET_NAMESPACE: c.env.__STATIC_CONTENT!,
        ASSET_MANIFEST: {},
      }
    );

    // 添加缓存头
    const response = new Response(asset.body, asset);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  } catch (e) {
    // 如果找不到资源,返回 index.html (用于 SPA 路由)
    try {
      const executionContext: ExecutionContext = {
        waitUntil: (promise: Promise<unknown>) => promise,
        passThroughOnException: () => {},
        props: {}
      };

      const indexAsset = await getAssetFromKV(
        {
          request: new Request(`${url.origin}/index.html`, c.req.raw),
          waitUntil: (promise: Promise<unknown>) => executionContext.waitUntil(promise)
        },
        {
          ASSET_NAMESPACE: c.env.__STATIC_CONTENT!,
          ASSET_MANIFEST: {},
        }
      );

      const response = new Response(indexAsset.body, indexAsset);
      response.headers.set('Content-Type', 'text/html');
      
      return response;
    } catch (indexError) {
      return c.json(
        {
          success: false,
          error: 'Page not found',
          code: 'NOT_FOUND'
        },
        404
      );
    }
  }
});

// 性能统计
const performanceStats = {
  requestCount: 0,
  avgResponseTime: 0,
  errorCount: 0,
  startTime: Date.now()
};

// 全局请求统计
app.use('*', async (c, next) => {
  performanceStats.requestCount++;
  const startTime = Date.now();

  await next();

  const responseTime = Date.now() - startTime;
  performanceStats.avgResponseTime =
    (performanceStats.avgResponseTime * (performanceStats.requestCount - 1) + responseTime) /
    performanceStats.requestCount;
});

export default {
  fetch: app.fetch,

  // 可选：添加定时任务处理器
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext): Promise<void> {
    // 每小时执行的清理任务
    if (event.cron === '0 * * * *') {
      if (env.ENVIRONMENT === 'development') {
        console.log('Running scheduled cleanup tasks');
      }

      const { dbOptimizer } = createMiddlewareInstances(env);

      // 清理过期的缓存
      dbOptimizer.clearCache();

      // 可以添加其他定期任务
      if (env.ENVIRONMENT === 'development') {
        console.log('Scheduled cleanup completed');
      }
    }
  },

  // 性能统计导出
  getPerformanceStats: () => performanceStats
};

// 全局启动时间记录
(globalThis as typeof globalThis).startTime = Date.now();
