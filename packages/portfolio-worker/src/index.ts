import { Hono } from 'hono';
import { createApiRoutes } from './routes/api';
import { Env } from './types';
import { CacheManager } from './middleware/cache';
import { StaticOptimizer, staticMiddleware } from './middleware/static';
import { ResponseOptimizer } from './middleware/response';

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

// 静态文件服务 - 使用新的 ASSETS 绑定处理所有非 API 请求
app.get('*', async c => {
  const pathname = new URL(c.req.url).pathname;

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
            message: 'The requested resource was not found'
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
          <title>Portfolio - 开发环境配置</title>
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
            <pre>cd ../portfolio-frontend && npm run build</pre>
            <p>然后重启 Worker 开发服务器：</p>
            <pre>npm run dev</pre>
          </div>

          <div class="solution">
            <h3>✅ 解决方案 2：使用前后端分离开发</h3>
            <pre>
# 终端 1：前端开发服务器
cd packages/portfolio-frontend
npm run dev  # http://localhost:5173

# 终端 2：Worker API 服务器
cd packages/portfolio-worker
npm run dev  # http://localhost:8787
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
      message: 'Static assets binding is not configured'
    },
    503
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
