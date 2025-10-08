/**
 * API 响应优化中间件
 * 提供响应压缩、格式化和性能优化
 */

interface ResponseConfig {
  compress?: boolean;
  pretty?: boolean;
  cors?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // 秒
  };
}

interface RateLimitInfo {
  requests: number;
  resetTime: number;
  remaining: number;
}

const DEFAULT_CONFIG: ResponseConfig = {
  compress: true,
  pretty: false,
  cors: true
};

export class ResponseOptimizer {
  private config: ResponseConfig;
  private rateLimitMap = new Map<string, RateLimitInfo>();

  constructor(config: Partial<ResponseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 标准化API响应格式
   */
  private createStandardResponse(
    data: any = null,
    message: string = '',
    code: number = 200,
    error: string = ''
  ): any {
    return {
      success: code >= 200 && code < 300,
      code,
      message,
      data,
      error,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 格式化JSON响应
   */
  private formatJSON(data: any, pretty: boolean = false): string {
    if (pretty) {
      return JSON.stringify(data, null, 2);
    }
    return JSON.stringify(data);
  }

  /**
   * 设置响应头
   */
  private setResponseHeaders(headers: Headers, contentType: string = 'application/json'): void {
    // 基础头
    headers.set('Content-Type', contentType);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');

    // 缓存策略
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // CORS
    if (this.config.cors) {
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      headers.set('Access-Control-Max-Age', '86400');
    }

    // 安全头
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  /**
   * 限流检查
   */
  private checkRateLimit(clientId: string): { allowed: boolean; info: RateLimitInfo } {
    if (!this.config.rateLimit) {
      return { allowed: true, info: { requests: 0, resetTime: 0, remaining: 0 } };
    }

    const now = Date.now();
    const windowMs = this.config.rateLimit.window * 1000;
    const maxRequests = this.config.rateLimit.requests;

    let info = this.rateLimitMap.get(clientId);

    if (!info || now > info.resetTime) {
      // 重置或初始化限流信息
      info = {
        requests: 1,
        resetTime: now + windowMs,
        remaining: maxRequests - 1
      };
    } else {
      // 更新请求计数
      info.requests++;
      info.remaining = Math.max(0, maxRequests - info.requests);
    }

    this.rateLimitMap.set(clientId, info);

    return {
      allowed: info.requests <= maxRequests,
      info
    };
  }

  /**
   * 获取客户端ID
   */
  private getClientId(request: Request): string {
    // 优先使用用户ID
    const userId = request.headers.get('x-user-id');
    if (userId) {
      return `user:${userId}`;
    }

    // 使用IP地址
    const ip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';

    return `ip:${ip}`;
  }

  /**
   * 创建成功响应
   */
  success(data: any = null, message: string = 'Success', code: number = 200): Response {
    const responseData = this.createStandardResponse(data, message, code);
    const jsonStr = this.formatJSON(responseData, this.config.pretty);

    const headers = new Headers();
    this.setResponseHeaders(headers);

    return new Response(jsonStr, {
      status: code,
      headers
    });
  }

  /**
   * 创建错误响应
   */
  error(message: string, code: number = 400, error: string = ''): Response {
    const responseData = this.createStandardResponse(null, message, code, error);
    const jsonStr = this.formatJSON(responseData, this.config.pretty);

    const headers = new Headers();
    this.setResponseHeaders(headers);

    return new Response(jsonStr, {
      status: code,
      headers
    });
  }

  /**
   * 创建分页响应
   */
  paginated(
    data: any[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const responseData = this.createStandardResponse(
      {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message
    );

    const jsonStr = this.formatJSON(responseData, this.config.pretty);

    const headers = new Headers();
    this.setResponseHeaders(headers);

    return new Response(jsonStr, {
      status: 200,
      headers
    });
  }

  /**
   * 处理 OPTIONS 请求
   */
  handleOptions(): Response {
    const headers = new Headers();
    this.setResponseHeaders(headers);

    return new Response(null, {
      status: 204,
      headers
    });
  }

  /**
   * 创建中间件函数
   */
  middleware() {
    return async (c: any, next: any) => {
      const request = c.req.raw;
      const method = request.method;

      // 处理 CORS 预检请求
      if (method === 'OPTIONS') {
        return this.handleOptions();
      }

      // 限流检查
      const clientId = this.getClientId(request);
      const rateLimit = this.checkRateLimit(clientId);

      if (!rateLimit.allowed) {
        const headers = new Headers();
        this.setResponseHeaders(headers);
        headers.set('X-RateLimit-Limit', this.config.rateLimit!.requests.toString());
        headers.set('X-RateLimit-Remaining', '0');
        headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.info.resetTime / 1000).toString());
        headers.set('Retry-After', this.config.rateLimit!.window.toString());

        return this.error('Rate limit exceeded', 429, 'TOO_MANY_REQUESTS');
      }

      // 执行原请求
      await next();

      // 优化响应
      const response = c.res;
      if (response && response.headers.get('Content-Type')?.includes('application/json')) {
        // 如果已经是标准格式，添加限流头
        if (this.config.rateLimit) {
          response.headers.set('X-RateLimit-Limit', this.config.rateLimit.requests.toString());
          response.headers.set('X-RateLimit-Remaining', rateLimit.info.remaining.toString());
          response.headers.set(
            'X-RateLimit-Reset',
            Math.ceil(rateLimit.info.resetTime / 1000).toString()
          );
        }

        // 添加性能头
        response.headers.set('X-Response-Time', Date.now().toString());
        response.headers.set(
          'X-Request-ID',
          response.headers.get('X-Request-ID') || this.generateRequestId()
        );
      }
    };
  }
}

/**
 * 创建响应优化器实例
 */
export const responseOptimizer = new ResponseOptimizer({
  compress: true,
  pretty: false, // 生产环境关闭美化
  cors: true,
  rateLimit: {
    requests: 100, // 每分钟100次请求
    window: 60
  }
});

/**
 * 导出中间件
 */
export const responseMiddleware = responseOptimizer.middleware();

/**
 * 导出便捷方法
 */
export const createSuccessResponse = (data: any, message?: string) =>
  responseOptimizer.success(data, message);
export const createErrorResponse = (message: string, code?: number) =>
  responseOptimizer.error(message, code);
export const createPaginatedResponse = (
  data: any[],
  page: number,
  limit: number,
  total: number,
  message?: string
) => responseOptimizer.paginated(data, page, limit, total, message);
