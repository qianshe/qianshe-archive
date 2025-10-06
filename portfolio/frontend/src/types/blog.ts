// Portfolio展示端专用的博客相关类型定义

// 基础博客文章类型
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_top?: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  reading_time?: number;
  word_count?: number;
  seo_description?: string;
}

// 博客评论类型
export interface BlogComment {
  id: number;
  post_id: number;
  user_name: string;
  user_email: string;
  user_website?: string;
  content: string;
  is_approved: boolean;
  like_count: number;
  created_at: string;
  updated_at?: string;
  replies?: BlogComment[];
  parent_id?: number;
}

// 博客分类类型
export interface BlogCategory {
  id: string;
  name: string;
  category: string;
  slug: string;
  description?: string;
  post_count: number;
  color?: string;
  icon?: string;
}

// 博客标签类型
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  color?: string;
  description?: string;
}

// 博客文章摘要类型（用于列表展示）
export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  published_at: string;
  reading_time?: number;
  author?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

// 博客文章元数据类型
export interface BlogPostMeta {
  id: number;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  canonical_url?: string;
  focus_keyword?: string;
  meta_description?: string;
  meta_keywords?: string[];
}

// 博客文章评论表单类型
export interface CommentForm {
  user_name: string;
  user_email: string;
  user_website?: string;
  content: string;
  post_id: number;
  parent_id?: number;
}

// 博客归档类型
export interface BlogArchive {
  year: number;
  months: Array<{
    month: number;
    count: number;
    posts: BlogPostSummary[];
  }>;
  total: number;
}

// 博客文章查询参数类型
export interface BlogPostQuery {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  search?: string;
  tags?: string[];
  featured?: boolean;
  sort_by?: 'published_at' | 'created_at' | 'updated_at' | 'title' | 'view_count' | 'like_count';
  sort_order?: 'asc' | 'desc';
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
}

// 博客文章列表响应类型
export interface BlogPostListResponse {
  posts: BlogPostSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 博客搜索结果类型
export interface BlogSearchResult {
  posts: BlogPostSummary[];
  total: number;
  query: string;
  took: number;
  suggestions?: string[];
}