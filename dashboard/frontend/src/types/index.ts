// Dashboard管理端类型定义入口文件
export * from './blog';
export * from './comment';
export * from './project';
export type { User, UserRole } from './user'; // 避免与react.ts中的User冲突
export * from './analytics';
export * from './react';
export type { LoginResponse, RefreshTokenResponse } from './services';

// 通用API响应类型
export interface ApiResponse<T = unknown> {
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

// 文件上传类型
export interface FileUpload {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  uploaded_by: number;
  is_public: boolean;
  created_at: string;
}

// 文件上传请求
export interface UploadRequest {
  file: File;
  is_public?: boolean;
  category?: string;
}

// 系统设置类型
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
  updated_at: string;
}

// 邮箱验证类型
export interface EmailVerification {
  id: number;
  email: string;
  code: string;
  type: 'comment' | 'register' | 'reset_password';
  is_used: boolean;
  expires_at: string;
  created_at: string;
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

// 通用错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 表单验证错误
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// 排序参数
export interface SortParams {
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

// 搜索参数
export interface SearchParams {
  search: string;
  search_fields?: string[];
}

// 日期范围参数
export interface DateRangeParams {
  start_date: string;
  end_date: string;
}