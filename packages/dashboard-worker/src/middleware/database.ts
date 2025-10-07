/**
 * 数据库查询优化中间件
 * 提供查询缓存、连接池管理和性能监控
 */

import { D1Database } from '@cloudflare/workers-types';

interface QueryConfig {
  cache?: boolean;
  cacheTTL?: number;
  cacheKey?: string;
  timeout?: number;
  retries?: number;
}

interface QueryResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTime?: number;
  fromCache?: boolean;
}

interface QueryCache {
  data: unknown;
  timestamp: number;
  ttl: number;
  queryHash: string;
}

export class DatabaseOptimizer {
  private db: D1Database;
  private kvCache?: KVNamespace; // L2 缓存 (持久化，跨 Worker 共享)
  private memCache: Map<string, QueryCache> = new Map(); // L1 缓存 (快速，单 Worker)
  private queryStats: Map<string, { count: number; totalTime: number; errors: number }> = new Map();

  constructor(db: D1Database, kvCache?: KVNamespace) {
    this.db = db;
    this.kvCache = kvCache;
  }

  /**
   * 生成查询哈希
   */
  private generateQueryHash(query: string, params?: unknown[]): string {
    const queryStr = query.trim().toLowerCase();
    const paramsStr = params ? JSON.stringify(params) : '';
    return btoa(queryStr + paramsStr).slice(0, 32);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(query: string, params?: unknown[]): string {
    const hash = this.generateQueryHash(query, params);
    return `db_query:${hash}`;
  }

  /**
   * 清理过期缓存（仅清理内存缓存）
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, cache] of this.memCache.entries()) {
      if (now - cache.timestamp > cache.ttl * 1000) {
        this.memCache.delete(key);
      }
    }
  }

  /**
   * 更新查询统计
   */
  private updateQueryStats(queryHash: string, executionTime: number, success: boolean): void {
    const existing = this.queryStats.get(queryHash) || { count: 0, totalTime: 0, errors: 0 };

    existing.count++;
    existing.totalTime += executionTime;
    if (!success) {
      existing.errors++;
    }

    this.queryStats.set(queryHash, existing);
  }

  /**
   * 执行查询
   */
  async execute<T = unknown>(
    query: string,
    params?: unknown[],
    config?: QueryConfig
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const queryHash = this.generateQueryHash(query, params);

    // 清理过期缓存
    this.cleanExpiredCache();

    // 两级缓存检查
    if (config?.cache !== false) {
      const cacheKey = config?.cacheKey || this.generateCacheKey(query, params);

      // L1: 检查内存缓存（最快）
      const memCached = this.memCache.get(cacheKey);
      if (memCached && Date.now() - memCached.timestamp < memCached.ttl * 1000) {
        return {
          success: true,
          data: memCached.data as T,
          executionTime: Date.now() - startTime,
          fromCache: true
        };
      }

      // L2: 检查 KV 缓存（中速）
      if (this.kvCache) {
        try {
          const kvCached = await this.kvCache.get(cacheKey, 'json');
          if (kvCached) {
            const cached = kvCached as QueryCache;
            // 回写到内存缓存
            this.memCache.set(cacheKey, cached);

            return {
              success: true,
              data: cached.data as T,
              executionTime: Date.now() - startTime,
              fromCache: true
            };
          }
        } catch (error) {
          // KV 缓存失败不影响查询，继续执行数据库查询
        }
      }
    }

    try {
      // 执行查询
      const statement = this.db.prepare(query).bind(...(params || []));
      const result = await this.withTimeout(
        statement.run(),
        config?.timeout || 5000
      );

      let data: T;
      if (query.trim().toLowerCase().startsWith('select')) {
        // 查询操作 - 重新执行查询获取结果
        if (query.trim().toLowerCase().includes('count(*)')) {
          data = (await statement.first()) as T;
        } else if (query.trim().toLowerCase().includes('limit 1')) {
          data = (await statement.first()) as T;
        } else {
          data = (await statement.all()) as T;
        }
      } else {
        // 插入/更新/删除操作
        data = result as T;
      }

      const executionTime = Date.now() - startTime;

      // 更新统计
      this.updateQueryStats(queryHash, executionTime, true);

      // 缓存结果（仅缓存查询操作）
      if (config?.cache !== false && query.trim().toLowerCase().startsWith('select')) {
        const cacheKey = config?.cacheKey || this.generateCacheKey(query, params);
        const ttl = config?.cacheTTL || 300; // 默认5分钟

        const cacheData: QueryCache = {
          data,
          timestamp: Date.now(),
          ttl,
          queryHash
        };

        // 写入内存缓存（L1）
        this.memCache.set(cacheKey, cacheData);

        // 写入 KV 缓存（L2）- 异步，不阻塞响应
        if (this.kvCache) {
          this.kvCache.put(cacheKey, JSON.stringify(cacheData), { expirationTtl: ttl }).catch(() => {
            // KV 写入失败不影响查询结果
          });
        }
      }

      return {
        success: true,
        data: data as T,
        executionTime,
        fromCache: false
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateQueryStats(queryHash, executionTime, false);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        executionTime
      };
    }
  }

  /**
   * 批量执行查询
   */
  async executeBatch<T = unknown>(
    queries: Array<{
      query: string;
      params?: unknown[];
      config?: QueryConfig;
    }>
  ): Promise<QueryResult<T>[]> {
    const results = await Promise.allSettled(
      queries.map(({ query, params, config }) => this.execute<T>(query, params, config))
    );

    return results.map(result =>
      result.status === 'fulfilled'
        ? result.value
        : {
          success: false,
          error: result.reason.message
        }
    );
  }

  /**
   * 带超时的查询执行
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * 清除缓存（包括内存和 KV）
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 按模式清除
      const keysToDelete: string[] = [];
      for (const [key] of this.memCache.entries()) {
        if (key.includes(pattern)) {
          this.memCache.delete(key);
          keysToDelete.push(key);
        }
      }

      // 异步清除 KV 缓存
      if (this.kvCache && keysToDelete.length > 0) {
        Promise.all(keysToDelete.map(key => this.kvCache!.delete(key))).catch(() => {
          // 忽略 KV 删除错误
        });
      }
    } else {
      // 清除所有内存缓存
      this.memCache.clear();
      // 注意：KV 不支持批量删除全部键
    }
  }

  /**
   * 获取查询统计
   */
  getQueryStats(): Array<{
    queryHash: string;
    count: number;
    avgTime: number;
    errorRate: number;
  }> {
    return Array.from(this.queryStats.entries()).map(([queryHash, stats]) => ({
      queryHash,
      count: stats.count,
      avgTime: stats.totalTime / stats.count,
      errorRate: stats.errors / stats.count
    }));
  }

  /**
   * 预热缓存
   */
  async warmupCache(
    queries: Array<{
      query: string;
      params?: unknown[];
      ttl?: number;
    }>
  ): Promise<void> {
    await Promise.all(
      queries.map(async ({ query, params, ttl }) => {
        await this.execute(query, params, { cache: true, cacheTTL: ttl });
      })
    );
  }

  /**
   * 创建中间件
   */
  middleware() {
    return async (c: { env: { SHARED_DB: D1Database }; set: (key: string, value: unknown) => void }, next: () => Promise<void>) => {
      // 创建数据库优化器实例
      const dbOptimizer = new DatabaseOptimizer(c.env.SHARED_DB);

      // 将优化器注入到上下文中
      c.set('dbOptimizer', dbOptimizer);

      await next();

      // 记录数据库性能统计
      const stats = dbOptimizer.getQueryStats();
      if (stats.length > 0) {
        const slowQueries = stats.filter(stat => stat.avgTime > 1000); // 超过1秒的慢查询
        if (slowQueries.length > 0) {
          if (process.env.ENVIRONMENT === 'development') {
            console.warn('Slow queries detected:', slowQueries);
          }
        }
      }
    };
  }
}

/**
 * 预定义的查询配置
 */
export const queryConfigs = {
  // 用户查询缓存 15 分钟
  userQuery: { cache: true, cacheTTL: 900 },

  // 文章列表查询缓存 5 分钟
  postsListQuery: { cache: true, cacheTTL: 300 },

  // 文章详情查询缓存 10 分钟
  postDetailQuery: { cache: true, cacheTTL: 600 },

  // 统计数据查询缓存 15 分钟
  analyticsQuery: { cache: true, cacheTTL: 900 },

  // 设置查询缓存 30 分钟
  settingsQuery: { cache: true, cacheTTL: 1800 },

  // 写操作不缓存
  writeQuery: { cache: false },

  // 认证查询不缓存
  authQuery: { cache: false }
};

/**
 * 便捷的查询函数
 */
export const createQueryFunction = (dbOptimizer: DatabaseOptimizer) => {
  return {
    // 查询单个记录
    async one<T = unknown>(query: string, params?: unknown[], config?: QueryConfig): Promise<T | null> {
      const result = await dbOptimizer.execute<T>(query, params, config);
      return result.success ? result.data : null;
    },

    // 查询多个记录
    async many<T = unknown>(query: string, params?: unknown[], config?: QueryConfig): Promise<T[]> {
      const result = await dbOptimizer.execute<T>(query, params, config);
      return result.success ? (result.data as { results?: T[] })?.results || [] : [];
    },

    // 执行写操作
    async write<T = unknown>(query: string, params?: unknown[]): Promise<T | null> {
      const result = await dbOptimizer.execute<T>(query, params, queryConfigs.writeQuery);
      return result.success ? result.data : null;
    },

    // 查询总数
    async count(query: string, params?: unknown[], config?: QueryConfig): Promise<number> {
      const result = await dbOptimizer.execute<{ count: number }>(query, params, config);
      return result.success ? result.data?.count || 0 : 0;
    }
  };
};
