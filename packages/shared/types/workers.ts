/**
 * Cloudflare Workers API 类型定义
 * 提供完整的 Workers 运行时和服务类型
 */

// 基础 Workers 类型
export interface WorkersEnv {
  // KV 命名空间
  [key: string]: KVNamespace | D1Database | R2Bucket | DurableObjectNamespace | Queue | any;
}

export interface WorkersContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  next(): Promise<Response>;
  env: WorkersEnv;
}

// 扩展的 Request 类型
export interface WorkersRequest extends Request<unknown, IncomingRequestCfProperties> {
  cf: IncomingRequestCfProperties;
  data: ReadableStream;
  // 自定义属性
  user?: any;
  session?: string;
  requestId?: string;
  startTime?: number;
}

// 扩展的 Response 类型
export interface WorkersResponse extends Response {
  // 自定义属性
  requestId?: string;
  duration?: number;
  cached?: boolean;
}

// Cloudflare 特定属性
export interface IncomingRequestCfProperties {
  colo: string;
  country: string;
  httpProtocol: string;
  requestPriority: string;
  tlsCipher: string;
  tlsVersion: string;
  tlsClientAuth: {
    certPresented: string;
    certVerified: string;
    certRevoked: string;
    certIssuerDN: string;
    certSubjectDN: string;
    certSerial: string;
    certFingerprintSHA1: string;
    certFingerprintSHA256: string;
    certNotBefore: string;
    certNotAfter: string;
  };
  rayId: string;
  edgeRequestKeepAliveStatus: number;
  botManagement?: {
    staticResource: boolean;
    verifiedBot: boolean;
    score: number;
    ja3Hash: string;
  };
}

// D1 数据库类型
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<D1Result>;
  dump(): Promise<ArrayBuffer>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first(): Promise<any>;
  first<T = any>(): Promise<T | undefined>;
  run(): Promise<D1Result>;
  all<T = any>(): Promise<D1Result<T>>;
  raw(): Promise<any[]>;
}

export interface D1Result<T = any> {
  success: boolean;
  meta: D1Meta;
  results: T[];
  error?: string;
}

export interface D1Meta {
  duration: number;
  last_row_id?: number;
  changes?: number;
  served_by?: string;
  size_after?: number;
  rows_read?: number;
  rows_written?: number;
}

// KV 存储类型
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  get(key: string, type: 'text'): Promise<string | null>;
  get(key: string, type: 'json'): Promise<any | null>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  get(key: string, type: 'stream'): Promise<ReadableStream | null>;

  put(key: string, value: string): Promise<void>;
  put(key: string, value: string, options: KVNamespacePutOptions): Promise<void>;
  put(key: string, value: ArrayBuffer): Promise<void>;
  put(key: string, value: ArrayBuffer, options: KVNamespacePutOptions): Promise<void>;
  put(key: string, value: ReadableStream): Promise<void>;
  put(key: string, value: ReadableStream, options: KVNamespacePutOptions): Promise<void>;

  delete(key: string): Promise<void>;
  delete(keys: string[]): Promise<void>;

  list(options?: KVNamespaceListOptions): Promise<KVListResult>;

  getWithMetadata(key: string): Promise<KVGetWithMetadataResult<string> | null>;
  getWithMetadata(key: string, type: 'text'): Promise<KVGetWithMetadataResult<string> | null>;
  getWithMetadata(key: string, type: 'json'): Promise<KVGetWithMetadataResult<any> | null>;
  getWithMetadata(key: string, type: 'arrayBuffer'): Promise<KVGetWithMetadataResult<ArrayBuffer> | null>;
  getWithMetadata(key: string, type: 'stream'): Promise<KVGetWithMetadataResult<ReadableStream> | null>;
}

export interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: any;
}

export interface KVNamespaceListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
}

export interface KVListResult {
  keys: Array<{
    name: string;
    expiration?: number;
    metadata?: any;
  }>;
  list_complete: boolean;
  cursor: string;
}

export interface KVGetWithMetadataResult<T> {
  value: T | null;
  metadata: any | null;
}

// R2 存储类型
export interface R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string): Promise<R2Object | null>;
  get(key: string, options: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: R2PutOptions): Promise<R2Object>;
  delete(keys: string[]): Promise<R2ObjectsDeleteResult>;
  list(options?: R2ListOptions): Promise<R2ObjectsListResult>;
  createMultipartUpload(key: string, options?: R2CreateMultipartUploadOptions): Promise<R2MultipartUpload>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  customMetadata?: Record<string, string>;
  range?: { offset: number; length?: number };
}

export interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json(): Promise<any>;
  blob(): Promise<Blob>;
}

export interface R2GetOptions {
  range?: { offset: number; length?: number };
  onlyIf?: R2IfOptions;
  prefix?: string;
}

export interface R2IfOptions {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

export interface R2PutOptions {
  customMetadata?: Record<string, string>;
  httpMetadata?: R2HTTPMetadata;
  md5?: string;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2CreateMultipartUploadOptions {
  customMetadata?: Record<string, string>;
  httpMetadata?: R2HTTPMetadata;
}

export interface R2MultipartUpload {
  uploadPart(partNumber: number, value: ArrayBuffer | ArrayBufferView | ReadableStream): Promise<R2UploadedPart>;
  complete(uploadedParts: R2UploadedPart[]): Promise<R2Object>;
  abort(): Promise<void>;
}

export interface R2UploadedPart {
  partNumber: number;
  etag: string;
}

export interface R2ObjectsDeleteResult {
  deleted: Array<{
    key: string;
  }>;
  undeleted: Array<{
    key: string;
    error: Error;
  }>;
}

export interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  include?: Array<'customMetadata' | 'httpMetadata'>;
}

export interface R2ObjectsListResult {
  objects: Array<{
    key: string;
    size: number;
    etag: string;
    customMetadata?: Record<string, string>;
  }>;
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

// Durable Objects 类型
export interface DurableObjectNamespace {
  get(id: DurableObjectId): DurableObjectStub;
  idFromName(name: string): DurableObjectId;
  idFromString(hexString: string): DurableObjectId;
  newUniqueId(): DurableObjectId;
}

export interface DurableObjectId {
  toString(): string;
  equals(other: DurableObjectId): boolean;
}

export interface DurableObjectStub {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

// Queue 类型
export interface Queue {
  send(message: any, options?: QueueSendOptions): Promise<void>;
  sendBatch(messages: any[], options?: QueueSendOptions): Promise<void>;
}

export interface QueueSendOptions {
  delaySeconds?: number;
}

export interface QueueMessageBatch {
  messages: QueueMessage[];
  ackAll(): void;
  retryAll(): void;
}

export interface QueueMessage {
  id: string;
  timestamp: number;
  body: any;
  attempts: number;
}

// Scheduled Events 类型
export interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

export type ScheduledHandler = (event: ScheduledEvent, env: WorkersEnv, ctx: ExecutionContext) => Promise<void>;

// Tail Events 类型
export interface TailEvent {
  logs: Array<{
    message: any[];
    level: 'log' | 'info' | 'warn' | 'error';
    timestamp: number;
    requestId?: string;
  }>;
  exceptions: Array<{
    name: string;
    message: string;
    timestamp: number;
  }>;
  fetches: Array<{
    url: string;
    method: string;
    requestId?: string;
  }>;
}

// Fetch Events 类型
export interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  passThroughOnException(): void;
  waitUntil(promise: Promise<any>): void;
}

// Workers 配置类型
export interface WorkersConfig {
  name: string;
  main: string;
  compatibility_date: string;
  compatibility_flags?: string[];
  account_id?: string;
  zone_id?: string;
  routes?: string[];
  kv_namespaces?: Array<{
    binding: string;
    id: string;
    preview_id?: string;
  }>;
  d1_databases?: Array<{
    binding: string;
    database_name: string;
    database_id: string;
  }>;
  r2_buckets?: Array<{
    binding: string;
    bucket_name: string;
  }>;
  durable_objects?: {
    bindings?: Array<{
      name: string;
      class_name: string;
      script_name?: string;
    }>;
  };
  queue_producers?: Array<{
    binding: string;
    queue: string;
  }>;
  queue_consumers?: Array<{
    queue: string;
    script_name: string;
    max_batch_size?: number;
    max_retries?: number;
    dead_letter_queue?: string;
  }>;
  cron_triggers?: Array<{
    cron: string;
    schedule: string;
  }>;
  analytics_engine_datasets?: Array<{
    binding: string;
    dataset: string;
  }>;
  [key: string]: any;
}

// Workers 部署类型
export interface WorkersDeployment {
  id: string;
  number: number;
  created_at: string;
  modified_at: string;
  latest_ready_created_at: string;
  created_on: string;
  modified_on: string;
  resources: Array<{
    name: string;
    type: string;
    id: string;
  }>;
  triggers: {
    schedules?: Array<{
      cron: string;
      modified_at: string;
    }>;
    consumers?: Array<{
      queue: string;
      script_name: string;
      created_at: string;
    }>;
  };
}

// Workers 限制类型
export interface WorkersLimits {
  cpu_time: number; // 毫秒
  memory: number; // 字节
  max_concurrent_requests: number;
  max_file_size: number; // 字节
  max_request_body_size: number; // 字节
  max_response_body_size: number; // 字节
  subrequest_count: number;
  subrequest_max_response_size: number; // 字节
}

// Workers 指标类型
export interface WorkersMetrics {
  requests: number;
  errors: number;
  cpu_time: number;
  memory_usage: number;
  subrequests: number;
  duration: number;
  timestamp: number;
}

// Workers 环境检测
export interface WorkersEnvironment {
  is_dev: boolean;
  is_preview: boolean;
  is_production: boolean;
  account_id: string;
  namespace: string;
  worker_name: string;
  worker_version?: string;
}

// Workers 错误类型
export interface WorkersError extends Error {
  name: string;
  message: string;
  stack?: string;
  cause?: Error;
  code?: string;
  requestId?: string;
  timestamp?: number;
}

// 响应类型
export interface WorkersAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    requestId: string;
    duration: number;
    cached: boolean;
    version: string;
    timestamp: string;
  };
}

