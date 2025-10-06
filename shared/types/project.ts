/**
 * 项目相关类型定义
 */

// 项目基础类型
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  images: ProjectImage[];
  technologies: ProjectTechnology[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  start_date?: string;
  end_date?: string;
  difficulty: ProjectDifficulty;
  team_size: ProjectTeamSize;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  view_count: number;
  like_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author: Author;
}

// 项目图片类型
export interface ProjectImage {
  id: number;
  url: string;
  alt: string;
  caption?: string;
  type: ProjectImageType;
  sort_order: number;
}

export type ProjectImageType = 'cover' | 'screenshot' | 'diagram' | 'prototype' | 'other';

// 项目技术类型
export interface ProjectTechnology {
  id: number;
  name: string;
  category: TechnologyCategory;
  version?: string;
  description?: string;
  url?: string;
  icon?: string;
}

export type TechnologyCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'desktop'
  | 'ai-ml'
  | 'blockchain'
  | 'game'
  | 'other';

// 项目分类类型
export type ProjectCategory = 
  | 'web-application'
  | 'mobile-app'
  | 'desktop-app'
  | 'api-service'
  | 'library'
  | 'tool'
  | 'game'
  | 'research'
  | 'prototype'
  | 'other';

// 项目状态类型
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled' | 'archived';

// 项目难度类型
export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// 团队规模类型
export type ProjectTeamSize = 'solo' | 'small' | 'medium' | 'large';

// 作者信息类型（重新定义，避免循环依赖）
export interface Author {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

// 项目创建参数类型
export interface CreateProjectParams {
  title: string;
  description: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  images?: Omit<ProjectImage, 'id'>[];
  technologies?: Omit<ProjectTechnology, 'id'>[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured?: boolean;
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  start_date?: string;
  end_date?: string;
  difficulty: ProjectDifficulty;
  team_size: ProjectTeamSize;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  published_at?: string;
}

export interface UpdateProjectParams extends Partial<CreateProjectParams> {
  id: number;
}

// 项目查询参数类型
export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  difficulty?: ProjectDifficulty;
  team_size?: ProjectTeamSize;
  technologies?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'published_at' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'start_date' | 'end_date';
  order?: 'asc' | 'desc';
}

// 项目统计类型
export interface ProjectStats {
  total_projects: number;
  completed_projects: number;
  in_progress_projects: number;
  featured_projects: number;
  total_views: number;
  total_likes: number;
  category_counts: Record<ProjectCategory, number>;
  technology_counts: Record<string, number>;
  difficulty_distribution: Record<ProjectDifficulty, number>;
  recent_projects: Project[];
}

// 项目搜索结果类型
export interface ProjectSearchResult {
  projects: Project[];
  total: number;
  query: string;
  filters: ProjectQueryParams;
  suggestions?: string[];
}

// 项目时间线类型
export interface ProjectTimeline {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  date: string;
  type: TimelineEventType;
  status: TimelineEventStatus;
  metadata?: Record<string, any>;
}

export type TimelineEventType = 
  | 'milestone'
  | 'release'
  | 'update'
  | 'bug-fix'
  | 'feature'
  | 'research'
  | 'other';

export type TimelineEventStatus = 'completed' | 'in-progress' | 'planned' | 'cancelled';

// 项目标签类型
export interface ProjectTag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  usage_count: number;
}

// 项目收藏类型
export interface ProjectBookmark {
  id: number;
  user_id: number;
  project_id: number;
  created_at: string;
  notes?: string;
  tags?: string[];
}

// 项目评价类型
export interface ProjectReview {
  id: number;
  user_id: number;
  project_id: number;
  rating: number; // 1-5
  title?: string;
  content: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// 项目设置类型
export interface ProjectSettings {
  default_view_mode: 'grid' | 'list';
  items_per_page: number;
  enable_bookmarks: boolean;
  enable_reviews: boolean;
  enable_analytics: boolean;
  auto_generate_slugs: boolean;
  image_upload_limits: {
    max_size: number; // in bytes
    max_count: number;
    allowed_types: string[];
  };
  featured_projects_count: number;
  cache_duration: number; // in seconds
}

// 项目导入/导出类型
export interface ProjectExportData {
  projects: Project[];
  settings: ProjectSettings;
  exported_at: string;
  version: string;
}

export interface ProjectImportData {
  projects: Omit<Project, 'id' | 'created_at' | 'updated_at'>[];
  settings?: Partial<ProjectSettings>;
}

// 项目缓存键类型
export type ProjectCacheKey = 
  | 'project:list'
  | 'project:detail'
  | 'project:categories:counts'
  | 'project:technologies:popular'
  | 'project:stats:overview'
  | 'project:search:results'
  | 'project:timeline'
  | 'project:reviews';

// 项目事件类型
export interface ProjectEvent {
  type: 'project_created' | 'project_updated' | 'project_deleted' | 'project_viewed' | 'project_liked' | 'project_reviewed';
  data: {
    project_id: number;
    user_id?: number;
    timestamp: number;
    metadata?: Record<string, any>;
  };
}

// 项目协作类型
export interface ProjectCollaborator {
  id: number;
  user_id: number;
  project_id: number;
  role: CollaboratorRole;
  permissions: Permission[];
  invited_at: string;
  joined_at?: string;
  status: CollaboratorStatus;
}

export type CollaboratorRole = 'owner' | 'maintainer' | 'contributor' | 'viewer';

export type CollaboratorStatus = 'pending' | 'active' | 'inactive' | 'removed';

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_collaborators'
  | 'manage_settings'
  | 'publish'
  | 'review';