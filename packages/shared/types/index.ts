/**
 * 共享类型定义
 * 
 * 注意：大部分类型应该在各个子项目的 src/types 目录中定义
 * 这里只放真正需要跨项目共享的类型
 */

// 通用工具类型
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 通用 ID 类型
export type ID = string | number;
export type UUID = string;

// 时间戳类型
export type Timestamp = number;
export type ISOString = string;

// 通用 API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: number;
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// 排序类型
export interface SortParams {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// 搜索类型
export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// 日期范围类型
export interface DateRange {
  start: string;
  end: string;
}

// 文件类型
export interface FileInfo {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

// 状态类型
export type Status = 'pending' | 'loading' | 'success' | 'error' | 'idle';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Visibility = 'public' | 'private' | 'unlisted';
