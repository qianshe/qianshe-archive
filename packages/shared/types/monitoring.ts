/**
 * 监控系统类型定义
 * 提供完整的性能监控、错误追踪和系统健康检查类型
 */

// 基础指标类型
export interface MetricValue {
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  context?: Record<string, any>;
}

// 错误追踪类型
export interface ErrorMetric {
  id: string;
  message: string;
  stack?: string;
  type: string;
  url: string;
  method: string;
  statusCode?: number;
  userId?: number;
  sessionId?: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
  tags?: Record<string, string>;
  context?: Record<string, any>;
  fingerprint?: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  resolved: boolean;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
}

export interface ErrorGroup {
  fingerprint: string;
  message: string;
  type: string;
  level: string;
  occurrences: number;
  uniqueUsers: number;
  affectedUrls: string[];
  firstSeen: number;
  lastSeen: number;
  resolved: boolean;
  assignedTo?: string;
  tags: Record<string, number>; // tag -> count
}

// 请求指标类型
export interface RequestMetric {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userId?: number;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'bot';
  browser?: string;
  os?: string;
  cacheHit?: boolean;
  cacheStatus?: string;
  dbQueries?: number;
  dbTime?: number;
  upstreamTime?: number;
  contentLength?: number;
  protocol?: string;
  tlsVersion?: string;
  tags?: Record<string, string>;
  endpoint?: string;
  route?: string;
}

// 系统资源指标
export interface SystemMetric {
  timestamp: number;
  cpuUsage?: {
    user: number;
    system: number;
    idle: number;
    total: number;
  };
  memoryUsage?: {
    used: number;
    available: number;
    total: number;
    percentage: number;
  };
  diskUsage?: {
    used: number;
    available: number;
    total: number;
    percentage: number;
  };
  network?: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
    activeConnections: number;
  };
  workers?: {
    active: number;
    idle: number;
    total: number;
  };
  kv?: {
    reads: number;
    writes: number;
    deletes: number;
    errors: number;
    readUnits: number;
    writeUnits: number;
  };
  d1?: {
    queries: number;
    errors: number;
    readUnits: number;
    writeUnits: number;
    storageUsed: number;
  };
  r2?: {
    reads: number;
    writes: number;
    deletes: number;
    bytesIn: number;
    bytesOut: number;
    storageUsed: number;
    objectCount: number;
  };
}

// 用户会话指标
export interface SessionMetric {
  sessionId: string;
  userId?: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  bounce: boolean;
  conversion?: boolean;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  exitPage?: string;
  entryPage?: string;
  events: SessionEvent[];
}

export interface SessionEvent {
  type: string;
  name: string;
  timestamp: number;
  data?: Record<string, any>;
  page?: string;
  duration?: number;
}

// 业务指标
export interface BusinessMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  period?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
  tags?: Record<string, string>;
  segment?: string;
  conversion?: boolean;
  revenue?: number;
}

// 告警规则类型
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  threshold: number;
  duration: number; // 持续时间（毫秒）
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
  filters?: Record<string, any>;
  notifications: NotificationConfig[];
  cooldown: number; // 冷却时间（毫秒）
}

export interface NotificationConfig {
  type: 'email' | 'webhook' | 'slack' | 'sms' | 'pagerduty';
  enabled: boolean;
  config: Record<string, any>;
  template?: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  status: 'firing' | 'resolved';
  message: string;
  value: number;
  threshold: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  url?: string;
  tags?: Record<string, string>;
  notificationsSent: number;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

// 仪表板数据类型
export interface DashboardOverview {
  timestamp: number;
  timeRange: number;
  metrics: {
    requests: {
      total: number;
      success: number;
      error: number;
      avgResponseTime: number;
      p95ResponseTime: number;
      p99ResponseTime: number;
      rate: number; // 每秒请求数
    };
    users: {
      active: number;
      new: number;
      returning: number;
      unique: number;
    };
    errors: {
      total: number;
      uniqueErrors: number;
      errorRate: number;
      topErrors: ErrorGroup[];
    };
    performance: {
      avgResponseTime: number;
      p95ResponseTime: number;
      p99ResponseTime: number;
      throughput: number;
      availability: number;
    };
    system: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkIO: number;
    };
  };
  alerts: Alert[];
  trends: {
    requests: MetricValue[];
    responseTime: MetricValue[];
    errorRate: MetricValue[];
    activeUsers: MetricValue[];
  };
}

// 性能报告类型
export interface PerformanceReport {
  id: string;
  period: {
    start: number;
    end: number;
    type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  };
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    availability: number;
    throughput: number;
  };
  endpoints: EndpointPerformance[];
  errors: ErrorSummary[];
  trends: PerformanceTrend[];
  recommendations: string[];
}

