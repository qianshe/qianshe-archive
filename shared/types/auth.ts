/**
 * 认证授权相关类型定义
 */

// 用户基础类型
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  two_factor_enabled: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  preferences?: UserPreferences;
  social_links?: SocialLinks;
}

// 用户角色类型
export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

// 用户状态类型
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

// 用户偏好设置类型
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  email_notifications: EmailNotificationSettings;
  privacy: PrivacySettings;
  ui: UISettings;
}

// 邮件通知设置类型
export interface EmailNotificationSettings {
  new_comments: boolean;
  new_likes: boolean;
  new_followers: boolean;
  weekly_digest: boolean;
  security_alerts: boolean;
  system_updates: boolean;
}

// 隐私设置类型
export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_last_login: boolean;
  allow_messages: boolean;
  data_collection: boolean;
  analytics_tracking: boolean;
}

// UI设置类型
export interface UISettings {
  sidebar_collapsed: boolean;
  compact_mode: boolean;
  show_tooltips: boolean;
  auto_save: boolean;
  default_editor_mode: 'visual' | 'markdown';
}

// 社交链接类型
export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  email?: string;
  instagram?: string;
  youtube?: string;
}

// 认证请求类型
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  two_factor_code?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  agree_to_terms: boolean;
  captcha_token?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// 认证响应类型
export interface AuthResponse {
  user: User;
  tokens: TokenPair;
  permissions: Permission[];
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string[];
}

// JWT 载荷类型
export interface JWTPayload {
  sub: number; // user id
  iat: number; // issued at
  exp: number; // expiration
  scope: string;
  role: UserRole;
}

// 会话类型
export interface Session {
  id: string;
  user_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  last_accessed: string;
  is_active: boolean;
  device_info?: DeviceInfo;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os?: string;
  browser?: string;
  version?: string;
}

// 权限类型
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
}

// 角色权限映射类型
export type RolePermissions = {
  [K in UserRole]: Permission[];
};

// 两步验证类型
export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
  backup_code?: string;
}

// API 密钥类型
export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: Permission[];
  last_used?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
  usage_count: number;
}

// 登录日志类型
export interface LoginLog {
  id: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  location?: GeoLocation;
  created_at: string;
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

// 安全事件类型
export interface SecurityEvent {
  id: number;
  user_id?: number;
  type: SecurityEventType;
  description: string;
  ip_address: string;
  user_agent?: string;
  severity: SecuritySeverity;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: number;
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'password_changed'
  | 'email_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'data_export'
  | 'data_deletion'
  | 'api_key_created'
  | 'api_key_revoked';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// 用户活动类型
export interface UserActivity {
  id: number;
  user_id: number;
  action: UserActivityAction;
  resource_type?: string;
  resource_id?: number;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export type UserActivityAction = 
  | 'login'
  | 'logout'
  | 'create_post'
  | 'update_post'
  | 'delete_post'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'create_comment'
  | 'update_comment'
  | 'delete_comment'
  | 'like_post'
  | 'unlike_post'
  | 'bookmark_project'
  | 'upload_file'
  | 'change_password'
  | 'update_profile'
  | 'export_data';

// 用户设置类型
export interface UserSettings {
  profile: UserProfileSettings;
  security: UserSecuritySettings;
  notifications: UserNotificationSettings;
  privacy: UserPrivacySettings;
  api: UserApiSettings;
}

export interface UserProfileSettings {
  full_name: string;
  bio: string;
  avatar: string;
  website: string;
  location: string;
  timezone: string;
  language: string;
}

export interface UserSecuritySettings {
  two_factor_enabled: boolean;
  email_verified: boolean;
  active_sessions: Session[];
  api_keys: ApiKey[];
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
}

export interface UserNotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  in_app: InAppNotificationSettings;
}

export interface PushNotificationSettings {
  new_comments: boolean;
  new_likes: boolean;
  new_followers: boolean;
  system_updates: boolean;
  security_alerts: boolean;
}

export interface InAppNotificationSettings {
  new_comments: boolean;
  new_likes: boolean;
  new_followers: boolean;
  system_messages: boolean;
  security_alerts: boolean;
}

export interface UserPrivacySettings {
  profile_visibility: 'public' | 'private';
  show_email: boolean;
  show_activity: boolean;
  allow_friend_requests: boolean;
  data_sharing: boolean;
  analytics_consent: boolean;
}

export interface UserApiSettings {
  rate_limit: {
    requests_per_hour: number;
    requests_per_minute: number;
  };
  allowed_origins: string[];
  webhook_urls: string[];
  export_format: 'json' | 'xml' | 'csv';
}

// 认证中间件类型
export interface AuthMiddlewareOptions {
  required: boolean;
  roles?: UserRole[];
  permissions?: string[];
  skip_two_factor?: boolean;
  allow_refresh_token?: boolean;
}

// 认证缓存类型
export type AuthCacheKey = 
  | 'user:profile'
  | 'user:permissions'
  | 'user:sessions'
  | 'auth:tokens'
  | 'security:events'
  | 'rate:limit';