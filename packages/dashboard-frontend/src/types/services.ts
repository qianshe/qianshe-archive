// Dashboard管理端服务层类型定义

// 基础用户类型
export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

// 博客相关类型
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: BlogCategory;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export type BlogCategory = 'blog' | 'project' | 'announcement';

// 项目相关类型
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export type ProjectCategory =
  | 'web-application'
  | 'mobile-app'
  | 'desktop-app'
  | 'api-service'
  | 'library'
  | 'tool'
  | 'game'
  | 'research'
  | 'prototype'
  | 'other';

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled' | 'archived';

// 请求参数类型
export interface CreateBlogPostParams {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: BlogCategory;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured?: boolean;
}

export interface CreateProjectParams {
  title: string;
  description: string;
  content: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface AdminLoginCredentials {
  password: string;
  remember?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// 类型别名定义 - 保持向后兼容
export type BlogPostRequest = CreateBlogPostParams;
export type BlogPostQuery = {
  page?: number;
  limit?: number;
  category?: BlogCategory;
  tags?: string[];
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
};
export type ProjectRequest = CreateProjectParams;
export type ProjectQuery = {
  page?: number;
  limit?: number;
  category?: ProjectCategory;
  status?: ProjectStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
};
export type UserRequest = RegisterRequest;
export type UserQuery = {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
};
export type CommentQuery = {
  page?: number;
  limit?: number;
  post_id?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
};
export type FileQuery = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isPublic?: boolean;
  mimeType?: string;
  startDate?: string;
  endDate?: string;
};
export type AnalyticsQuery = {
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
};
export type DateRangeParams = {
  start_date?: string;
  end_date?: string;
};

// 响应类型定义
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FileListResponse {
  files: FileUpload[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 认证响应类型（支持两种格式）
export interface LoginResponse {
  user: User;
  tokens?: TokenPair; // 旧格式
  token?: string; // 新格式（单个token）
  expires_at?: string; // token过期时间
}

export interface RefreshTokenResponse {
  tokens: TokenPair;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  access_token?: string; // 兼容下划线格式
  refresh_token?: string; // 兼容下划线格式
}

// 博客相关类型（扩展）
export type BlogTag = string;
export interface BlogPostStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  category_counts: Record<BlogCategory, number>;
  recent_views: number;
  popular_tags: Array<{
    tag: string;
    count: number;
  }>;
}

// 评论相关类型
export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[];
}

// 文件相关类型
export interface FileUpload {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  thumbnail_url?: string;
  category: string;
  is_public: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

// 用户统计类型
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_users: number;
  recent_registrations: number;
  role_distribution: Record<UserRole, number>;
}

// 分析相关类型
export interface OverviewStats {
  total_visits: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  date_range: DateRangeParams;
}

export interface PageStats {
  path: string;
  title: string;
  views: number;
  unique_views: number;
  avg_time_on_page: number;
  bounce_rate: number;
  exit_rate: number;
  date: string;
}

export interface VisitTrend {
  date: string;
  visits: number;
  unique_visitors: number;
  page_views: number;
  avg_session_duration: number;
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
  sessions: number;
  avg_session_duration: number;
}

export interface BrowserStats {
  browser: string;
  version?: string;
  count: number;
  percentage: number;
  sessions: number;
}

export interface GeoStats {
  country: string;
  region?: string;
  city?: string;
  count: number;
  percentage: number;
  unique_visitors: number;
}

// 系统相关类型
export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  disk_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu_usage: number;
  database: {
    status: string;
    size: number;
    connections: number;
  };
  cache: {
    status: string;
    hit_rate: number;
    size: number;
  };
}

export interface Setting {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
  editable: boolean;
  created_at: string;
  updated_at: string;
}

// 友情链接相关类型
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

// HTTP请求配置类型
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  validateStatus?: (status: number) => boolean;
  _retry?: boolean;
}

// API请求方法类型
export interface ApiMethods {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>;
  upload<T = unknown>(url: string, formData: FormData, config?: RequestConfig): Promise<T>;
}

// HTTP响应类型
export interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// API错误类型
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
  field?: string;
}

