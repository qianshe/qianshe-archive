// Dashboard Worker认证类型定义
import type { User as SharedUser, UserRole, UserStatus, LoginRequest as SharedLoginRequest, AuthResponse, TokenPair, JWTPayload as SharedJWTPayload } from './local-shared';

// 扩展共享用户类型为Dashboard特定需求
export interface AdminUser extends Omit<SharedUser, 'role'> {
  id: number;
  userId: number; // 添加userId属性以保持兼容性
  role: 'admin' | 'user' | 'moderator';
  username: string;
  nickname: string;
  login_count: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

// 登录请求 - 使用共享类型并扩展
export interface LoginRequest extends SharedLoginRequest {
  // 可以添加Dashboard特定的字段
  remember_me?: boolean;
}

// 登录响应 - 使用共享类型
export interface LoginResponse {
  user: AdminUser;
  token: string;
  expires_at: string;
}

// JWT载荷 - 扩展共享类型
export interface DashboardJWTPayload extends SharedJWTPayload {
  username?: string;
}

// 认证中间件上下文
export interface AuthContext {
  user: AdminUser;
  token: string;
  permissions: string[];
}

// 密码重置请求
export interface PasswordResetRequest {
  email: string;
}

// 密码重置确认
export interface PasswordResetConfirm {
  email: string;
  code: string;
  new_password: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  token: string;
}

// 会话信息
export interface SessionInfo {
  user_id: number;
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  requiredPermissions?: string[];
  userPermissions?: string[];
}

// 认证配置
export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  bcryptRounds: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}