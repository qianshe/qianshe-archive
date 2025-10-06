/**
 * 缓存系统类型定义
 * 提供完整的缓存管理、策略和优化类型
 */

// 基础缓存类型
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  expiresAt: number;
  tags: string[];
  metadata?: CacheMetadata;
  hitCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheMetadata {
  version?: string;
  etag?: string;
  lastModified?: string;
  contentType?: string;
  encoding?: string;
  headers?: Record<string, string>;
  checksum?: string;
  compression?: 'gzip' | 'br' | 'none';
}

// 缓存配置
export interface CacheConfig {
  // 基础配置
  defaultTtl: number;
  maxSize: number; // 最大条目数
  maxMemorySize: number; // 最大内存使用（字节）
  namespace: string;

  // 存储配置
  storage: 'memory' | 'kv' | 'r2' | 'hybrid';
  kvNamespace?: KVNamespace;
  r2Bucket?: R2Bucket;

  // 清理策略
  evictionPolicy: EvictionPolicy;
  cleanupInterval: number;
  compressionThreshold: number;

  // 性能配置
  enableCompression: boolean;
  enableEncryption: boolean;
  enableMetrics: boolean;

  // 预热配置
  warmupEnabled: boolean;
  warmupKeys?: string[];
  warmupSchedule?: string; // cron expression

  // 同步配置
  syncEnabled: boolean;
  syncInterval: number;
  syncBackpressure: boolean;
}

export enum EvictionPolicy {
  LRU = 'lru',           // 最近最少使用
  LFU = 'lfu',           // 最少使用频率
  FIFO = 'fifo',         // 先进先出
  TTL = 'ttl',           // 基于时间
  RANDOM = 'random',     // 随机
  ADAPTIVE = 'adaptive'  // 自适应
}

// 缓存操作结果
export interface CacheResult<T = any> {
  hit: boolean;
  value?: T;
  entry?: CacheEntry<T>;
  fromStorage: 'memory' | 'kv' | 'r2';
  duration: number;
  size: number;
}

export interface CacheSetResult {
  key: string;
  success: boolean;
  size: number;
  duration: number;
  evicted?: string[];
  compressed: boolean;
  encrypted: boolean;
}

export interface CacheDeleteResult {
  key: string;
  success: boolean;
  deleted: number;
  duration: number;
}

export interface CacheClearResult {
  cleared: number;
  duration: number;
  errors: string[];
}

// 批量操作
export interface CacheBatchOperation {
  type: 'get' | 'set' | 'delete' | 'touch';
  key: string;
  value?: any;
  options?: CacheOptions;
}

export interface CacheBatchResult {
  operations: Array<{
    key: string;
    success: boolean;
    value?: any;
    error?: string;
    duration: number;
  }>;
  totalDuration: number;
  successCount: number;
  errorCount: number;
}

// 缓存选项
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  metadata?: CacheMetadata;
  noCompression?: boolean;
  noEncryption?: boolean;
  priority?: number;
  storage?: 'memory' | 'kv' | 'r2';
  version?: string;
  conditional?: {
    etag?: string;
    lastModified?: string;
  };
}

// 缓存统计
export interface CacheStats {
  // 基础统计
  totalKeys: number;
  totalSize: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;

  // 操作统计
  operations: {
    gets: number;
    sets: number;
    deletes: number;
    clears: number;
    touches: number;
  };

  // 性能统计
  performance: {
    avgGetTime: number;
    avgSetTime: number;
    avgDeleteTime: number;
    p95GetTime: number;
    p99GetTime: number;
  };

  // 存储统计
  storage: {
    memoryKeys: number;
    memorySize: number;
    kvKeys: number;
    kvSize: number;
    r2Keys: number;
    r2Size: number;
  };

  // 错误统计
  errors: {
    kvErrors: number;
    r2Errors: number;
    compressionErrors: number;
    encryptionErrors: number;
    deserializationErrors: number;
  };

  // 清理统计
  eviction: {
    totalEvicted: number;
    lruEvicted: number;
    ttlEvicted: number;
    sizeEvicted: number;
  };

  timestamp: number;
}

// 缓存事件
export interface CacheEvent {
  type: CacheEventType;
  key: string;
  timestamp: number;
  data?: any;
  error?: string;
  duration?: number;
}

export enum CacheEventType {
  HIT = 'hit',
  MISS = 'miss',
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear',
  EVICT = 'evict',
  ERROR = 'error',
  COMPRESSION_START = 'compression_start',
  COMPRESSION_END = 'compression_end',
  ENCRYPTION_START = 'encryption_start',
  ENCRYPTION_END = 'encryption_end'
}

// 缓存策略
export interface CacheStrategy {
  name: string;
  get<T>(key: string, fallback?: () => Promise<T>, options?: CacheOptions): Promise<T>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  invalidate(pattern?: string, tags?: string[]): Promise<void>;
  warmup(): Promise<void>;
}

// 缓存模式
export interface CachePatterns {
  // Cache-Aside 模式
  cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T>;

  // Write-Through 模式
  writeThrough<T>(
    key: string,
    value: T,
    writer: (value: T) => Promise<void>,
    options?: CacheOptions
  ): Promise<void>;

