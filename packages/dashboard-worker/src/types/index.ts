// Dashboard Worker类型定义入口文件
export * from './management';
export * from './local-shared';

// 从auth模块选择性导出，避免冲突
export type {
  AdminUser,
  LoginResponse,
  DashboardJWTPayload,
  AuthContext,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  RefreshTokenRequest,
  SessionInfo,
  PermissionCheckResult,
  AuthConfig
} from './auth';

// 重命名导出避免冲突
export type { LoginRequest as DashboardLoginRequest } from './auth';

// Dashboard 特定环境变量类型
export interface DashboardEnv {
  // 基础服务
  SHARED_DB: D1Database;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  UPLOAD_BUCKET?: R2Bucket;

  // Dashboard 特定
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ENVIRONMENT: string;
  SITE_URL: string;
  API_BASE_URL: string;
  WEBHOOK_URL?: string;
  MONITORING_ENABLED?: string;
  ANALYTICS_ENABLED?: string;

  // 缓存和会话
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  SETTINGS?: KVNamespace;

  // 静态资源
  __STATIC_CONTENT?: KVNamespace;

  // 队列
  EMAIL_QUEUE?: Queue;
  ANALYTICS_QUEUE?: Queue;
}

// Dashboard 特定权限类型
export type DashboardPermission =
  | 'posts.create' | 'posts.read' | 'posts.update' | 'posts.delete'
  | 'comments.moderate' | 'comments.approve' | 'comments.delete'
  | 'users.manage' | 'users.read' | 'users.update' | 'users.delete'
  | 'settings.update' | 'settings.read'
  | 'analytics.view' | 'analytics.export'
  | 'media.upload' | 'media.delete' | 'media.manage'
  | 'backups.create' | 'backups.restore' | 'backups.delete'
  | 'system.monitor' | 'system.config';

// Dashboard 角色权限映射
export interface DashboardRolePermissions {
  admin: DashboardPermission[];
  moderator: DashboardPermission[];
  user: DashboardPermission[];
}

// Dashboard 特定操作日志
export interface DashboardActivityLog {
  id: number;
  user_id: number;
  action: DashboardAction;
  resource_type: string;
  resource_id?: number;
  details?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export enum DashboardAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE_POST = 'create_post',
  UPDATE_POST = 'update_post',
  DELETE_POST = 'delete_post',
  APPROVE_COMMENT = 'approve_comment',
  DELETE_COMMENT = 'delete_comment',
  UPDATE_USER = 'update_user',
  UPDATE_SETTINGS = 'update_settings',
  UPLOAD_MEDIA = 'upload_media',
  CREATE_BACKUP = 'create_backup',
  RESTORE_BACKUP = 'restore_backup'
}

// Dashboard 特定健康检查响应
export interface DashboardHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'connected' | 'disconnected';
    storage: 'available' | 'unavailable';
    cache: 'available' | 'unavailable';
    queue: 'available' | 'unavailable';
    monitoring: 'enabled' | 'disabled';
  };
  metrics: {
    activeUsers: number;
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
  };
}