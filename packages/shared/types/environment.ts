/**
 * Cloudflare Workers 环境变量类型定义
 * 提供完整的环境变量类型安全和验证
 */

// Cloudflare Workers ScheduledHandler 类型定义
export interface ScheduledHandler {
  scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext): void | Promise<void>;
}

export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

// 基础环境配置
export interface BaseEnvironment {
  // 应用基础配置
  ENVIRONMENT: 'development' | 'staging' | 'production';
  VERSION: string;
  DEBUG: string;

  // 站点配置
  SITE_URL: string;
  SITE_NAME: string;
  SITE_DESCRIPTION?: string;

  // 时区配置
  TIMEZONE: string;

  // 密钥配置
  JWT_SECRET: string;
  SESSION_SECRET?: string;

  // 数据库配置
  DATABASE_URL?: string;
  DATABASE_PRELOAD?: boolean;

  // 缓存配置
  CACHE_TTL?: string;
  CACHE_NAMESPACE?: string;

  // CORS配置
  CORS_ORIGIN?: string;
  CORS_CREDENTIALS?: string;

  // 日志配置
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_FORMAT?: 'json' | 'text';

  // 监控配置
  MONITORING_ENABLED?: string;
  METRICS_ENABLED?: string;
}

// Portfolio Worker 环境变量
export interface PortfolioEnvironment extends BaseEnvironment {
  // Portfolio 特定配置
  PORTFOLIO_TITLE: string;
  PORTFOLIO_DESCRIPTION: string;
  AUTHOR_NAME: string;
  AUTHOR_EMAIL: string;
  AUTHOR_GITHUB?: string;
  AUTHOR_TWITTER?: string;
  AUTHOR_LINKEDIN?: string;

  // 社交媒体配置
  SOCIAL_GITHUB?: string;
  SOCIAL_TWITTER?: string;
  SOCIAL_LINKEDIN?: string;
  SOCIAL_WEIBO?: string;
  SOCIAL_INSTAGRAM?: string;

  // 评论系统配置
  COMMENT_ENABLED?: string;
  COMMENT_MODERATION?: string;
  COMMENT_AUTO_APPROVE?: string;

  // 分析配置
  ANALYTICS_ENABLED?: string;
  GOOGLE_ANALYTICS_ID?: string;
  BAIDU_ANALYTICS_ID?: string;

  // 搜索配置
  SEARCH_ENABLED?: string;
  SEARCH_INDEX_SIZE?: string;

  // RSS配置
  RSS_ENABLED?: string;
  RSS_ITEM_COUNT?: string;

  // SEO配置
  SEO_DEFAULT_TITLE?: string;
  SEO_DEFAULT_DESCRIPTION?: string;
  SEO_DEFAULT_KEYWORDS?: string;
  SEO_OG_IMAGE?: string;

  // 主题配置
  THEME_COLOR?: string;
  THEME_MODE?: 'light' | 'dark' | 'auto';
  THEME_FONT_FAMILY?: string;

  // 功能开关
  FEATURE_BLOG?: string;
  FEATURE_PROJECTS?: string;
  FEATURE_COMMENTS?: string;
  FEATURE_ANALYTICS?: string;
  FEATURE_SEARCH?: string;
}

// Dashboard Worker 环境变量
export interface DashboardEnvironment extends BaseEnvironment {
  // Dashboard 特定配置
  ADMIN_EMAIL: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;

  // 上传配置
  UPLOAD_MAX_SIZE?: string;
  UPLOAD_ALLOWED_TYPES?: string;
  UPLOAD_BUCKET?: string;

  // 邮件配置
  EMAIL_SERVICE?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_FROM_NAME?: string;

  // 安全配置
  SECURITY_SESSION_TIMEOUT?: string;
  SECURITY_MAX_LOGIN_ATTEMPTS?: string;
  SECURITY_LOCKOUT_DURATION?: string;

  // 备份配置
  BACKUP_ENABLED?: string;
  BACKUP_SCHEDULE?: string;
  BACKUP_RETENTION?: string;

  // Webhook配置
  WEBHOOK_URL?: string;
  WEBHOOK_SECRET?: string;

  // 管理员配置
  ADMINS?: string; // 逗号分隔的管理员邮箱

  // 权限配置
  PERMISSIONS_ENABLED?: string;
  ROLE_BASED_ACCESS?: string;

  // 审核配置
  MODERATION_ENABLED?: string;
  AUTO_APPROVE_COMMENTS?: string;
  SPAM_FILTER_ENABLED?: string;

  // 速率限制配置
  RATE_LIMIT_ENABLED?: string;
  RATE_LIMIT_WINDOW?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;

  // 审计配置
  AUDIT_LOG_ENABLED?: string;
  AUDIT_LOG_RETENTION?: string;
}

// Cloudflare 特定服务类型
export interface CloudflareServices {
  // D1数据库
  DB: D1Database;
  SHARED_DB: D1Database;
  BACKUP_DB?: D1Database;