  // Write-Behind 模式
  writeBehind<T>(
    key: string,
    value: T,
    writer: (value: T) => Promise<void>,
    options?: CacheOptions
  ): Promise<void>;

  // Refresh-Ahead 模式
  refreshAhead<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T>;
}

// 分布式缓存
export interface DistributedCacheConfig {
  nodes: CacheNode[];
  replicationFactor: number;
  consistency: 'eventual' | 'strong';
  conflictResolution: 'last-write-wins' | 'vector-clock' | 'custom';
  syncInterval: number;
  healthCheckInterval: number;
}

export interface CacheNode {
  id: string;
  url: string;
  region: string;
  weight: number;
  isHealthy: boolean;
  lastHealthCheck: number;
}

// 缓存健康检查
export interface CacheHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  nodes: Array<{
    id: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    errorRate: number;
    lastCheck: number;
  }>;
  metrics: {
    overallHitRate: number;
    avgResponseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    node?: string;
  }>;
}

// 缓存备份和恢复
export interface CacheBackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: number; // days
  compression: boolean;
  encryption: boolean;
  destination: 'r2' | 'kv' | 'external';
  includeMetadata: boolean;
}

export interface CacheBackup {
  id: string;
  timestamp: number;
  size: number;
  entries: number;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  location: string;
  expiresAt?: number;
}

// 缓存同步
export interface CacheSyncConfig {
  enabled: boolean;
  source: CacheNode;
  targets: CacheNode[];
  strategy: 'full' | 'incremental';
  batchSize: number;
  maxConcurrency: number;
  conflictResolution: string;
  filters?: string[];
}

export interface CacheSyncResult {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  entriesProcessed: number;
  entriesTransferred: number;
  entriesSkipped: number;
  errors: string[];
  bytesTransferred: number;
}

// 缓存服务接口
export interface CacheService {
  // 基础操作
  get<T>(key: string): Promise<CacheResult<T>>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<CacheSetResult>;
  delete(key: string): Promise<CacheDeleteResult>;
  exists(key: string): Promise<boolean>;
  touch(key: string, ttl?: number): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  ttl(key: string): Promise<number>;

  // 批量操作
  mget<T>(keys: string[]): Promise<CacheBatchResult>;
  mset<T>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<CacheBatchResult>;
  mdelete(keys: string[]): Promise<CacheBatchResult>;

  // 模式匹配
  keys(pattern: string): Promise<string[]>;
  scan(cursor: number, pattern?: string, count?: number): Promise<{ cursor: number; keys: string[] }>;

  // 标签操作
  getByTag(tag: string): Promise<CacheResult[]>;
  deleteByTag(tag: string): Promise<CacheClearResult>;
  getTags(key: string): Promise<string[]>;
  addTags(key: string, tags: string[]): Promise<void>;
  removeTags(key: string, tags: string[]): Promise<void>;

  // 清理操作
  clear(pattern?: string): Promise<CacheClearResult>;
  cleanup(): Promise<CacheClearResult>;
  compact(): Promise<void>;

  // 统计和监控
  getStats(): Promise<CacheStats>;
  getHealth(): Promise<CacheHealth>;
  getEvents(since?: number, types?: CacheEventType[]): Promise<CacheEvent[]>;

  // 配置管理
  getConfig(): CacheConfig;
  updateConfig(config: Partial<CacheConfig>): Promise<void>;

  // 缓存模式
  patterns: CachePatterns;

  // 分布式操作
  sync(config?: CacheSyncConfig): Promise<CacheSyncResult>;
  getDistributedStats(): Promise<Record<string, CacheStats>>;

  // 备份和恢复
  backup(config?: CacheBackupConfig): Promise<CacheBackup>;
  restore(backupId: string): Promise<void>;
  listBackups(): Promise<CacheBackup[]>;

  // 预热操作
  warmup(keys?: string[]): Promise<void>;
  scheduleWarmup(cronExpression: string, keys: string[]): Promise<void>;

  // 健康检查
  healthCheck(): Promise<CacheHealth>;
}

// 缓存中间件
export interface CacheMiddleware {
  // HTTP 缓存中间件
  httpCache(options?: HttpCacheOptions): (c: any, next: any) => Promise<Response>;

  // API 响应缓存中间件
  apiCache(options?: ApiCacheOptions): (c: any, next: any) => Promise<Response>;

  // 数据库查询缓存中间件
  queryCache(options?: QueryCacheOptions): (query: string, params: any[]) => Promise<any>;
}

export interface HttpCacheOptions {
  ttl?: number;
  varyOn?: string[];
  skipMethods?: string[];
  skipHeaders?: string[];
  cacheableStatus?: number[];
  compressionEnabled?: boolean;
  etagEnabled?: boolean;
  maxAge?: number;
  sharedMaxAge?: number;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

export interface ApiCacheOptions {
  ttl?: number;
  keyGenerator?: (c: any) => string;
  condition?: (c: any, response: Response) => boolean;
  invalidateOn?: string[];
  tags?: string[];
  compressResponse?: boolean;
}

export interface QueryCacheOptions {
  ttl?: number;
  keyGenerator?: (query: string, params: any[]) => string;
  invalidateOn?: string[];
  maxSize?: number;
  skipQueries?: RegExp[];
}