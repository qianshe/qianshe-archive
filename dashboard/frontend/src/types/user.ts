// Dashboard管理端用户类型定义
export interface User {
  id: number;
  email: string;
  username: string;
  display_name?: string;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

// 用户角色类型
export type UserRole = 'admin' | 'moderator' | 'user';

// 用户列表查询参数
export interface UserQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  is_active?: boolean;
  email_verified?: boolean;
}

// 用户列表响应
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建/更新用户请求
export interface UserRequest {
  email: string;
  username?: string;
  display_name?: string;
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
  password?: string;
}

// 用户登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 管理员登录请求
export interface AdminLoginRequest {
  password: string;
}

// 用户登录响应
export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Token刷新响应
export interface RefreshTokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// 用户统计信息
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  moderators: number;
  users: number;
  emailVerified: number;
  todayLogins: number;
  thisMonthLogins: number;
}
