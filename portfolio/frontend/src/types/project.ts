// Portfolio展示端专用的项目相关类型定义

// 基础项目类型
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_image?: string;
  thumbnail_url?: string;
  tags: string[];
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  visibility: 'public' | 'private' | 'draft';
  is_featured: boolean;
  is_open_source: boolean;
  language: string;
  star_count: number;
  fork_count: number;
  watch_count: number;
  view_count: number;
  like_count: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  owner?: {
    name: string;
    avatar?: string;
    url?: string;
  };
  license?: string;
  repository_url?: string;
  documentation_url?: string;
  changelog_url?: string;
  issues_url?: string;
  wiki_url?: string;
}

// 项目查询参数
export interface ProjectQuery {
  page?: number;
  limit?: number;
  status?: Project['status'];
  visibility?: Project['visibility'];
  tags?: string[];
  tech_stack?: string[];
  language?: string;
  featured?: boolean;
  open_source?: boolean;
  search?: string;
  sort?: 'created_at' | 'updated_at' | 'star_count' | 'view_count' | 'title' | 'fork_count';
  order?: 'asc' | 'desc';
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
}

// 项目列表响应
export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 项目摘要类型（用于列表展示）
export interface ProjectSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  tags: string[];
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  status: Project['status'];
  language: string;
  star_count: number;
  fork_count: number;
  view_count: number;
  updated_at: string;
  is_featured: boolean;
  is_open_source: boolean;
}

// 项目统计信息
export interface ProjectStats {
  total: number;
  byStatus: Record<Project['status'], number>;
  byVisibility: Record<Project['visibility'], number>;
  byLanguage: Array<{
    name: string;
    count: number;
  }>;
  topTechStacks: Array<{
    name: string;
    count: number;
  }>;
  totalStars: number;
  totalForks: number;
  totalViews: number;
  totalLikes: number;
}

// 项目技术栈
export interface ProjectTech {
  name: string;
  count: number;
  projects: ProjectSummary[];
  percentage?: number;
  icon?: string;
  color?: string;
  documentation_url?: string;
}

// 项目分类
export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  project_count: number;
  color?: string;
  icon?: string;
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
  duration?: number; // for videos
}

// 项目里程碑
export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'planned';
  due_date?: string;
  completed_at?: string;
  progress?: number; // 0-100
  created_at: string;
  updated_at?: string;
}

// 项目贡献者
export interface ProjectContribution {
  id: string;
  contributor_name: string;
  contributor_url?: string;
  contributor_avatar?: string;
  contribution_type: 'code' | 'design' | 'documentation' | 'testing' | 'other';
  description?: string;
  contributions?: number;
  created_at: string;
}

// 项目版本信息
export interface ProjectVersion {
  id: string;
  version: string;
  tag_name: string;
  name: string;
  description?: string;
  is_prerelease: boolean;
  published_at: string;
  assets: Array<{
    name: string;
    download_url: string;
    size: number;
    content_type: string;
  }>;
}

// 项目问题/议题
export interface ProjectIssue {
  id: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  user: {
    name: string;
    avatar?: string;
    url?: string;
  };
  labels: string[];
  milestone?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  comments_count: number;
}

// 项目活动日志
export interface ProjectActivity {
  id: string;
  type: 'created' | 'updated' | 'starred' | 'forked' | 'viewed' | 'liked';
  user?: {
    name: string;
    avatar?: string;
  };
  details?: string;
  created_at: string;
  metadata?: Record<string, any>;
}