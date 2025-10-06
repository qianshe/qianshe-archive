// Dashboard管理端博客文章类型定义
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  author_id: number;
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

// 文章列表查询参数
export interface BlogPostQuery {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  author_id?: number;
}

// 文章列表响应
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建/更新文章请求
export interface BlogPostRequest {
  title: string;
  slug?: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  author_id?: number;
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  is_top?: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
}

// 文章统计信息
export interface BlogPostStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}
