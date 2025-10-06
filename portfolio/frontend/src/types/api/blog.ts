// Portfolio展示端博客API类型定义

import { PaginationParams, SortParams, SearchParams, DateRangeParams } from './common';
import { BlogPost } from '../blog';

// 博客文章查询参数
export interface BlogPostQuery extends PaginationParams, SortParams, SearchParams {
  category?: 'blog' | 'project' | 'announcement';
  tags?: string[];
  featured?: boolean;
  author_id?: number;
  date_range?: DateRangeParams;
  status?: 'published' | 'draft';
}

// 博客文章列表响应
export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 博客文章创建/更新请求
export interface BlogPostRequest {
  title: string;
  slug?: string;
  category: 'blog' | 'project' | 'announcement';
  tags: string[];
  content: string;
  excerpt?: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  is_top?: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
}

// 博客文章统计信息
export interface BlogPostStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentPosts: BlogPost[];
  popularPosts: BlogPost[];
  topTags: Array<{
    name: string;
    count: number;
  }>;
}

// 归档信息
export interface ArchiveInfo {
  year: number;
  months: Array<{
    month: number;
    count: number;
  }>;
  total: number;
}

// 标签统计
export interface TagStats {
  name: string;
  slug: string;
  count: number;
  percentage?: number;
}

// 分类统计
export interface CategoryStats {
  name: string;
  slug: string;
  count: number;
  description?: string;
}

// 相关文章
export interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image?: string;
  category: 'blog' | 'project' | 'announcement';
  similarity: number;
  created_at: string;
}