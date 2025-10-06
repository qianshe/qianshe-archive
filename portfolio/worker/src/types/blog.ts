// Portfolio Worker博客文章类型定义
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// 文章列表查询参数
export interface BlogPostQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  tags?: string[];
  sort_by?: 'published_at' | 'view_count' | 'like_count' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// 文章列表响应
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 相关文章
export interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  published_at: string;
}

// 文章归档
export interface BlogArchive {
  year: number;
  month: number;
  count: number;
  posts: BlogPost[];
}

// 标签统计
export interface TagStats {
  tag: string;
  count: number;
}

// 分类统计
export interface CategoryStats {
  category: string;
  count: number;
}

// SEO信息
export interface SEOInfo {
  title: string;
  description: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}
