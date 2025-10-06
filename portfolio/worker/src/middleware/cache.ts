/**
 * 缓存中间件
 * 提供 KV 缓存和 HTTP 缓存策略
 */

interface CacheConfig {
  ttl?: number; // 缓存时间（秒）
  key?: string; // 自定义缓存键
  tags?: string[]; // 缓存标签
  skipCache?: boolean; // 跳过缓存
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  etag?: string;
}

export class CacheManager {
  private kv: KVNamespace;
  private defaultTTL = 300; // 5分钟默认缓存

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * 生成缓存键
   */
  private generateKey(request: Request, config?: CacheConfig): string {
    if (config?.key) {
      return config.key;
    }

    const url = new URL(request.url);
    const key = `${url.pathname}${url.search}`;

    // 添加用户标识（如果已登录）
    const userId = request.headers.get('x-user-id');
    if (userId) {
      return `user:${userId}:${key}`;
    }

    return `public:${key}`;
  }

  /**
   * 生成 ETag
   */
  private generateETag(data: any): string {
    const content = JSON.stringify(data);
    return `"${btoa(content).slice(0, 32)}"`;
  }

  /**
   * 检查缓存是否命中
   */
  async get(request: Request, config?: CacheConfig): Promise<Response | null> {
    if (config?.skipCache) {
      return null;
    }

    const key = this.generateKey(request, config);

    try {
      const cached = await this.kv.get(key);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();

      // 检查是否过期
      if (now - entry.timestamp > entry.ttl * 1000) {
        await this.kv.delete(key);
        return null;
      }

      // 创建缓存响应
      const response = new Response(JSON.stringify(entry.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${entry.ttl}`,
          'X-Cache': 'HIT',
          'X-Cache-Age': Math.floor((now - entry.timestamp) / 1000).toString(),
          ...(entry.etag && { ETag: entry.etag })
        }
      });

      return response;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set(request: Request, data: any, config?: CacheConfig): Promise<void> {
    if (config?.skipCache) {
      return;
    }

    const key = this.generateKey(request, config);
    const ttl = config?.ttl || this.defaultTTL;
    const etag = this.generateETag(data);

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      etag
    };

    try {
      await this.kv.put(key, JSON.stringify(entry), {
        expirationTtl: ttl
      });

      // 如果有标签，也存储标签映射
      if (config?.tags && config.tags.length > 0) {
        for (const tag of config.tags) {
          const tagKey = `tag:${tag}`;
          const existing = await this.kv.get(tagKey);
          const keys: string[] = existing ? JSON.parse(existing) : [];

          if (!keys.includes(key)) {
            keys.push(key);
            await this.kv.put(tagKey, JSON.stringify(keys), {
              expirationTtl: ttl
            });
          }
        }
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * 按标签清除缓存
   */
  async clearByTag(tag: string): Promise<void> {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await this.kv.get(tagKey);

      if (keys) {
        const keyList: string[] = JSON.parse(keys);

        // 删除所有相关缓存
        await Promise.all(keyList.map(key => this.kv.delete(key)));

        // 删除标签映射
        await this.kv.delete(tagKey);
      }
    } catch (error) {
      console.error('Clear cache by tag error:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAll(): Promise<void> {
    try {
      const list = await this.kv.list();
      const keys = list.keys.map(key => key.name);

      await Promise.all(keys.map(key => this.kv.delete(key)));
    } catch (error) {
      console.error('Clear all cache error:', error);
    }
  }

  /**
   * 检查 If-None-Match 头
   */
  async checkETag(request: Request, data: any): Promise<boolean> {
    const etag = this.generateETag(data);
    const ifNoneMatch = request.headers.get('If-None-Match');

    return ifNoneMatch === etag;
  }
}

/**
 * 缓存中间件工厂函数
 */
export function createCacheMiddleware(cacheManager: CacheManager) {
  return async (c: any, next: any) => {
    const request = c.req.raw;
    const method = request.method;

    // 只缓存 GET 请求
    if (method !== 'GET') {
      await next();
      return;
    }

    // 获取缓存配置
    const cacheConfig: CacheConfig = c.get('cacheConfig') || {};

    // 尝试从缓存获取
    const cached = await cacheManager.get(request, cacheConfig);
    if (cached) {
      return cached;
    }

    // 执行原请求
    await next();

    // 缓存响应
    const response = c.res;
    if (
      response.status === 200 &&
      response.headers.get('Content-Type')?.includes('application/json')
    ) {
      const data = await response.clone().json();
      await cacheManager.set(request, data, cacheConfig);
    }
  };
}

/**
 * 预定义的缓存配置
 */
export const cacheConfigs = {
  // 文章列表缓存 5 分钟
  postsList: { ttl: 300, tags: ['posts'] },

  // 文章详情缓存 10 分钟
  postDetail: { ttl: 600, tags: ['posts'] },

  // 项目列表缓存 5 分钟
  projectsList: { ttl: 300, tags: ['projects'] },

  // 项目详情缓存 10 分钟
  projectDetail: { ttl: 600, tags: ['projects'] },

  // 评论列表缓存 2 分钟
  commentsList: { ttl: 120, tags: ['comments'] },

  // 页面内容缓存 10 分钟
  pageContent: { ttl: 600, tags: ['pages'] },

  // 设置信息缓存 30 分钟
  settings: { ttl: 1800, tags: ['settings'] },

  // 统计数据缓存 15 分钟
  analytics: { ttl: 900, tags: ['analytics'] }
};
