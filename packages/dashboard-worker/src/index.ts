import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
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
import type { AdminUser, DashboardEnv } from './types';

// 中间件变量类型
interface Variables {
  user?: AdminUser;
  dbOptimizer?: DatabaseOptimizer;
  authOptimizer?: AuthOptimizer;
  middleware?: ReturnType<typeof createMiddlewareInstances>;
}

// 创建性能优化中间件实例（添加两级缓存支持）
const createMiddlewareInstances = (env: DashboardEnv) => {
  const dbOptimizer = new DatabaseOptimizer(env.SHARED_DB, env.CACHE); // 传入 KV 缓存
  const authOptimizer = new AuthOptimizer(env.JWT_SECRET, env.SESSIONS);

  return {
    dbOptimizer,
    authOptimizer
  };
};

// 性能统计
const performanceStats = {
  requestCount: 0,
  avgResponseTime: 0,
  errorCount: 0,
  startTime: Date.now()
};

// 差异化的静态资源缓存策略
const getCacheControlHeader = (pathname: string): string => {
  // JS/CSS 带版本号hash，可永久缓存
  if (/\.(js|css)\.\w{8,}\.(js|css)$/.test(pathname) || /\-[a-f0-9]{8,}\.(js|css)$/.test(pathname)) {
    return 'public, max-age=31536000, immutable';
  }
  // 图片资源
  if (/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i.test(pathname)) {
    return 'public, max-age=604800'; // 7天
  }
  // 字体文件
  if (/\.(woff|woff2|ttf|eot)$/i.test(pathname)) {
    return 'public, max-age=2592000'; // 30天
  }
  // HTML 文件
  if (pathname.endsWith('.html') || pathname === '/' || !pathname.includes('.')) {
    return 'public, max-age=300, must-revalidate'; // 5分钟
  }
  // JSON 等数据文件
  if (/\.(json|xml|txt)$/i.test(pathname)) {
    return 'public, max-age=1800'; // 30分钟
  }
  // 默认
  return 'public, max-age=3600'; // 1小时
};

const app = new Hono<{ Bindings: DashboardEnv; Variables: Variables }>();

// 初始化中间件实例（仅创建一次）
app.use('*', async (c, next) => {
  const middleware = createMiddlewareInstances(c.env);
  c.set('middleware', middleware);
  c.set('dbOptimizer', middleware.dbOptimizer);
  c.set('authOptimizer', middleware.authOptimizer);
  await next();
});

// 全局性能中间件（合并响应时间统计）
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
  const middleware = c.get('middleware')!;
  const stats = middleware.dbOptimizer.getQueryStats();
  if (stats.length > 0) {
    const avgQueryTime = stats.reduce((sum, stat) => sum + stat.avgTime, 0) / stats.length;
    c.header('X-DB-Avg-Time', `${avgQueryTime.toFixed(2)}ms`);
    c.header('X-DB-Queries', stats.length.toString());
  }

  // 更新性能统计
  performanceStats.requestCount++;
  performanceStats.avgResponseTime =
    (performanceStats.avgResponseTime * (performanceStats.requestCount - 1) + responseTime) /
    performanceStats.requestCount;
});

// CORS配置
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8788',
      'http://127.0.0.1:8788',
      'https://dashboard.qianshe.top'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
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
  const middleware = c.get('middleware')!;
  const dbStats = middleware.dbOptimizer.getQueryStats();

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

// 公开的文件访问端点（从R2读取用户上传的文件）
// 注意：如果 R2 中找不到文件，会继续到静态文件处理器
app.get('/assets/:filename', async (c, next) => {
  try {
    const filename = c.req.param('filename');
    const bucket = c.env.UPLOAD_BUCKET;

    // 如果未配置 R2，则交给后续静态资源处理
    if (!bucket) {
      return await next();
    }

    // 从 R2 获取文件
    const object = await bucket.get(filename);

    // 如果 R2 中没有该文件，继续到静态文件处理器
    if (!object) {
      return await next();
    }

    // 返回文件内容
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error('Failed to fetch file from R2:', error);
    // 出错时也继续到静态文件处理器
    return await next();
  }
});