export interface EndpointPerformance {
  path: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number;
  slowestRequests: SlowRequest[];
}

export interface SlowRequest {
  url: string;
  method: string;
  responseTime: number;
  timestamp: number;
  statusCode: number;
  userId?: number;
}

export interface ErrorSummary {
  message: string;
  type: string;
  count: number;
  percentage: number;
  firstSeen: number;
  lastSeen: number;
  affectedUsers: number;
  affectedEndpoints: string[];
}

export interface PerformanceTrend {
  metric: string;
  data: MetricValue[];
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

// 健康检查类型
export interface HealthCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  duration: number;
  timestamp: number;
  output?: string;
  observations?: HealthObservation[];
  links?: HealthLink[];
}

export interface HealthObservation {
  key: string;
  value: any;
  unit?: string;
  status?: 'pass' | 'warn' | 'fail';
}

export interface HealthLink {
  href: string;
  rel: string;
  type?: string;
}

export interface HealthReport {
  status: 'pass' | 'warn' | 'fail';
  timestamp: string;
  duration: number;
  version: string;
  uptime: number;
  checks: Record<string, HealthCheck>;
  dependencies: DependencyHealth[];
  metrics: HealthMetrics;
}

export interface DependencyHealth {
  name: string;
  type: 'database' | 'kv' | 'r2' | 'queue' | 'api' | 'service';
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface HealthMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    avgResponseTime: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
  };
  business: {
    activeUsers: number;
    conversions: number;
    revenue: number;
  };
}

// 数据导出类型
export interface MonitoringExport {
  format: 'json' | 'csv' | 'parquet';
  timeRange: {
    start: number;
    end: number;
  };
  filters?: ExportFilter[];
  metrics?: string[];
  includeRawData?: boolean;
  includeAggregations?: boolean;
}

export interface ExportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}

export interface ExportResult {
  id: string;
  format: string;
  size: number;
  records: number;
  url?: string;
  expiresAt?: number;
  createdAt: number;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
}

// 监控配置类型
export interface MonitoringConfig {
  enabled: boolean;
  retention: {
    metrics: number; // 天
    errors: number; // 天
    requests: number; // 天
    sessions: number; // 天
  };
  sampling: {
    requests: number; // 采样率 0-1
    errors: number; // 采样率 0-1
    metrics: number; // 采样率 0-1
  };
  alerts: {
    enabled: boolean;
    rules: AlertRule[];
  };
  dashboards: {
    enabled: boolean;
    refreshInterval: number; // 毫秒
    defaultTimeRange: number; // 毫秒
  };
  export: {
    enabled: boolean;
    formats: string[];
    maxExportSize: number; // 字节
  };
  privacy: {
    anonymizeIp: boolean;
    anonymizeUserAgent: boolean;
    excludeSensitiveData: boolean;
    dataRetentionDays: number;
  };
}

// 监控服务接口
export interface MonitoringService {
  // 指标记录
  recordMetric(name: string, value: number, unit?: string, tags?: Record<string, string>): void;
  recordRequest(metric: Omit<RequestMetric, 'id'>): void;
  recordError(error: Omit<ErrorMetric, 'id' | 'fingerprint' | 'occurrences' | 'firstSeen' | 'lastSeen'>): void;
  recordSystemMetrics(metrics: Omit<SystemMetric, 'timestamp'>): void;
  recordBusinessMetric(metric: BusinessMetric): void;

  // 数据查询
  getMetrics(name: string, timeRange: number, tags?: Record<string, string>): Promise<PerformanceMetric[]>;
  getRequests(timeRange: number, filters?: Partial<RequestMetric>): Promise<RequestMetric[]>;
  getErrors(timeRange: number, filters?: Partial<ErrorMetric>): Promise<ErrorMetric[]>;
  getSystemMetrics(timeRange: number): Promise<SystemMetric[]>;

  // 分析功能
  getDashboardOverview(timeRange: number): Promise<DashboardOverview>;
  getPerformanceReport(period: string): Promise<PerformanceReport>;
  getHealthReport(): Promise<HealthReport>;
  getTopErrors(timeRange: number, limit?: number): Promise<ErrorGroup[]>;

  // 告警管理
  createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<string>;
  updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<void>;
  deleteAlertRule(id: string): Promise<void>;
  getAlertRules(): Promise<AlertRule[]>;
  getAlerts(status?: string): Promise<Alert[]>;

  // 数据导出
  createExport(exportConfig: MonitoringExport): Promise<string>;
  getExportStatus(id: string): Promise<ExportResult>;

  // 配置管理
  getConfig(): MonitoringConfig;
  updateConfig(config: Partial<MonitoringConfig>): Promise<void>;

  // 数据清理
  cleanup(retentionDays?: number): Promise<void>;

  // 健康检查
  healthCheck(): Promise<HealthCheck>;
}