/**
 * 数据库相关类型定义
 */

// 基础查询类型
export interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  groupBy?: string[];
  having?: Record<string, any>;
}

// 分页查询类型
export interface PaginatedQueryOptions extends QueryOptions {
  page: number;
  limit: number;
}

// 查询结果类型
export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 数据库连接配置类型
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionTimeout?: number;
  maxConnections?: number;
  idleTimeout?: number;
}

// 事务类型
export interface Transaction {
  id: string;
  status: TransactionStatus;
  createdAt: string;
  expiresAt: string;
  operations: TransactionOperation[];
}

export type TransactionStatus = 'active' | 'committed' | 'rolled_back' | 'expired';

export interface TransactionOperation {
  type: 'insert' | 'update' | 'delete' | 'select';
  table: string;
  data?: any;
  conditions?: Record<string, any>;
  timestamp: string;
}

// 数据库迁移类型
export interface Migration {
  id: string;
  version: string;
  name: string;
  sql_up: string;
  sql_down: string;
  applied_at?: string;
  rollback_at?: string;
}

export interface MigrationHistory {
  version: string;
  applied_at: string;
  execution_time: number;
  success: boolean;
  error?: string;
}

// 表结构类型
export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  foreignKeys: ForeignKeySchema[];
  constraints: ConstraintSchema[];
}

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  nullable: boolean;
  default?: any;
  autoIncrement?: boolean;
  unique?: boolean;
  comment?: string;
}

export type ColumnType = 
  | 'integer'
  | 'bigint'
  | 'float'
  | 'double'
  | 'decimal'
  | 'string'
  | 'text'
  | 'json'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'binary'
  | 'uuid';

export interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
  type: IndexType;
}

export type IndexType = 'btree' | 'hash' | 'gist' | 'gin' | 'brin';

export interface ForeignKeySchema {
  name: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete: ForeignKeyAction;
  onUpdate: ForeignKeyAction;
}

export type ForeignKeyAction = 'cascade' | 'restrict' | 'set_null' | 'set_default';

export interface ConstraintSchema {
  name: string;
  type: ConstraintType;
  columns: string[];
  condition?: string;
}

export type ConstraintType = 'primary_key' | 'unique' | 'check' | 'exclude';

// 查询构建器类型
export interface QueryBuilder {
  select(columns: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(conditions: Record<string, any>): QueryBuilder;
  whereIn(column: string, values: any[]): QueryBuilder;
  whereNotIn(column: string, values: any[]): QueryBuilder;
  whereBetween(column: string, range: [any, any]): QueryBuilder;
  whereNull(column: string): QueryBuilder;
  whereNotNull(column: string): QueryBuilder;
  orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder;
  groupBy(columns: string[]): QueryBuilder;
  having(conditions: Record<string, any>): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  join(table: string, conditions: Record<string, any>): QueryBuilder;
  leftJoin(table: string, conditions: Record<string, any>): QueryBuilder;
  rightJoin(table: string, conditions: Record<string, any>): QueryBuilder;
  innerJoin(table: string, conditions: Record<string, any>): QueryBuilder;
  build(): string;
  execute(): Promise<any[]>;
}

// 数据库连接池类型
export interface ConnectionPool {
  acquire(): Promise<Connection>;
  release(connection: Connection): void;
  destroy(connection: Connection): void;
  close(): Promise<void>;
  getStats(): PoolStats;
}

export interface Connection {
  query(sql: string, params?: any[]): Promise<any[]>;
  execute(sql: string, params?: any[]): Promise<{ affectedRows: number; insertId?: number }>;
  begin(): Promise<Transaction>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): Promise<void>;
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  max: number;
  min: number;
}

// 缓存类型
export interface DatabaseCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
}

// 备份类型
export interface DatabaseBackup {
  id: string;
  name: string;
  type: BackupType;
  size: number;
  created_at: string;
  expires_at?: string;
  status: BackupStatus;
  location: string;
  tables?: string[];
  compression?: boolean;
  encryption?: boolean;
}

export type BackupType = 'full' | 'incremental' | 'differential';

export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';

// 数据同步类型
export interface DataSync {
  id: string;
  source: DataSource;
  target: DataSource;
  status: SyncStatus;
  strategy: SyncStrategy;
  last_sync?: string;
  next_sync?: string;
  errors?: SyncError[];
}

export interface DataSource {
  type: 'database' | 'file' | 'api';
  config: Record<string, any>;
}

export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

export type SyncStrategy = 'full' | 'incremental' | 'bidirectional';

export interface SyncError {
  timestamp: string;
  message: string;
  details?: any;
}

// 数据库监控类型
export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  queries: {
    total: number;
    slow: number;
    failed: number;
    average_time: number;
  };
  performance: {
    cpu_usage: number;
    memory_usage: number;
    disk_io: number;
    network_io: number;
  };
  size: {
    total_size: number;
    table_sizes: Record<string, number>;
    index_sizes: Record<string, number>;
  };
}

// 数据库事件类型
export interface DatabaseEvent {
  type: DatabaseEventType;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  old_data?: any;
  timestamp: string;
  user_id?: number;
}

export type DatabaseEventType = 
  | 'record_created'
  | 'record_updated'
  | 'record_deleted'
  | 'table_created'
  | 'table_dropped'
  | 'index_created'
  | 'index_dropped'
  | 'migration_applied'
  | 'backup_created'
  | 'error_occurred';

// 数据库缓存键类型
export type DatabaseCacheKey = 
  | 'query:result'
  | 'table:schema'
  | 'migration:history'
  | 'backup:list'
  | 'metrics:performance'
  | 'sync:status';