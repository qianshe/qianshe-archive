/**
 * 谦舍项目共享类型定义
 * 统一导出所有类型定义，供前端和后端使用
 */

// =============================================================================
// 核心类型模块
// =============================================================================

// API 相关类型
export * from './api';

// API 客户端类型
export * from './api-client';

// 博客相关类型
export * from './blog';

// 项目相关类型
export * from './project';

// 用户认证类型
export * from './auth';

// 数据库操作类型
export * from './database';

// 监控系统类型
export * from './monitoring';

// 环境变量类型
export * from './environment';

// 通用工具类型
export * from './utils';

// 缓存系统类型
export * from './cache';

// Workers API 类型
export * from './workers';

// =============================================================================
// 扩展类型模块
// =============================================================================

// 图表组件类型
export * from './charts';

// 扩展分析系统类型
export * from './analytics-extended';

// 文件上传和处理类型
export * from './file-upload';

// 业务领域专用类型
export * from './business-domain';

// 类型验证工具
export * from './validation';

// =============================================================================
// 类型命名空间
// =============================================================================

// 为了更好的类型组织和使用体验，我们提供了一些命名空间导出
export namespace QiansheTypes {
  // 核心业务领域
  export namespace User {
    export type Complete = import('./business-domain').UserComplete;
    export type Profile = import('./business-domain').UserProfile;
    export type Preferences = import('./business-domain').UserPreferences;
    export type Activity = import('./business-domain').UserActivity;
    export type Statistics = import('./business-domain').UserStatistics;
  }

  export namespace Content {
    export type Post = import('./business-domain').Post;
    export type Project = import('./business-domain').Project;
    export type Comment = import('./business-domain').Comment;
    export type Media = import('./business-domain').MediaFile;
    export type Analytics = import('./business-domain').ContentAnalytics;
  }

  export namespace Analytics {
    export type Basic = import('./models').AnalyticsMetric;
    export type Extended = import('./analytics-extended').AnalyticsValue;
    export type Monitoring = import('./monitoring').PerformanceMetric;
    export type RealTime = import('./analytics-extended').RealTimeAnalytics;
    export type Report = import('./analytics-extended').AnalyticsReport;
  }

  export namespace File {
    export type Info = import('./file-upload').FileInfo;
    export type Upload = import('./file-upload').UploadRequest;
    export type Processing = import('./file-upload').ProcessingTask;
    export type Storage = import('./file-upload').StorageInfo;
    export type Share = import('./file-upload').FileShare;
  }

  export namespace Chart {
    export type Line = import('./charts').CustomLineChartProps;
    export type Bar = import('./charts').CustomBarChartProps;
    export type Pie = import('./charts').CustomPieChartProps;
    export type Area = import('./charts').CustomAreaChartProps;
    export type Scatter = import('./charts').CustomScatterChartProps;
    export type Radar = import('./charts').CustomRadarChartProps;
    export type Theme = import('./charts').ChartTheme;
  }

  export namespace API {
    export type Response = import('./api').ApiResponse;
    export type Request = import('./api').ApiRequestConfig;
    export type Client = import('./api-client').BaseApiClient;
    export type Validation = import('./validation').ValidationResult;
  }

  export namespace System {
    export type Monitoring = import('./monitoring').MonitoringService;
    export type Health = import('./monitoring').HealthReport;
    export type Environment = import('./environment').EnvironmentConfig;
    export type Cache = import('./cache').CacheConfig;
  }
}

// =============================================================================
// 常用类型快捷方式
// =============================================================================

// 常用的基础类型组合
export type ID = string | number;
export type Timestamp = number;
export type ISOString = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue; }
export interface JSONArray extends Array<JSONValue> {}

// 常用的状态类型
export type Status = 'pending' | 'loading' | 'success' | 'error' | 'idle';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Visibility = 'public' | 'private' | 'unlisted';

// 常用的响应类型
export type SuccessResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
  timestamp: number;
};

export type ErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: number;
};

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// 常用的分页类型
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedResponse<T> = SuccessResponse<{
  items: T[];
  pagination: Pagination;
}>;

// 常用的搜索类型
export type SearchParams = {
  query: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
};

export type SearchResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  suggestions?: string[];
  searchTime: number;
};

// =============================================================================
// 类型守卫函数
// =============================================================================

// 常用的类型守卫
export function isSuccessResponse<T>(response: APIResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

export function isErrorResponse<T>(response: APIResponse<T>): response is ErrorResponse {
  return response.success === false;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

// =============================================================================
// 工具类型别名
// =============================================================================

// 为了提高开发效率，提供一些常用的类型别名
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 常用的回调类型
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// 常用的工厂类型
export type Factory<T> = (...args: any[]) => T;
export type AsyncFactory<T> = (...args: any[]) => Promise<T>;

// 常用的配置类型
export type Config<T = Record<string, any>> = T;
export type PartialConfig<T = Record<string, any>> = Partial<T>;

// =============================================================================
// 版本信息
// =============================================================================

export const TYPES_VERSION = '2.0.0';
export const TYPES_BUILD_DATE = new Date().toISOString();
export const TYPES_COMPATIBILITY = {
  minNodeVersion: '18.0.0',
  minTypeScriptVersion: '5.0.0',
  supportedFrameworks: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js']
} as const;

// =============================================================================
// 使用示例
// =============================================================================

/*
使用示例：

// 基础类型使用
import type { User, Post, Comment, APIResponse } from './types';

// 命名空间使用
import { QiansheTypes } from './types';
type UserProfile = QiansheTypes.User.Profile;
type PostAnalytics = QiansheTypes.Content.Analytics;

// 图表类型使用
import type { CustomLineChartProps, ChartTheme } from './types';

// 文件上传类型使用
import type { UploadRequest, FileInfo } from './types';

// API响应使用
const handleResponse = <T>(response: APIResponse<T>) => {
  if (isSuccessResponse(response)) {
    // 处理成功响应
    console.log(response.data);
  } else {
    // 处理错误响应
    console.error(response.error);
  }
};

// 分页响应使用
const fetchPosts = async (params: SearchParams): Promise<PaginatedResponse<Post>> => {
  const response = await api.get('/posts', { params });
  return response.data;
};

// 类型守卫使用
const processValue = (value: unknown) => {
  if (isString(value)) {
    // 字符串处理
  } else if (isNumber(value)) {
    // 数字处理
  } else if (isObject(value)) {
    // 对象处理
  }
};
*/