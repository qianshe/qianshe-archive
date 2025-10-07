import { Hono } from 'hono';
import { createApiRoutes } from './routes/api';
import { Env } from './types';
import { CacheManager } from './middleware/cache';
import { StaticOptimizer, staticMiddleware } from './middleware/static';
import { ResponseOptimizer } from './middleware/response';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// 创建性能优化中间件实例
const createMiddlewareInstances = (env: Env) => {
  const cacheManager = new CacheManager(env.CACHE_KV);
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
        message: 'The requested API endpoint was not found'
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
        ASSET_NAMESPACE: (c.env as any).__STATIC_CONTENT!,
        ASSET_MANIFEST: {},
      }
    );

    // 根据文件类型设置差异化缓存策略
    const response = new Response(asset.body, asset);
    const cacheControl = getCacheControlHeader(pathname);
    response.headers.set('Cache-Control', cacheControl);

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
          ASSET_NAMESPACE: (c.env as any).__STATIC_CONTENT!,
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
          message: 'The requested resource was not found'
        },
        404
      );
    }
  }
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

// 404 处理已经在静态文件服务中处理
// app.notFound 不再需要,因为所有路由都被上面的 app.get('*') 捕获

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
            const cacheManager = new CacheManager(env.CACHE_KV);
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
