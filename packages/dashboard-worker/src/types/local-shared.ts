// 本地共享类型定义 - 避免rootDir问题

// 用户角色
export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';

// 用户状态
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// 权限
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
}

// 基础用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

// 认证响应
export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  expires_at: string;
}

// 令牌对
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// JWT载荷
export interface JWTPayload {
  sub: string;
  user_id: number;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// API响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: number;
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp?: number;
}

// 分页响应
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 分页元数据
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 博客状态
export type BlogStatus = 'draft' | 'published' | 'archived' | 'deleted';

// 博客分类
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  created_at: string;
}

// 环境
export type Environment = 'development' | 'staging' | 'production';

// 环境验证规则
export interface EnvValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  pattern?: string;
  min?: number;
  max?: number;
  defaultValue?: any;
}

// Workers配置
export interface WorkersConfig {
  enabled: boolean;
  maxConcurrency: number;
  timeout: number;
  memory: number;
  retries: number;
}

// Workers指标
export interface WorkersMetrics {
  active: number;
  completed: number;
  failed: number;
  avgDuration: number;
  memoryUsage: number;
}

// Workers请求
export interface WorkersRequest {
  id: string;
  type: string;
  payload: any;
  priority: number;
  createdAt: number;
  scheduledAt?: number;
}