// 认证服务类型
export interface AuthService {
  login(credentials: AdminLoginCredentials): Promise<LoginResponse>;
  adminLogin(password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<RefreshTokenResponse>;
  verifyToken(): Promise<User>;
  changePassword(data: ChangePasswordRequest): Promise<void>;
  resetPassword(data: ResetPasswordRequest): Promise<void>;
  getCurrentUser(): Promise<User>;
}

// 博客服务类型
export interface BlogService {
  getPosts(params: BlogPostQuery): Promise<BlogPostListResponse>;
  getPost(id: number): Promise<BlogPost>;
  createPost(data: BlogPostRequest): Promise<BlogPost>;
  updatePost(id: number, data: BlogPostRequest): Promise<BlogPost>;
  deletePost(id: number): Promise<void>;
  publishPost(id: number): Promise<BlogPost>;
  unpublishPost(id: number): Promise<BlogPost>;
  duplicatePost(id: number): Promise<BlogPost>;
  getPostsStats(): Promise<BlogPostStats>;
  getCategories(): Promise<BlogCategory[]>;
  getTags(): Promise<BlogTag[]>;
}

// 项目服务类型
export interface ProjectService {
  getProjects(params: ProjectQuery): Promise<ProjectListResponse>;
  getProject(id: number): Promise<Project>;
  createProject(data: ProjectRequest): Promise<Project>;
  updateProject(id: number, data: ProjectRequest): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  getProjectsStats(): Promise<ProjectStats>;
  syncFromGitHub(repoUrl: string): Promise<Project>;
  updateProjectStatus(id: number, status: Project['status']): Promise<Project>;
}

export interface ProjectStats {
  total_projects: number;
  completed_projects: number;
  in_progress_projects: number;
  featured_projects: number;
  total_views: number;
  total_likes: number;
  category_counts: Record<ProjectCategory, number>;
  recent_projects: Project[];
}

// 评论服务类型
export interface CommentService {
  getComments(params: CommentQuery): Promise<CommentListResponse>;
  getComment(id: number): Promise<Comment>;
  approveComment(id: number): Promise<Comment>;
  rejectComment(id: number): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  bulkApprove(commentIds: number[]): Promise<Comment[]>;
  bulkReject(commentIds: number[]): Promise<Comment[]>;
  bulkDelete(commentIds: number[]): Promise<void>;
  replyToComment(id: number, content: string): Promise<Comment>;
}

// 用户服务类型
export interface UserService {
  getUsers(params: UserQuery): Promise<UserListResponse>;
  getUser(id: number): Promise<User>;
  createUser(data: UserRequest): Promise<User>;
  updateUser(id: number, data: UserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
  changeUserStatus(id: number, isActive: boolean): Promise<User>;
  changeUserRole(id: number, role: UserRole): Promise<User>;
  resetUserPassword(id: number): Promise<string>;
  getUsersStats(): Promise<UserStats>;
  bulkChangeStatus(userIds: number[], isActive: boolean): Promise<User[]>;
  bulkDelete(userIds: number[]): Promise<void>;
}

// 文件服务类型
export interface FileService {
  uploadFile(file: File, options?: UploadOptions): Promise<FileUpload>;
  uploadFiles(files: File[], options?: UploadOptions): Promise<FileUpload[]>;
  getFiles(params: FileQuery): Promise<FileListResponse>;
  getFile(id: number): Promise<FileUpload>;
  deleteFile(id: number): Promise<void>;
  updateFile(id: number, data: UpdateFileRequest): Promise<FileUpload>;
  getFileUrl(id: number): string;
  getThumbnailUrl(id: number, size?: 'sm' | 'md' | 'lg'): string;
  optimizeImage(id: number, options: ImageOptimizeOptions): Promise<FileUpload>;
}

export interface UploadOptions {
  category?: string;
  isPublic?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export interface UpdateFileRequest {
  filename?: string;
  isPublic?: boolean;
  category?: string;
}

export interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

// 分析服务类型
export interface AnalyticsService {
  getOverviewStats(dateRange?: DateRangeParams): Promise<OverviewStats>;
  getPageStats(params: AnalyticsQuery): Promise<PageStats[]>;
  getVisitTrends(params: AnalyticsQuery): Promise<VisitTrend[]>;
  getDeviceStats(dateRange?: DateRangeParams): Promise<DeviceStats[]>;
  getBrowserStats(dateRange?: DateRangeParams): Promise<BrowserStats[]>;
  getGeoStats(dateRange?: DateRangeParams): Promise<GeoStats[]>;
  getTopPages(params: AnalyticsQuery): Promise<PageStats[]>;
  getReferrers(params: AnalyticsQuery): Promise<Array<{ source: string; count: number }>>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  exportData(params: ExportAnalyticsParams): Promise<Blob>;
}

export interface AnalyticsEvent {
  type: 'page_view' | 'click' | 'download' | 'form_submit' | 'search';
  path?: string;
  referrer?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export interface ExportAnalyticsParams {
  dateRange: DateRangeParams;
  format: 'csv' | 'excel' | 'json';
  metrics: string[];
}

// 系统服务类型
export interface SystemService {
  getSystemInfo(): Promise<SystemInfo>;
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string | number | boolean | Record<string, unknown>): Promise<Setting>;
  backupSystem(): Promise<{ url: string; filename: string }>;
  restoreSystem(file: File): Promise<void>;
  clearCache(): Promise<void>;
  getLogs(params: LogQuery): Promise<LogListResponse>;
  getLinks(): Promise<Link[]>;
  createLink(data: CreateLinkRequest): Promise<Link>;
  updateLink(id: number, data: UpdateLinkRequest): Promise<Link>;
  deleteLink(id: number): Promise<void>;
}

export interface LogQuery {
  page?: number;
  limit?: number;
  level?: 'error' | 'warn' | 'info' | 'debug';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LogListResponse {
  logs: Array<{
    id: string;
    level: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateLinkRequest {
  name: string;
  url: string;
  description?: string;
  avatar_url?: string;
  category: 'friend' | 'resource' | 'tool';
  sort_order?: number;
}

export interface UpdateLinkRequest {
  name?: string;
  url?: string;
  description?: string;
  avatar_url?: string;
  category?: 'friend' | 'resource' | 'tool';
  sort_order?: number;
  is_active?: boolean;
}