/**
 * 业务模型类型定义
 * 定义博客系统、项目管理等核心业务数据模型
 */

// =============================================================================
// 博客系统类型定义
// =============================================================================

// 博客文章基础类型
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'private' | 'trash';
  type: 'post' | 'page';
  authorId: number;
  categoryId?: number;
  tags: string[];
  meta: BlogPostMeta;
  seo: BlogPostSEO;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 博客文章元数据
export interface BlogPostMeta {
  readingTime: number; // 预计阅读时间（分钟）
  wordCount: number;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  priority: number;
  template?: string;
  customFields?: Record<string, any>;
}

// 博客SEO数据
export interface BlogPostSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
}

// 博客分类
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  coverImage?: string;
  meta: {
    postCount: number;
    viewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 博客标签
export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  meta: {
    postCount: number;
    viewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 博客评论
export interface BlogComment {
  id: number;
  postId: number;
  parentId?: number; // 回复的评论ID
  authorId?: number; // 注册用户ID
  authorName: string; // 显示名称
  authorEmail: string;
  authorUrl?: string;
  authorIp: string;
  userAgent?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  meta: {
    likes: number;
    dislikes: number;
    replies: number;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// =============================================================================
// 项目管理类型定义
// =============================================================================

// 项目基础类型
export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  content: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'public' | 'private' | 'internal';
  managerId: number;
  teamIds: number[];
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: number;
  actualCost?: number;
  progress: number; // 0-100
  tags: string[];
  meta: ProjectMeta;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 项目元数据
export interface ProjectMeta {
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
  fileCount: number;
  totalFileSize: number;
  lastActivityAt?: string;
  milestoneCount: number;
  completedMilestoneCount: number;
  timeSpent: number; // 总工作时间（小时）
  estimatedTime: number; // 预估工作时间（小时）
}

// 项目任务
export interface ProjectTask {
  id: number;
  projectId: number;
  parentTaskId?: number;
  title: string;
  description?: string;
  content?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'task' | 'bug' | 'feature' | 'improvement' | 'epic';
  assigneeId?: number;
  reporterId: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  dependencies: TaskDependency[];
  meta: TaskMeta;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 任务元数据
export interface TaskMeta {
  subtaskCount: number;
  completedSubtaskCount: number;
  commentCount: number;
  attachmentCount: number;
  totalAttachmentSize: number;
  lastActivityAt?: string;
  timeEntries: TimeEntry[];
}

// 任务附件
export interface TaskAttachment {
  id: number;
  taskId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploaderId: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 任务评论
export interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  content: string;
  mentions: number[]; // 提及的用户ID
  reactions: TaskReaction[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  deletedAt?: string;
}

// 任务反应（表情等）
export interface TaskReaction {
  id: number;
  commentId: number;
  userId: number;
  emoji: string;
  createdAt: string;
}

// 任务依赖关系
export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: 'blocks' | 'blocked_by' | 'relates_to';
  createdAt: string;
}

// 时间记录
export interface TimeEntry {
  id: number;
  taskId: number;
  userId: number;
  description?: string;
  hours: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// 项目里程碑
export interface ProjectMilestone {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: 'open' | 'completed' | 'overdue';
  progress: number; // 0-100
  tasks: number[]; // 关联的任务ID
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// 用户系统类型定义
// =============================================================================

// 用户基础类型
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone: string;
  language: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: UserRole;
  permissions: Permission[];
  meta: UserMeta;
  preferences: UserPreferences;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 用户角色
export interface UserRole {
  id: number;
  name: string;
  slug: string;
  description?: string;
  level: number; // 权限级别，数字越大权限越高
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 权限
export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  resource: string; // 资源类型，如 'blog', 'project', 'user'
  action: string; // 操作类型，如 'create', 'read', 'update', 'delete'
  conditions?: Record<string, any>; // 权限条件
  createdAt: string;
  updatedAt: string;
}

// 用户元数据
export interface UserMeta {
  postCount: number;
  projectCount: number;
  taskCount: number;
  commentCount: number;
  fileUploadCount: number;
  totalFileSize: number;
  lastActivityAt?: string;
  registrationIp?: string;
  referrerId?: number;
  referralCount: number;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  dashboard: DashboardPreferences;
}

// 通知偏好
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    mentions: boolean;
    comments: boolean;
    assignments: boolean;
    deadlines: boolean;
    updates: boolean;
  };
}

// 隐私偏好
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showLocation: boolean;
  allowDirectMessages: boolean;
  allowTagging: boolean;
}

// 仪表板偏好
export interface DashboardPreferences {
  layout: 'grid' | 'list' | 'kanban';
  widgets: string[];
  defaultProjectView: 'list' | 'board' | 'calendar';
  itemsPerPage: number;
}

// =============================================================================
// 媒体文件类型定义
// =============================================================================

// 媒体文件
export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  title?: string;
  description?: string;
  caption?: string;
  altText?: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  path: string;
  url: string;
  thumbnailUrl?: string;
  uploaderId: number;
  parentId?: number; // 父级文件ID（用于多版本文件）
  directory: string;
  meta: MediaMeta;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 媒体文件元数据
export interface MediaMeta {
  exif?: Record<string, any>; // 图片EXIF信息
  duration?: number; // 视频/音频时长
  bitrate?: number; // 音频/视频比特率
  fps?: number; // 视频帧率
  format?: string;
  colorSpace?: string;
  checksum: string;
  variants: MediaVariant[]; // 不同尺寸/格式的变体
}

// 媒体文件变体
export interface MediaVariant {
  name: string;
  filename: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  url: string;
  createdAt: string;
}

// 媒体文件夹
export interface MediaFolder {
  id: number;
  name: string;
  path: string;
  parentId?: number;
  description?: string;
  permissions: FolderPermission[];
  meta: FolderMeta;
  createdAt: string;
  updatedAt: string;
}

// 文件夹权限
export interface FolderPermission {
  userId?: number;
  roleId?: number;
  permissions: ('read' | 'write' | 'delete' | 'upload')[];
}

// 文件夹元数据
export interface FolderMeta {
  fileCount: number;
  totalSize: number;
  subfolderCount: number;
  lastModifiedAt?: string;
}

// =============================================================================
// 系统配置类型定义
// =============================================================================

// 系统设置
export interface SystemSetting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  group: string;
  public: boolean; // 是否可以通过API公开访问
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

// 系统主题
export interface SystemTheme {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  preview?: string;
  config: ThemeConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 主题配置
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// =============================================================================
// 通知系统类型定义
// =============================================================================

// 通知
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  data?: Record<string, any>; // 额外的结构化数据
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  expiresAt?: string;
  meta: NotificationMeta;
  createdAt: string;
  updatedAt: string;
}

// 通知渠道
export interface NotificationChannel {
  type: 'email' | 'push' | 'sms' | 'webhook' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
}

// 通知元数据
export interface NotificationMeta {
  template?: string;
  locale?: string;
  timezone?: string;
  groupId?: string; // 用于分组相关通知
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  icon?: string;
}

// 通知模板
export interface NotificationTemplate {
  id: number;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
  locales: Record<string, TemplateLocale>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 模板变量
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  description?: string;
  required: boolean;
  defaultValue?: any;
}

// 模板本地化
export interface TemplateLocale {
  subject?: string;
  content: string;
  variables?: Record<string, string>;
}

// =============================================================================
// 搜索系统类型定义
// =============================================================================

// 搜索索引
export interface SearchIndex {
  id: string;
  type: string; // 'blog_post', 'project', 'user', etc.
  title: string;
  content: string;
  summary?: string;
  url: string;
  metadata: Record<string, any>;
  tags: string[];
  language: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

// 搜索查询
export interface SearchQuery {
  q: string; // 查询关键词
  type?: string; // 搜索类型过滤
  filters?: SearchFilter[]; // 搜索过滤器
  sort?: SearchSort; // 排序方式
  page?: number;
  limit?: number;
  highlight?: boolean; // 是否高亮搜索结果
  facets?: string[]; // 需要返回的统计字段
}

// 搜索过滤器
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
}

// 搜索排序
export interface SearchSort {
  field: string;
  direction: 'asc' | 'desc';
}

// 搜索结果
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  aggregations?: Record<string, SearchAggregation>;
  suggestions?: string[];
  searchTime: number;
}

// 搜索聚合统计
export interface SearchAggregation {
  buckets: Array<{
    key: string;
    count: number;
  }>;
  total: number;
}

// =============================================================================
// 分析统计类型定义
// =============================================================================

// 分析指标
export interface AnalyticsMetric {
  name: string;
  value: number;
  change?: number; // 相比上一个周期的变化
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
}

// 分析报告
export interface AnalyticsReport {
  id: string;
  name: string;
  type: string;
  period: {
    start: string;
    end: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  };
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  insights?: string[];
  createdAt: string;
  updatedAt: string;
}

// 分析图表
export interface AnalyticsChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  title: string;
  data: ChartData;
  options?: ChartOptions;
}

// 图表数据
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// 图表数据集
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// 图表选项
export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  scales?: Record<string, any>;
  plugins?: Record<string, any>;
  legend?: Record<string, any>;
}

// =============================================================================
// 导出/导入类型定义
// =============================================================================

// 导出任务
export interface ExportTask {
  id: string;
  type: string;
  format: 'json' | 'csv' | 'xlsx' | 'pdf' | 'xml';
  filters?: Record<string, any>;
  options?: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  downloadUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
}

// 导出选项
export interface ExportOptions {
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
  compression?: boolean;
  password?: string;
  split?: boolean;
  maxFileSize?: number;
}

// 导入任务
export interface ImportTask {
  id: string;
  type: string;
  format: 'json' | 'csv' | 'xlsx' | 'xml';
  filePath: string;
  originalName: string;
  fileSize: number;
  mapping?: FieldMapping[];
  options?: ImportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords?: number;
  processedRecords?: number;
  successRecords?: number;
  errorRecords?: number;
  errors?: ImportError[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 字段映射
export interface FieldMapping {
  source: string;
  target: string;
  transform?: string; // 转换函数或表达式
  default?: any;
  required?: boolean;
}

// 导入选项
export interface ImportOptions {
  skipFirstRow?: boolean; // 跳过标题行
  updateExisting?: boolean; // 更新已存在的记录
  batchSize?: number;
  validateOnly?: boolean;
  createMissingCategories?: boolean;
  defaultValues?: Record<string, any>;
}

// 导入错误
export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  message: string;
  code: string;
}