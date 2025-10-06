import { Hono } from 'hono';
import { createApiRoutes } from './routes/api';
import { Env } from './types';
import { CacheManager } from './middleware/cache';
import { StaticOptimizer, staticMiddleware } from './middleware/static';
import { ResponseOptimizer } from './middleware/response';

// 创建性能优化中间件实例
const createMiddlewareInstances = (env: Env) => {
  const cacheManager = new CacheManager(env.CACHE);
  const staticOptimizer = new StaticOptimizer();
  const responseOptimizer = new ResponseOptimizer({
    compress: true,
    pretty: env.ENVIRONMENT === 'development',
    cors: true,
    rateLimit: {
      requests: 100,
      window: 60
    }
  });

  return {
    staticMiddleware: staticOptimizer.middleware(),
    responseMiddleware: responseOptimizer.middleware(),
    cacheManager,
    responseOptimizer
  };
};

// 创建主应用
const app = new Hono<{ Bindings: Env }>();

// 全局中间件
app.use('*', async (c, next) => {
  const startTime = Date.now();

  // 添加性能头
  c.header('X-Powered-By', 'Cloudflare Workers');
  c.header('X-Response-ID', Math.random().toString(36).substring(2));

  await next();

  // 计算响应时间
  const responseTime = Date.now() - startTime;
  c.header('X-Response-Time', `${responseTime}ms`);
});

// 静态资源处理
app.use('*', staticMiddleware);

// API路由优化中间件
app.use('/api/*', async (c, next) => {
  const { responseMiddleware } = createMiddlewareInstances(c.env);

  // 应用响应优化中间件
  await responseMiddleware(c, next);
});

// 健康检查端点（不经过缓存）
app.get('/health', c => {
  return c.json({
    success: true,
    message: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由 - 带缓存优化
app.all('/api/*', async (c) => {
  const apiRoutes = createApiRoutes(c.env);
  return apiRoutes.fetch(c.req.raw, c.env, c.executionCtx);
});

// Legacy code - keeping for reference but commenting out
/*
  app.all('/api/*', async c => {
  const middleware = createMiddlewareInstances(c.env);

  // 设置缓存配置
  const pathname = new URL(c.req.url).pathname;

  // 根据路径设置不同的缓存策略
  if (pathname.startsWith('/api/posts')) {
    if (pathname === '/api/posts' || pathname.includes('/page/')) {
      c.set('cacheConfig', cacheConfigs.postsList);
    } else if (pathname.match(/\/api\/posts\/\d+/)) {
      c.set('cacheConfig', cacheConfigs.postDetail);
    }
  } else if (pathname.startsWith('/api/projects')) {
    if (pathname === '/api/projects' || pathname.includes('/page/')) {
      c.set('cacheConfig', cacheConfigs.projectsList);
    } else if (pathname.match(/\/api\/projects\/\d+/)) {
      c.set('cacheConfig', cacheConfigs.projectDetail);
    }
  } else if (pathname.startsWith('/api/comments')) {
    c.set('cacheConfig', cacheConfigs.commentsList);
  } else if (pathname.startsWith('/api/settings')) {
    c.set('cacheConfig', cacheConfigs.settings);
  }

  // 应用缓存中间件
  await middleware.cacheMiddleware(c, async () => {
    // 执行API路由
    const apiRoutes = createApiRoutes(c.env);
    const response = await apiRoutes.fetch(c.req.raw, c.env, c);

    // 如果API返回了Response对象，直接返回
    if (response instanceof Response) {
      return response;
    }

    // 否则继续处理
    return c.json(response);
  });
});
  */

// 静态文件服务
app.get('/*', async c => {

  try {
    // 尝试从静态资源获取文件
    if (c.env.ASSETS) {
      const staticContent = await c.env.ASSETS.fetch(
        new Request(
          c.req.url.replace(
            `${c.req.url.split('/')[0]}//${c.req.url.split('/')[2]}`,
            'http://localhost:8787'
          )
        )
      );

      if (staticContent.status === 200) {
        return staticContent;
      }
    }
  } catch (error) {
    // 静态资源不存在，继续处理
  }

  // 返回默认主页或404
  return c.json(
    {
      success: false,
      error: 'Not found',
      message: 'The requested resource was not found'
    },
    404
  );
});

// 增强的错误处理
app.onError((err, c) => {
  // Only log errors in development environment
  if (c.env.ENVIRONMENT === 'development') {
    console.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      url: c.req.url,
      method: c.req.method,
      headers: Object.fromEntries(c.req.raw.headers)
    });
  }

  const isDevelopment = c.env.ENVIRONMENT === 'development';
  const responseOptimizer = new ResponseOptimizer();

  return responseOptimizer.error(
    isDevelopment ? err.message : 'Internal server error',
    500,
    'INTERNAL_ERROR'
  );
});

// 增强的404处理
app.notFound(_c => {
  const responseOptimizer = new ResponseOptimizer();

  return responseOptimizer.error('The requested resource was not found', 404, 'NOT_FOUND');
});

// 导出增强的fetch处理器
export default {
  fetch: app.fetch,

  // 可选：添加队列处理器用于后台任务
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    // 处理后台任务，如清理缓存、发送通知等
    for (const message of batch.messages) {
      try {
        const body = JSON.parse(message.body as string);

        switch (body.type) {
          case 'clear_cache':
            const cacheManager = new CacheManager(env.CACHE);
            if (body.tag) {
              await cacheManager.clearByTag(body.tag);
            } else {
              await cacheManager.clearAll();
            }
            break;

          case 'update_analytics':
            // 处理分析数据更新
            break;

          default:
            if (env.ENVIRONMENT === 'development') {
              console.warn('Unknown queue message type:', body.type);
            }
        }

        message.ack();
      } catch (error) {
        if (env.ENVIRONMENT === 'development') {
          console.error('Queue message processing error:', error);
        }
      }
    }
  }
};
