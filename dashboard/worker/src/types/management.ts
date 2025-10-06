// Dashboard Worker管理功能类型定义
import type { BlogStatus, BlogCategory, UserRole, User as SharedUser, PaginatedResponse, PaginationParams } from './local-shared';

// 本地博客文章类型定义
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: SharedUser;
  category: BlogCategory;
  status: BlogStatus;
  tags: string[];
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// 扩展博客文章类型
export interface DashboardBlogPost extends Omit<BlogPost, 'author'> {
  author_id: number;
  author_name?: string;
  author_avatar?: string;
  category: BlogCategory;
  status: BlogStatus;
}

// 评论类型
export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number;
  user_email: string;
  user_name: string;
  user_website?: string;
  user_avatar?: string;
  content: string;
  ip_address?: string;
  user_agent?: string;
  is_verified: boolean;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

// 项目类型
export interface DashboardProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  content?: string;
  tags: string[];
  cover_image?: string;
  screenshots?: string[];
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  download_url?: string;
  status: 'active' | 'archived' | 'draft';
  is_featured: boolean;
  is_open_source: boolean;
  sort_order: number;
  star_count: number;
  fork_count: number;
  created_at: string;
  updated_at: string;
}

// 用户类型 - 扩展共享用户类型
export interface DashboardUser extends Omit<SharedUser, 'role'> {
  username: string; // 设为必需属性以兼容SharedUser
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  login_count: number;
}

// 批量操作请求
export interface BulkOperationRequest {
  action: 'publish' | 'draft' | 'archive' | 'delete' | 'approve' | 'reject';
  item_ids: number[];
}

// 批量操作响应
export interface BulkOperationResponse {
  success: boolean;
  success_count: number;
  error_count: number;
  errors?: string[];
}

// 内容审核请求
export interface ModerationRequest {
  content_type: 'comment' | 'post';
  content_id: number;
  action: 'approve' | 'reject' | 'delete';
  reason?: string;
}

// 媒体文件管理
export interface MediaFile {
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

// 文件上传响应
export interface UploadResponse {
  file: MediaFile;
  url: string;
}

// 系统设置
export interface DashboardSystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  is_public: boolean;
  updated_at: string;
}

// 备份信息
export interface BackupInfo {
  id: number;
  filename: string;
  size: number;
  type: 'full' | 'incremental';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

// 查询参数扩展
export interface BlogQueryParams extends PaginationParams {
  search?: string;
  status?: BlogStatus;
  category?: BlogCategory;
  featured?: boolean;
  author_id?: number;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

// 博客列表响应
export interface BlogListResponse extends PaginatedResponse<DashboardBlogPost> {
  // 可以添加额外的博客特定字段
}

// 统计信息类型
export interface DashboardStats {
  posts: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  comments: {
    total: number;
    approved: number;
    pending: number;
    spam: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    active: number;
    archived: number;
  };
  views: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
  };
}

// 搜索结果类型
export interface DashboardSearchResult<T> {
  items: T[];
  total: number;
  query: string;
  took: number; // 搜索耗时（毫秒）
}

// 操作日志类型
export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// 导出任务类型
export interface ExportTask {
  id: string;
  type: 'posts' | 'comments' | 'users' | 'analytics';
  format: 'json' | 'csv' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  file_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// 通知类型
export interface DashboardNotification {
  id: number;
  user_id?: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  read_at?: string;
}

// 系统健康状态
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    storage: ServiceStatus;
    queue: ServiceStatus;
  };
  metrics: {
    uptime: number;
    memory_usage: number;
    disk_usage: number;
    active_connections: number;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  response_time?: number;
  last_check: string;
  error?: string;
}