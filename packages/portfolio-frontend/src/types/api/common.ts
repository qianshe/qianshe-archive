// Portfolio展示端通用API类型定义

// 通用API响应结构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 排序参数
export interface SortParams {
  sort_by?: string;
  order?: 'asc' | 'desc';
}

// 搜索参数
export interface SearchParams {
  search?: string;
  search_fields?: string[];
}

// 日期范围参数
export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// 错误响应类型
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

// 表单验证错误
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API请求配置
export interface ApiRequestConfig {
  method?: HttpMethod;
  url?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

// 文件上传类型
export interface FileUpload {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

// 搜索结果类型
export interface SearchResult {
  id: number;
  title: string;
  excerpt?: string;
  url: string;
  type: 'blog' | 'project' | 'page';
  score?: number;
  highlights?: Record<string, string[]>;
  created_at: string;
}

// 搜索请求参数
export interface SearchRequest extends PaginationParams, SearchParams {
  type?: string;
  category?: string;
  tags?: string[];
  date_range?: DateRangeParams;
}

// 搜索响应
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    types: Array<{ name: string; count: number }>;
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}


// 系统信息类型
export interface SystemInfo {
  name: string;
  version: string;
  description: string;
  features: string[];
  total_posts: number;
  total_projects: number;
  total_comments: number;
  last_updated: string;
}

// 友情链接类型
export interface Link {
  id: number;
  name: string;
  url: string;
  description?: string;
  avatar_url?: string;
  category: 'friend' | 'resource' | 'tool';
  sort_order: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// 访问统计类型
export interface Analytics {
  id: number;
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  session_id?: string;
  visit_duration?: number;
  created_at: string;
}