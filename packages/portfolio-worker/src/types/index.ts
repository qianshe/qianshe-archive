// Portfolio Worker类型定义入口文件
export * from './blog';
export * from './comment';
export * from './project';

// 导出共享类型 (使用 index 路径)
// export * from '../../../shared/types';

// Portfolio 特定环境变量类型
export interface PortfolioEnv {
  // 基础服务
  SHARED_DB: D1Database;
  JWT_SECRET?: string;
  CORS_ORIGIN?: string;
  UPLOAD_BUCKET?: R2Bucket;
  CACHE: KVNamespace;
  ASSETS?: Fetcher;
  __STATIC_CONTENT?: KVNamespace;

  // Portfolio 特定
  ENVIRONMENT: 'development' | 'production';
  SITE_URL: string;
  SITE_TITLE: string;
  SITE_DESCRIPTION: string;
  AUTHOR_NAME: string;
  AUTHOR_EMAIL: string;

  // 功能开关
  COMMENT_ENABLED?: string;
  ANALYTICS_ENABLED?: string;
  SEARCH_ENABLED?: string;
  RSS_ENABLED?: string;

  // 社交媒体
  SOCIAL_GITHUB?: string;
  SOCIAL_TWITTER?: string;
  SOCIAL_LINKEDIN?: string;
}

// Portfolio 特定配置类型
export interface PortfolioConfig {
  site: {
    title: string;
    description: string;
    url: string;
    author: {
      name: string;
      email: string;
      avatar?: string;
      bio?: string;
    };
    social: {
      github?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  features: {
    comments: boolean;
    analytics: boolean;
    search: boolean;
    rss: boolean;
    darkMode: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    font: string;
  };
}

// Portfolio 特定健康检查响应
export interface PortfolioHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: 'connected' | 'disconnected';
    cache: 'available' | 'unavailable';
    search: 'available' | 'unavailable';
    rss: 'enabled' | 'disabled';
  };
  metrics: {
    totalPosts: number;
    totalProjects: number;
    totalComments: number;
    totalViews: number;
    avgLoadTime: number;
  };
}

// 分析统计类型（简化版）
export interface PageAnalytics {
  path: string;
  view_count: number;
  last_visit: string;
}

// 系统信息类型
export interface SystemInfo {
  version: string;
  total_posts: number;
  total_projects: number;
  total_comments: number;
  last_updated: string;
}

// 搜索结果类型
export interface SearchResult {
  type: 'post' | 'project';
  id: number;
  title: string;
  excerpt?: string;
  slug: string;
  score: number;
}

// 搜索请求
export interface SearchRequest {
  query: string;
  type?: 'all' | 'posts' | 'projects';
  page?: number;
  limit?: number;
}

// 搜索响应
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 评论类型
export interface Comment {
  id: number;
  post_id?: number;
  project_id?: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

// 评论创建请求
export interface CreateCommentRequest {
  post_id?: number;
  project_id?: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
}

// 评论查询参数
export interface CommentQuery {
  page?: number;
  limit?: number;
  post_id?: number;
  project_id?: number;
  approved?: boolean;
  sort_by?: 'created_at' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

// 友情链接
export interface Link {
  id: number;
  name: string;
  url: string;
  description?: string;
  avatar?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 系统设置
export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_at: string;
}

// 访问统计请求
export interface AnalyticsRequest {
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

// 技术栈统计
export interface TechStats {
  tech: string;
  count: number;
  projects: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
}

// 导出 Env 类型别名，使其他模块可以使用
export type Env = PortfolioEnv;
