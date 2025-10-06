// Dashboard管理端项目类型定义
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

// 项目列表查询参数
export interface ProjectQuery {
  page?: number;
  limit?: number;
  status?: string;
  featured?: boolean;
  search?: string;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'star_count' | 'sort_order';
  sort_order?: 'asc' | 'desc';
}

// 项目列表响应
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建/更新项目请求
export interface ProjectRequest {
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
  status: 'active' | 'archived' | 'draft';
  is_featured?: boolean;
  is_open_source?: boolean;
  sort_order?: number;
}

// 项目统计信息
export interface ProjectStats {
  total: number;
  active: number;
  archived: number;
  draft: number;
  featured: number;
  totalStars: number;
  totalForks: number;
}