// 受保护的路由中间件
app.use('/api/*', async (c, next) => {
  // 跳过 OPTIONS 请求的认证检查（CORS 预检）
  if (c.req.method === 'OPTIONS') {
    // 让 CORS 中间件已经处理了响应头，直接返回成功
    return new Response(null, { status: 204 });
  }

  const middleware = c.get('middleware')!;
  // 应用认证中间件
  const authMiddleware = middleware.authOptimizer.middleware();
  return authMiddleware(c, next);
});

// 管理员权限路由
app.use('/api/admin/*', async (c, next) => {
  const middleware = c.get('middleware')!;
  const adminMiddleware = middleware.authOptimizer.middleware(permissionConfigs.admin);
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
  const middleware = c.get('middleware')!;
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
  middleware.dbOptimizer.clearCache(pattern);

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

// 静态文件服务 - 使用新的 ASSETS 绑定处理所有非 API 请求
app.get('*', async c => {
  const pathname = new URL(c.req.url).pathname;

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

  // 使用新的 ASSETS 绑定服务静态文件
  if (c.env.ASSETS) {
    try {
      const response = await c.env.ASSETS.fetch(c.req.raw);

      // 添加差异化缓存策略
      const newResponse = new Response(response.body, response);
      const cacheControl = getCacheControlHeader(pathname);
      newResponse.headers.set('Cache-Control', cacheControl);

      if (c.env.ENVIRONMENT === 'development') {
        console.log(`[Static Assets] Served: ${pathname}`);
      }

      return newResponse;
    } catch (error) {
      // 对于 SPA，404 时返回 index.html
      try {
        const indexRequest = new Request(new URL('/index.html', c.req.url).toString(), c.req.raw);
        const indexResponse = await c.env.ASSETS.fetch(indexRequest);
        const newResponse = new Response(indexResponse.body, indexResponse);
        newResponse.headers.set('Content-Type', 'text/html');
        return newResponse;
      } catch (indexError) {
        console.error('Failed to serve static assets:', error);
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
  }

  // 如果 ASSETS 绑定不可用（本地开发）
  if (c.env.ENVIRONMENT === 'development') {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Dashboard - 开发环境配置</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .error {
              background: #fee;
              border: 1px solid #fcc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .solution {
              background: #efe;
              border: 1px solid #cfc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            code {
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
            }
            pre {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <h1>⚠️ 静态资源服务未配置</h1>

          <div class="error">
            <h3>问题</h3>
            <p>ASSETS 绑定未初始化。请确保前端已构建且配置正确。</p>
            <p>请求路径: <code>${pathname}</code></p>
          </div>

          <div class="solution">
            <h3>✅ 解决方案 1：构建前端</h3>
            <pre>cd ../dashboard-frontend && npm run build</pre>
            <p>然后重启 Worker 开发服务器：</p>
            <pre>npm run dev</pre>
          </div>

          <div class="solution">
            <h3>✅ 解决方案 2：使用前后端分离开发</h3>
            <pre>
# 终端 1：前端开发服务器
cd packages/dashboard-frontend
npm run dev  # http://localhost:5173

# 终端 2：Worker API 服务器
cd packages/dashboard-worker
npm run dev  # http://localhost:8788
            </pre>
          </div>
        </body>
      </html>
    `, 503);
  }

  return c.json(
    {
      success: false,
      error: 'Static assets not configured',
      code: 'CONFIGURATION_ERROR'
    },
    503
  );
});

// 性能统计（已合并到全局性能中间件中）

export default {
  fetch: app.fetch,

  // 可选：添加定时任务处理器
  async scheduled(event: ScheduledEvent, env: DashboardEnv, ctx: ExecutionContext): Promise<void> {
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