// 中间件上下文类型
export interface WorkersMiddlewareContext {
  request: WorkersRequest;
  env: WorkersEnv;
  ctx: ExecutionContext;
  next: () => Promise<Response>;
  data: Map<string, any>;
}

// 中间件类型
export type WorkersMiddleware = (
  ctx: WorkersMiddlewareContext,
  next: () => Promise<Response>
) => Promise<Response> | Response;

// 路由处理器类型
export type WorkersRouteHandler = (
  request: WorkersRequest,
  env: WorkersEnv,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response> | Response;

// 路由定义类型
export interface WorkersRoute {
  pattern: string;
  methods: string[];
  handler: WorkersRouteHandler;
  middlewares?: WorkersMiddleware[];
}

// WebSocket 类型
export interface WorkersWebSocket {
  accept(): void;
  send(data: string | ArrayBuffer): void;
  close(code?: number, reason?: string): void;

  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
  addEventListener(type: 'close', listener: (event: CloseEvent) => void): void;
  addEventListener(type: 'error', listener: (event: Event) => void): void;
}

// Analytics Engine 类型
export interface AnalyticsEngineDataset {
  writeDataPoint(data: AnalyticsEngineDataPoint[]): Promise<void>;
}

export interface AnalyticsEngineDatasetStub {
  writeDataPoint(data: AnalyticsEngineDataPoint[]): Promise<void>;
}

export interface AnalyticsEngineDataPoint {
  blobs?: Record<string, string>;
  doubles?: Record<string, number>;
  indexes?: string[];
  timestamp: number;
}

// Service Bindings 类型
export interface WorkersServiceBinding<T = any> {
  fetch(request: Request, env: WorkersEnv, ctx: ExecutionContext): Promise<Response>;
  connect(): T;
}

// 健康检查类型
export interface WorkersHealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  duration: number;
  version: string;
  checks: Record<string, {
    status: 'pass' | 'fail';
    duration: number;
    message?: string;
  }>;
}

// Workers 服务接口
export interface WorkersService {
  // 生命周期
  fetch(request: Request, env: WorkersEnv, ctx: ExecutionContext): Promise<Response>;
  scheduled?(event: ScheduledEvent, env: WorkersEnv, ctx: ExecutionContext): Promise<void>;
  queue?(batch: QueueMessageBatch, env: WorkersEnv): Promise<void>;

  // 工具方法
  createResponse<T>(data: T, options?: ResponseInit): Response;
  createError(message: string, status?: number, code?: string): Response;
  json<T>(data: T, status?: number): Response;

  // 路由
  get(pattern: string, handler: WorkersRouteHandler): void;
  post(pattern: string, handler: WorkersRouteHandler): void;
  put(pattern: string, handler: WorkersRouteHandler): void;
  delete(pattern: string, handler: WorkersRouteHandler): void;
  patch(pattern: string, handler: WorkersRouteHandler): void;
  options(pattern: string, handler: WorkersRouteHandler): void;

  // 中间件
  use(middleware: WorkersMiddleware): void;

  // 错误处理
  onError(handler: (error: Error, request: Request) => Response | Promise<Response>): void;

  // 健康检查
  onHealthCheck(handler: (env: WorkersEnv) => Promise<WorkersHealthCheck>): void;
}