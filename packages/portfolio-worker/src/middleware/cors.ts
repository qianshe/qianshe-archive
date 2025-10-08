import { Context, Next } from 'hono';
import { Env } from '../types';

// CORS中间件
export function corsHandler(env: Env) {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('Origin') || '*';
    const allowedOrigin = env.CORS_ORIGIN || origin;

    // 设置CORS头
    c.header('Access-Control-Allow-Origin', allowedOrigin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    c.header('Access-Control-Max-Age', '86400'); // 24小时
    c.header('Access-Control-Allow-Credentials', 'true');

    // 处理预检请求
    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    await next();
  };
}

// 安全头中间件
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    // 设置安全头
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // 在生产环境中添加HSTS
    if (c.env.ENVIRONMENT === 'production') {
      c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    await next();
  };
}

// 请求日志中间件
export function requestLogger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const method = c.req.method;
    const url = c.req.url;
    const userAgent = c.req.header('User-Agent') || 'Unknown';
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'Unknown';

    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip} - ${userAgent}`);

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms`);
  };
}

// 速率限制中间件（简化版本）
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const now = Date.now();

    // 清理过期记录
    for (const [key, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(key);
      }
    }

    // 检查当前IP的请求次数
    const current = requests.get(ip);
    if (current) {
      if (current.count >= maxRequests && now < current.resetTime) {
        const resetIn = Math.ceil((current.resetTime - now) / 1000);
        c.header('X-RateLimit-Limit', maxRequests.toString());
        c.header('X-RateLimit-Remaining', '0');
        c.header('X-RateLimit-Reset', current.resetTime.toString());
        c.header('Retry-After', resetIn.toString());

        return c.json(
          {
            success: false,
            error: 'Too many requests, please try again later.'
          },
          429
        );
      }
      current.count++;
    } else {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
    }

    const data = requests.get(ip)!;
    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - data.count).toString());
    c.header('X-RateLimit-Reset', data.resetTime.toString());

    await next();
  };
}

// 错误处理中间件
export function errorHandler() {
  return async (c: Context, next: Next) => {
    try {
      await next();
    } catch (error) {
      console.error('Unhandled error:', error);

      // 检查是否已经有响应
      if (c.res) {
        return;
      }

      const statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;

      const message = error instanceof Error ? error.message : 'Internal server error';

      c.status(statusCode);
      return c.json({
        success: false,
        error: c.env.ENVIRONMENT === 'development' ? message : 'Something went wrong'
      });
    }
  };
}

// 404处理中间件
export function notFoundHandler() {
  return async (c: Context) => {
    c.status(404);
    return c.json({
      success: false,
      error: 'Endpoint not found'
    });
  };
}