  // KV存储
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  SETTINGS: KVNamespace;
  ANALYTICS: KVNamespace;

  // R2存储
  UPLOADS: R2Bucket;
  ASSETS: R2Bucket;
  BACKUPS: R2Bucket;

  // Durable Objects
  CHAT_ROOM?: DurableObjectNamespace;
  COUNTER?: DurableObjectNamespace;

  // Queue
  EMAIL_QUEUE?: Queue;
  ANALYTICS_QUEUE?: Queue;

  // Cron Triggers
  CRON_BACKUP?: ScheduledHandler;
  CRON_CLEANUP?: ScheduledHandler;
  CRON_ANALYTICS?: ScheduledHandler;

  // WebAssembly
  WASM_MODULE?: WebAssembly.Module;

  // AI/ML
  AI_MODEL?: any;
}

// 完整的环境变量类型
export interface PortfolioEnv extends PortfolioEnvironment, CloudflareServices {}
export interface DashboardEnv extends DashboardEnvironment, CloudflareServices {}

// 环境变量验证配置
export interface EnvValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'json';
  pattern?: RegExp;
  min?: number;
  max?: number;
  enum?: string[];
  default?: any;
  transform?: (value: string) => any;
  validate?: (value: any) => boolean | string;
}

export interface EnvValidationSchema {
  [key: string]: EnvValidationRule;
}

// 预定义的验证规则
export const PortfolioEnvValidation: EnvValidationSchema = {
  // 基础配置
  ENVIRONMENT: {
    required: true,
    enum: ['development', 'staging', 'production']
  },
  VERSION: {
    required: true,
    type: 'string'
  },
  DEBUG: {
    required: false,
    type: 'boolean',
    transform: (value: string) => value === 'true'
  },

  // 站点配置
  SITE_URL: {
    required: true,
    type: 'url'
  },
  SITE_NAME: {
    required: true,
    type: 'string',
    min: 1,
    max: 100
  },

  // 必需的密钥
  JWT_SECRET: {
    required: true,
    type: 'string',
    min: 32
  },

  // 日志配置
  LOG_LEVEL: {
    required: false,
    enum: ['debug', 'info', 'warn', 'error'],
    default: 'info'
  },

  // Portfolio 特定
  PORTFOLIO_TITLE: {
    required: true,
    type: 'string',
    min: 1,
    max: 200
  },
  AUTHOR_NAME: {
    required: true,
    type: 'string',
    min: 1,
    max: 100
  },
  AUTHOR_EMAIL: {
    required: true,
    type: 'email'
  }
};

export const DashboardEnvValidation: EnvValidationSchema = {
  ...PortfolioEnvValidation,

  // Dashboard 特定
  ADMIN_EMAIL: {
    required: true,
    type: 'email'
  },

  // 上传配置
  UPLOAD_MAX_SIZE: {
    required: false,
    type: 'number',
    transform: (value: string) => parseInt(value),
    min: 1024,
    max: 104857600 // 100MB
  },

  // 安全配置
  SECURITY_SESSION_TIMEOUT: {
    required: false,
    type: 'number',
    transform: (value: string) => parseInt(value),
    min: 300, // 5分钟
    max: 86400 // 24小时
  }
};

// 环境变量验证结果
export interface EnvValidationResult {
  valid: boolean;
  errors: Array<{
    key: string;
    message: string;
    value?: any;
  }>;
  warnings: Array<{
    key: string;
    message: string;
    value?: any;
  }>;
}

// 环境变量工具函数
export interface EnvUtils {
  // 验证环境变量
  validate: (env: any, schema: EnvValidationSchema) => EnvValidationResult;

  // 获取环境变量，带默认值
  get: <T = string>(env: any, key: string, defaultValue?: T) => T;

  // 检查必需的环境变量
  checkRequired: (env: any, keys: string[]) => string[];

  // 转换布尔值
  getBoolean: (env: any, key: string, defaultValue?: boolean) => boolean;

  // 转换数字
  getNumber: (env: any, key: string, defaultValue?: number) => number;

  // 转换数组
  getArray: (env: any, key: string, separator?: string) => string[];

  // 获取JSON值
  getJSON: <T = any>(env: any, key: string, defaultValue?: T) => T;
}

// 运行时配置
export interface RuntimeConfig {
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  debug: boolean;
  version: string;
  siteUrl: URL;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  cache: {
    defaultTtl: number;
    namespace: string;
  };
  logging: {
    level: string;
    format: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
  };
}

// 特性开关配置
export interface FeatureFlags {
  blog: boolean;
  projects: boolean;
  comments: boolean;
  analytics: boolean;
  search: boolean;
  rss: boolean;
  moderation: boolean;
  backups: boolean;
  webhooks: boolean;
  rateLimit: boolean;
  auditLog: boolean;
}

// Environment 类型导出
export type Environment = DashboardEnv | PortfolioEnv;