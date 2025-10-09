// 博客分类类型
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

// Dashboard管理端博客文章类型定义
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: BlogCategory;
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  featured_image?: string; // 后端使用此字段
  author_id: number;
  author_name?: string;
  author_avatar?: string;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_top: boolean;
  meta_title?: string;
  meta_description?: string;
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
  category?: 'blog' | 'project' | 'announcement';
  tags?: string[]; // 前端使用数组，API层会处理序列化
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  is_top?: boolean;
  reading_time?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
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
