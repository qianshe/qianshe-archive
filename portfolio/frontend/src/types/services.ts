// Portfolio展示端服务层类型定义

// HTTP请求配置类型
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  validateStatus?: (status: number) => boolean;
}

// HTTP响应类型
export interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// API错误类型
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// 服务类基础类型
export abstract class BaseApiService {
  protected config: RequestConfig;
  
  constructor(config: RequestConfig = {}) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status >= 200 && status < 300,
      ...config
    };
  }

  abstract request<T>(config: RequestConfig): Promise<Response<T>>;
}

// 缓存服务类型
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// 本地存储服务类型
export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  keys(): string[];
}

// 事件服务类型
export interface EventService {
  on<T>(event: string, handler: (data: T) => void): void;
  off<T>(event: string, handler: (data: T) => void): void;
  emit<T>(event: string, data: T): void;
  once<T>(event: string, handler: (data: T) => void): void;
}

// 日志服务类型
export interface LogService {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// 错误处理服务类型
export interface ErrorService {
  handleError(error: Error | unknown, context?: string): void;
  reportError(error: Error | unknown, context?: string): void;
  logError(error: Error | unknown, context?: string): void;
}

// 通知服务类型
export interface NotificationService {
  success(message: string, options?: NotificationOptions): void;
  error(message: string, options?: NotificationOptions): void;
  warning(message: string, options?: NotificationOptions): void;
  info(message: string, options?: NotificationOptions): void;
}

export interface NotificationOptions {
  duration?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 分析服务类型
export interface AnalyticsService {
  track(eventName: string, properties?: Record<string, unknown>): void;
  page(pageName: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  group(groupId: string, traits?: Record<string, unknown>): void;
  alias(alias: string, original?: string): void;
}

// 主题服务类型
export interface ThemeService {
  getCurrentTheme(): string;
  setTheme(theme: string): void;
  toggleTheme(): void;
  getAvailableThemes(): string[];
  subscribe(callback: (theme: string) => void): () => void;
}

// 国际化服务类型
export interface I18nService {
  t(key: string, options?: Record<string, unknown>): string;
  setLocale(locale: string): void;
  getLocale(): string;
  getAvailableLocales(): string[];
  formatDate(date: Date | string, format?: string): string;
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string;
  formatCurrency(amount: number, currency: string): string;
}

// 权限服务类型
export interface PermissionService {
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  hasAllPermissions(permissions: string[]): boolean;
  can(action: string, resource: string): boolean;
}

// 认证服务类型
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

// 文件服务类型
export interface FileService {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>;
  download(url: string, filename?: string): Promise<void>;
  delete(fileId: string): Promise<void>;
  getFileInfo(fileId: string): Promise<FileInfo>;
  getFileUrl(fileId: string): string;
}

export interface UploadOptions {
  path?: string;
  isPublic?: boolean;
  metadata?: Record<string, unknown>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  fileId: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  path: string;
  isPublic: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// 搜索服务类型
export interface SearchService {
  search(query: SearchQuery): Promise<SearchResult>;
  getSuggestions(query: string, limit?: number): Promise<string[]>;
  getPopularSearches(limit?: number): Promise<string[]>;
  saveSearch(query: string): void;
  getRecentSearches(limit?: number): Promise<string[]>;
  clearRecentSearches(): void;
}

export interface SearchQuery {
  query: string;
  type?: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: SearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
}

export interface SearchItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  score?: number;
  highlights?: Record<string, string[]>;
  metadata?: Record<string, unknown>;
}