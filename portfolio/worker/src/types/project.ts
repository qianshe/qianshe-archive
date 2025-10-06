// Portfolio Worker项目类型定义
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  tech_stack: string[];
  status: 'completed' | 'in-progress' | 'planned';
  cover_image?: string;
  screenshots?: string[];
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  download_url?: string;
  is_featured: boolean;
  is_open_source: boolean;
  star_count: number;
  fork_count: number;
  created_at: string;
  updated_at: string;
}

// 项目列表查询参数
export interface ProjectQuery {
  page?: number;
  limit?: number;
  featured?: boolean;
  search?: string;
  tech?: string[];
  status?: 'completed' | 'in-progress' | 'planned';
  sort_by?: 'created_at' | 'updated_at' | 'star_count' | 'fork_count' | 'title';
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

// 技术栈统计
export interface TechStackStats {
  tech: string;
  count: number;
}

// 项目分类
export interface ProjectCategory {
  name: string;
  description: string;
  count: number;
}
