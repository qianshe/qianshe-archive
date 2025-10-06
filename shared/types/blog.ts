/**
 * 博客相关类型定义
 */

// 博客文章基础类型
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  featured: boolean;
  top: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  reading_time?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author: Author;
}

// 博客分类类型
export type BlogCategory = 'blog' | 'project' | 'announcement';

// 博客状态类型
export type BlogStatus = 'draft' | 'published' | 'archived' | 'deleted';

// 作者信息类型
export interface Author {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  social_links?: SocialLinks;
}

// 社交链接类型
export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  email?: string;
}

// 博客文章参数类型
export interface CreateBlogPostParams {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  featured?: boolean;
  top?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  published_at?: string;
}

export interface UpdateBlogPostParams extends Partial<CreateBlogPostParams> {
  id: number;
}

// 博客查询参数类型
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  category?: BlogCategory;
  tags?: string[];
  status?: BlogStatus;
  featured?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'published_at' | 'created_at' | 'updated_at' | 'view_count' | 'like_count';
  order?: 'asc' | 'desc';
}

// 博客统计类型
export interface BlogStats {
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

// 博客搜索结果类型
export interface BlogSearchResult {
  posts: BlogPost[];
  total: number;
  query: string;
  filters: BlogQueryParams;
}

// 博客归档类型
export interface BlogArchive {
  year: number;
  months: Array<{
    month: number;
    count: number;
    posts: BlogPost[];
  }>;
}

// 博客系列类型
export interface BlogSeries {
  id: number;
  title: string;
  description?: string;
  slug: string;
  posts: BlogPost[];
  created_at: string;
  updated_at: string;
}

// 相关文章类型
export interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  category: BlogCategory;
  tags: string[];
  published_at: string;
  reading_time?: number;
}

// 博客元数据类型
export interface BlogMetadata {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  site_url: string;
  rss_url?: string;
  sitemap_url?: string;
  theme_color?: string;
  language: string;
}

// 博客设置类型
export interface BlogSettings {
  site_name: string;
  site_description: string;
  site_author: string;
  posts_per_page: number;
  enable_comments: boolean;
  enable_likes: boolean;
  enable_views: boolean;
  comment_moderation: boolean;
  rss_enabled: boolean;
  sitemap_enabled: boolean;
  analytics_enabled: boolean;
  theme: string;
  custom_css?: string;
  custom_js?: string;
}

// 博客导入/导出类型
export interface BlogExportData {
  posts: BlogPost[];
  settings: BlogSettings;
  metadata: BlogMetadata;
  exported_at: string;
  version: string;
}

export interface BlogImportData {
  posts: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>[];
  settings?: Partial<BlogSettings>;
  metadata?: Partial<BlogMetadata>;
}

// 博客缓存键类型
export type BlogCacheKey = 
  | 'blog:posts:list'
  | 'blog:post:detail'
  | 'blog:categories:counts'
  | 'blog:tags:popular'
  | 'blog:stats:overview'
  | 'blog:search:results';

// 博客事件类型
export interface BlogEvent {
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'post_viewed' | 'post_liked' | 'post_commented';
  data: {
    post_id: number;
    user_id?: number;
    timestamp: number;
    metadata?: Record<string, any>;
  };
}