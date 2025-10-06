// Portfolio展示端项目API类型定义

import { PaginationParams, SortParams, SearchParams, DateRangeParams } from './common';
import { Project } from '../project';

// 项目查询参数
export interface ProjectQuery extends PaginationParams, SortParams, SearchParams {
  status?: Project['status'];
  visibility?: Project['visibility'];
  tags?: string[];
  tech_stack?: string[];
  language?: string;
  featured?: boolean;
  open_source?: boolean;
  date_range?: DateRangeParams;
}

// 项目列表响应
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 项目创建/更新请求
export interface ProjectRequest {
  title: string;
  slug?: string;
  description: string;
  content: string;
  tags: string[];
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  visibility: 'public' | 'private' | 'draft';
  is_featured?: boolean;
  is_open_source?: boolean;
  language?: string;
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  thumbnail_url?: string;
}

// 项目统计信息
export interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  planning: number;
  onHold: number;
  archived: number;
  public: number;
  private: number;
  draft: number;
  openSource: number;
  featured: number;
  totalStars: number;
  totalForks: number;
  totalViews: number;
  totalLikes: number;
  recentProjects: Project[];
  popularProjects: Project[];
  topTechStacks: Array<{
    name: string;
    count: number;
  }>;
  topLanguages: Array<{
    name: string;
    count: number;
  }>;
}

// 技术栈统计
export interface TechStats {
  name: string;
  count: number;
  projects: Array<{
    id: number;
    title: string;
    slug: string;
    stars: number;
    updated_at: string;
  }>;
  percentage?: number;
}

// 语言统计
export interface LanguageStats {
  name: string;
  count: number;
  percentage?: number;
  color?: string;
  projects: Array<{
    id: number;
    title: string;
    slug: string;
    stars: number;
    updated_at: string;
  }>;
}

// 项目贡献者
export interface ProjectContributor {
  id: string;
  contributor_name: string;
  contributor_url?: string;
  contribution_type: 'code' | 'design' | 'documentation' | 'testing' | 'other';
  description?: string;
  contributions: number;
  created_at: string;
}

// 项目里程碑
export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'planned';
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

// 项目链接
export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  type: 'github' | 'demo' | 'docs' | 'download' | 'other';
  icon?: string;
  is_external: boolean;
  sort_order: number;
}

// 项目媒体文件
export interface ProjectMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  alt?: string;
  caption?: string;
  sort_order: number;
  width?: number;
  height?: number;
  file_size?: number;
}