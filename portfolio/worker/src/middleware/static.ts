/**
 * 静态资源优化中间件
 * 提供静态资源压缩、缓存和优化
 */

interface StaticConfig {
  maxAge?: number;
  compress?: boolean;
  etag?: boolean;
  lastModified?: boolean;
}

const DEFAULT_CONFIG: StaticConfig = {
  maxAge: 3600, // 1小时
  compress: true,
  etag: true,
  lastModified: true
};

export class StaticOptimizer {
  private config: StaticConfig;

  constructor(config: Partial<StaticConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 检测文件类型
   */
  private getFileType(pathname: string): string {
    const ext = pathname.split('.').pop()?.toLowerCase();

    const typeMap: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      xml: 'application/xml',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      webp: 'image/webp',
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
      pdf: 'application/pdf',
      zip: 'application/zip',
      txt: 'text/plain'
    };

    return typeMap[ext || ''] || 'application/octet-stream';
  }

  /**
   * 生成 ETag
   */
  private generateETag(content: Uint8Array): string {
    // 使用内容的哈希值生成 ETag
    const hash = this.simpleHash(content);
    return `"${hash}"`;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(data: Uint8Array): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 检查是否支持压缩
   */
  private shouldCompress(contentType: string): boolean {
    const compressibleTypes = [
      'text/',
      'application/javascript',
      'application/json',
      'application/xml',
      'image/svg+xml'
    ];

    return compressibleTypes.some(type => contentType.startsWith(type));
  }

  /**
   * GZIP 压缩（简化版）
   */
  private async compress(content: Uint8Array): Promise<Uint8Array> {
    // 注意：这里使用简化版压缩，实际项目中应该使用更高效的压缩算法
    // 或者让 Cloudflare 自动处理压缩
    return content; // 暂时返回原内容
  }

  /**
   * 设置缓存头
   */
  private setCacheHeaders(
    headers: Headers,
    contentType: string,
    etag?: string,
    lastModified?: Date
  ): void {
    // 设置 Content-Type
    headers.set('Content-Type', contentType);

    // 设置缓存策略
    if (this.isStaticAsset(contentType)) {
      headers.set('Cache-Control', `public, max-age=${this.config.maxAge}, immutable`);
    } else {
      headers.set('Cache-Control', `public, max-age=${this.config.maxAge}`);
    }

    // 设置 ETag
    if (this.config.etag && etag) {
      headers.set('ETag', etag);
    }

    // 设置 Last-Modified
    if (this.config.lastModified && lastModified) {
      headers.set('Last-Modified', lastModified.toUTCString());
    }

    // 设置安全头
    this.setSecurityHeaders(headers, contentType);
  }

  /**
   * 设置安全头
   */
  private setSecurityHeaders(headers: Headers, contentType: string): void {
    // XSS 保护
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy (仅对 HTML)
    if (contentType === 'text/html') {
      headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
      );
    }
  }

  /**
   * 判断是否为静态资源
   */
  private isStaticAsset(contentType: string): boolean {
    const staticTypes = ['image/', 'font/', 'application/javascript', 'text/css'];

    return staticTypes.some(type => contentType.startsWith(type));
  }

  /**
   * 检查条件请求
   */
  private checkConditionalRequest(request: Request, etag?: string, lastModified?: Date): boolean {
    const ifNoneMatch = request.headers.get('If-None-Match');
    const ifModifiedSince = request.headers.get('If-Modified-Since');

    // 检查 ETag
    if (etag && ifNoneMatch === etag) {
      return true;
    }

    // 检查 Last-Modified
    if (lastModified && ifModifiedSince) {
      const modifiedSince = new Date(ifModifiedSince);
      if (lastModified <= modifiedSince) {
        return true;
      }
    }

    return false;
  }

  /**
   * 处理静态资源
   */
  async handleStatic(pathname: string, content: Uint8Array, request: Request): Promise<Response> {
    const contentType = this.getFileType(pathname);
    const etag = this.config.etag ? this.generateETag(content) : undefined;
    const lastModified = this.config.lastModified ? new Date() : undefined;

    // 检查条件请求
    if (this.checkConditionalRequest(request, etag, lastModified)) {
      return new Response(null, { status: 304 });
    }

    let responseContent = content;
    const headers = new Headers();

    // 设置基础头
    this.setCacheHeaders(headers, contentType, etag, lastModified);

    // 压缩处理
    if (this.config.compress && this.shouldCompress(contentType)) {
      const acceptEncoding = request.headers.get('Accept-Encoding') || '';
      if (acceptEncoding.includes('gzip')) {
        responseContent = await this.compress(content);
        headers.set('Content-Encoding', 'gzip');
        headers.set('Vary', 'Accept-Encoding');
      }
    }

    // 设置 Content-Length
    headers.set('Content-Length', responseContent.length.toString());

    return new Response(responseContent, {
      status: 200,
      headers
    });
  }

  /**
   * 创建中间件函数
   */
  middleware() {
    return async (c: any, next: any) => {
      const request = c.req.raw;
      const pathname = new URL(request.url).pathname;

      // 只处理静态资源请求
      if (this.isStaticRequest(pathname)) {
        // 获取静态资源内容
        const staticContent = await c.get('staticContent');
        if (staticContent) {
          return this.handleStatic(pathname, staticContent, request);
        }
      }

      await next();
    };
  }

  /**
   * 判断是否为静态资源请求
   */
  private isStaticRequest(pathname: string): boolean {
    const staticExtensions = [
      '.css',
      '.js',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.ico',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
      '.webp',
      '.pdf',
      '.zip'
    ];

    return staticExtensions.some(ext => pathname.endsWith(ext));
  }
}

/**
 * 创建静态资源优化器实例
 */
export const staticOptimizer = new StaticOptimizer({
  maxAge: 3600 * 24, // 24小时
  compress: true,
  etag: true,
  lastModified: true
});

/**
 * 导出中间件
 */
export const staticMiddleware = staticOptimizer.middleware();
