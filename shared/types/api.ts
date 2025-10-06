/**
 * API 响应类型定义
 */

// 基础 API 响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

// 分页相关类型
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  pagination: PaginationMeta;
}> {}

// 错误响应类型
export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

// HTTP 状态码类型
export type HttpStatus = 
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable;

// API 方法类型
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 请求配置类型
export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// 文件上传类型
export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: number;
}

// 搜索参数类型
export interface SearchParams {
  query: string;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

// 统计数据类型
export interface StatsResponse {
  total: number;
  growth: number;
  period: string;
  breakdown?: Record<string, number>;
}

// 批量操作类型
export interface BulkOperation<T> {
  action: 'create' | 'update' | 'delete';
  items: T[];
  options?: {
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  };
}

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// Webhook 类型
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  createdAt: number;
  lastTriggered?: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// 缓存控制类型
export interface CacheControl {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[];
  strategy?: 'cache-first' | 'network-first' | 'cache-only';
}

// 限流类型
export interface RateLimit {
  windowMs: number;
  maxRequests: number;
  currentRequests: number;
  resetTime: number;
}

// API 版本类型
export type ApiVersion = 'v1' | 'v2';

// 健康检查类型
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  services: Record<string, {
    status: 'healthy' | 'unhealthy' | 'degraded';
    responseTime?: number;
    error?: string;
  }>;
  version: string;
  uptime: number;
}