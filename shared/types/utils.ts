/**
 * 通用工具类型定义
 */

// 基础工具类型
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 数组工具类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type ArrayToUnion<T> = T extends Array<infer U> ? U : never;
export type Length<T> = T extends { length: infer L } ? L : never;
export type Reverse<T> = T extends [...infer Rest, infer Last] ? [Last, ...Reverse<Rest>] : [];
export type Append<T, U> = T extends [...infer Rest] ? [...Rest, U] : never;

// 字符串工具类型
export type Capitalize<T> = T extends `${infer First}${infer Rest}` 
  ? `${Uppercase<First>}${Rest}` 
  : T;
export type Uncapitalize<T> = T extends `${infer First}${infer Rest}` 
  ? `${Lowercase<First>}${Rest}` 
  : T;
export type TitleCase<T> = T extends `${infer First}${infer Rest}` 
  ? `${Capitalize<First>}${TitleCase<Rest>}` 
  : T;

// 对象工具类型
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type ValuesOfType<T, U> = T[KeysOfType<T, U>];
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

// 函数工具类型
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type Arguments<T> = T extends (...args: infer P) => any ? P : never;

// 条件类型
export type If<C, T, F> = C extends true ? T : F;
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsUnknown<T> = unknown extends T ? true : false;
export type IsAny<T> = 0 extends 1 & T ? true : false;

// 联合类型工具
export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;
export type UnionToArray<T, L = LastOf<T>> = [T] extends [never] ? [] : [...UnionToArray<Exclude<T, L>>, L];

// 数字类型
export type Add<A extends number, B extends number> = [...Tuple<A>, ...Tuple<B>]['length'] extends number 
  ? [...Tuple<A>, ...Tuple<B>]['length'] 
  : never;
export type Subtract<A extends number, B extends number> = Tuple<A> extends [...infer Rest, ...Tuple<B>] 
  ? Rest['length'] 
  : never;
export type Multiply<A extends number, B extends number> = Tuple<B> extends [infer First, ...infer Rest] 
  ? First extends 0 
    ? 0 
    : Add<Multiply<A, Rest['length'] extends number ? Rest['length'] : never>, A> 
  : 0;
export type Tuple<T extends number, R extends readonly unknown[] = []> = R['length'] extends T 
  ? R 
  : Tuple<T, [...R, unknown]>;

// 日期时间类型
export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // YYYY-MM-DDTHH:mm:ss.sssZ
export type Timestamp = number; // Unix timestamp in seconds or milliseconds
export type DateString = string; // Human readable date format

// ID类型
export type ID = string | number;
export type UUID = string; // UUID v4 format
export type Slug = string; // URL-friendly slug

// 分页类型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 排序类型
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// 过滤类型
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike' | 'contains';
  value: any;
}

// 搜索类型
export interface Search {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  limit?: number;
}

// 验证类型
export interface ValidationRule<T = any> {
  name: string;
  validator: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

// 响应包装类型
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// 缓存类型
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  staleWhileRevalidate?: boolean;
  revalidateOnFocus?: boolean;
}

// 重试类型
export interface RetryOptions {
  attempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
}

// 防抖/节流类型
export interface DebounceOptions {
  delay: number;
  immediate?: boolean;
}

export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

// 事件类型
export interface Event<T = any> {
  type: string;
  data: T;
  timestamp: number;
  id?: string;
}

export interface EventHandler<T = any> {
  (event: Event<T>): void | Promise<void>;
}

export interface EventEmitter {
  on<T = any>(event: string, handler: EventHandler<T>): void;
  off<T = any>(event: string, handler: EventHandler<T>): void;
  emit<T = any>(event: string, data: T): void;
}

// 环境类型
export type Environment = 'development' | 'staging' | 'production' | 'test';

// 日志级别类型
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

// HTTP 方法类型
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// 状态类型
export type Status = 'pending' | 'loading' | 'success' | 'error' | 'idle';

// 键值对类型
export type KeyValue<T = any> = Record<string, T>;

// 异步状态类型
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// 可选配置类型
export interface Config {
  [key: string]: any;
}

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 语言类型
export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'ru' | 'pt' | 'it';

// 货币类型
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'INR' | 'BRL' | 'RUB' | 'CAD';

// 尺寸类型
export interface Size {
  width: number;
  height: number;
}

// 位置类型
export interface Position {
  x: number;
  y: number;
}

// 地理位置类型
export interface GeoPosition extends Position {
  latitude: number;
  longitude: number;
}

// 文件类型
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
}

// 版本类型
export type Version = `${number}.${number}.${number}` | `${number}.${number}` | string;

// 范围类型
export interface Range<T = number> {
  start: T;
  end: T;
  inclusive?: boolean;
}

// 区间类型
export interface Interval<T = number> {
  min: T;
  max: T;
}

// 百分比类型
export type Percentage = number; // 0-100

// 颜色类型
export type Color = string; // hex, rgb, rgba, hsl, hsla, named color

// URL 类型
export type URL = string;

// Email 类型
export type Email = string;

// Phone 类型
export type Phone = string;

// IP 地址类型
export type IP = string; // IPv4 or IPv6

// MAC 地址类型
export type MAC = string; // MAC address format

// 用户代理类型
export type UserAgent = string;