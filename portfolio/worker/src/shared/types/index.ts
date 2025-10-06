// 共享类型定义 - 前后端通用

// 用户相关类型
export interface User {
  id: number;
  email: string;
  username?: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

// 文章相关类型
export interface Post {
  id: number;
  title: string;
  slug: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  author_id: number;
  author?: User; // 关联查询时包含
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_top: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreatePostRequest {
  title: string;
  slug?: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  is_featured?: boolean;
  is_top?: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: number;
}

// 评论相关类型
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
  replies?: Comment[]; // 嵌套回复
}

export interface CreateCommentRequest {
  post_id: number;
  parent_id?: number;
  user_email: string;
  user_name: string;
  user_website?: string;
  content: string;
}

// 项目相关类型
export interface Project {
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

export interface CreateProjectRequest {
  title: string;
  slug?: string;
  description: string;
  content?: string;
  tags: string[];
  cover_image?: string;
  screenshots?: string[];
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  download_url?: string;
  status?: 'active' | 'draft';
  is_featured?: boolean;
  is_open_source?: boolean;
  sort_order?: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// 查询参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PostQueryParams extends PaginationParams {
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  author_id?: number;
}

export interface CommentQueryParams extends PaginationParams {
  post_id?: number;
  is_approved?: boolean;
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  expires_in: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 统计相关类型
export interface Analytics {
  id: number;
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  session_id?: string;
  visit_duration?: number;
  created_at: string;
}

export interface PageViewStats {
  page_path: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
}

export interface PopularPost {
  post: Post;
  views: number;
  comments: number;
  likes: number;
}

// 设置相关类型
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

export interface SendVerificationRequest {
  email: string;
  type: 'comment' | 'register' | 'reset_password';
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
  type: 'comment' | 'register' | 'reset_password';
}

// 文件上传类型
export interface Upload {
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

export interface UploadResponse {
  upload: Upload;
  url: string;
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

// 搜索结果类型
export interface SearchResult {
  type: 'post' | 'project' | 'comment';
  id: number;
  title: string;
  excerpt?: string;
  content: string;
  url: string;
  score: number;
  created_at: string;
}

export interface SearchQuery {
  q: string;
  type?: 'post' | 'project' | 'comment' | 'all';
  page?: number;
  limit?: number;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// 环境变量类型
export interface Env {
  // Database
  DB: D1Database;

  // KV Storage
  CACHE: KVNamespace;

  // Environment
  ENVIRONMENT: string;
  SITE_URL: string;

  // Secrets (生产环境需要设置)
  JWT_SECRET?: string;
  EMAIL_SERVICE_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}
