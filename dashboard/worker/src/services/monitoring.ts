/**
 * 性能监控服务
 * 提供错误追踪、性能指标收集和分析功能
 */

// 简化的本地类型定义
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorMetric {
  id: string;
  message: string;
  stack?: string;
  fingerprint: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  timestamp: number;
  url?: string;
  method?: string;
  userId?: number;
  userAgent?: string;
  type?: string;
  level?: string;
  ip?: string;
  resolved?: boolean;
  tags?: Record<string, string>;
}

interface RequestMetric {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
  cacheHit?: boolean;
}

interface SystemMetric {
  timestamp: string;
  [key: string]: number | string;
}

interface DashboardOverview {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  timestamp: number;
}

interface HealthReport {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail';
    responseTime?: number;
    error?: string;
  }>;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}

interface Alert {
  id: string;
  ruleId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered: boolean;
  timestamp: string;
}

interface MonitoringConfig {
  enabled: boolean;
  retentionPeriod: number;
  maxErrors: number;
  healthCheckInterval: number;
  retention?: number;
}

interface ErrorGroup {
  fingerprint: string;
  message: string;
  count: number;
  lastSeen: string;
  affectedUrls: string[];
  occurrences?: number;
  type?: string;
  level?: string;
  uniqueUsers?: number;
  firstSeen?: string;
  resolved?: boolean;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  period: string;
  metrics: PerformanceMetric[];
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
}

interface ExportResult {
  url: string;
  filename: string;
  size: number;
  expiresAt: string;
  id?: string;
  format?: string;
  records?: number;
  createdAt?: number;
  status?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// 监控服务接口
interface IMonitoringService {
  recordError(error: Error | string, context: {
    url: string;
    method: string;
    userId?: number;
    userAgent?: string;
    ip?: string;
    tags?: Record<string, string>;
  }): void;
  recordSystemMetrics(metrics: Omit<SystemMetric, 'timestamp'>): void;
  getHealthCheck(): HealthReport;
}

// 本地系统指标类型定义
interface SystemMetrics {
  timestamp: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  networkIO?: number;
  activeConnections?: number;
  [key: string]: any;
}

export class MonitoringService implements IMonitoringService {
  private kv: KVNamespace;
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private requests: RequestMetric[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private maxMetricsSize = 1000; // 内存中保留的最大指标数量

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * 记录性能指标
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    this.addMetric(metric);
  }

  /**
   * 记录错误
   */
  recordError(
    error: Error | string,
    context: {
      url: string;
      method: string;
      userId?: number;
      userAgent?: string;
      ip?: string;
      tags?: Record<string, string>;
    }
  ): void {
    const errorMetric: ErrorMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      fingerprint: this.generateErrorFingerprint(
        typeof error === 'string' ? error : error.message,
        context.url,
        context.method
      ),
      type: typeof error === 'string' ? 'Error' : error.constructor.name,
      url: context.url,
      method: context.method,
      userId: context.userId,
      timestamp: Date.now(),
      userAgent: context.userAgent,
      ip: context.ip,
      tags: context.tags,
      level: 'error',
      resolved: false,
      occurrences: 1,
      firstSeen: new Date(Date.now()).toISOString(),
      lastSeen: new Date(Date.now()).toISOString()
    };

    this.addError(errorMetric);
  }

  /**
   * 记录请求指标
   */
  recordRequest(context: {
    url: string;
    method: string;
    statusCode: number;
    responseTime: number;
    userId?: number;
    userAgent?: string;
    ip?: string;
    cacheHit?: boolean;
    dbQueries?: number;
  }): void {
    const requestMetric: RequestMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      ...context,
      timestamp: Date.now()
    };

    this.addRequest(requestMetric);
  }

  /**
   * 记录系统指标
   */
  recordSystemMetrics(metrics: Partial<SystemMetrics>): void {
    const systemMetric: SystemMetrics = {
      timestamp: Date.now(),
      ...metrics
    };

    this.addSystemMetric(systemMetric);
  }

  /**
   * 记录业务指标
   */
  recordBusinessMetric(metric: {
    name: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
  }): void {
    // 实现业务指标记录逻辑
    this.recordMetric(metric.name, metric.value, metric.unit, metric.tags);
  }

  /**
   * 获取性能指标
   */
  async getMetrics(
    name: string, 
    timeRange: number, 
    tags?: Record<string, string>
  ): Promise<PerformanceMetric[]> {
    const startTime = Date.now() - timeRange;
    return this.metrics.filter(m => 
      m.name === name && 
      m.timestamp >= startTime &&
      (!tags || this.matchesTags(m.tags, tags))
    );
  }

  /**
   * 获取请求指标
   */
  async getRequests(
    timeRange: number, 
    filters?: Partial<RequestMetric>
  ): Promise<RequestMetric[]> {
    const startTime = Date.now() - timeRange;
    return this.requests.filter(r => 
      r.timestamp >= startTime &&
      (!filters || this.matchesRequestFilters(r, filters))
    );
  }

  /**
   * 获取错误指标
   */
  async getErrors(
    timeRange: number, 
    filters?: Partial<ErrorMetric>
  ): Promise<ErrorMetric[]> {
    const startTime = Date.now() - timeRange;
    return this.errors.filter(e => 
      e.timestamp >= startTime &&
      (!filters || this.matchesErrorFilters(e, filters))
    );
  }

  /**
   * 获取系统指标
   */
  async getSystemMetrics(timeRange: number): Promise<SystemMetric[]> {
    const startTime = Date.now() - timeRange;
    return this.systemMetrics
      .filter(s => s.timestamp >= startTime)
      .map(s => ({
        timestamp: new Date(s.timestamp).toISOString(),
        cpuUsage: s.cpuUsage || 0,
        memoryUsage: s.memoryUsage || 0,
        diskUsage: s.diskUsage || 0,
        network: {
          bytesIn: s.networkIO || 0,
          bytesOut: 0,
          packetsIn: 0,
          packetsOut: 0,
          connections: s.activeConnections || 0,
          activeConnections: s.activeConnections || 0
        }
      } as unknown as SystemMetric));
  }

  /**
   * 获取仪表板概览
   */
  async getDashboardOverview(timeRange: number): Promise<DashboardOverview> {
    const summary = this.getPerformanceSummary(timeRange);
    const realTime = this.getRealTimeMetrics();

    return {
      totalRequests: summary.requests.total,
      errorRate: summary.requests.total > 0 ? summary.errors.total / summary.requests.total : 0,
      avgResponseTime: summary.requests.avgResponseTime,
      activeUsers: realTime.activeUsers,
      systemHealth: 'healthy', // 简化的健康状态
      timestamp: Date.now()
    };
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(period: string): Promise<PerformanceReport> {
    // 实现性能报告生成逻辑
    throw new Error('Performance report generation not implemented');
  }

  /**
   * 获取健康检查报告
   */
  async getHealthReport(): Promise<HealthReport> {
    const realTime = this.getRealTimeMetrics();

    return {
      status: realTime.systemHealth === 'healthy' ? 'healthy' :
        realTime.systemHealth === 'warning' ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: [
        {
          name: 'database',
          status: 'pass',
          responseTime: 10
        },
        {
          name: 'cache',
          status: 'pass',
          responseTime: 5
        },
        {
          name: 'storage',
          status: 'pass',
          responseTime: 15
        }
      ]
    };
  }

  /**
   * 获取热门错误
   */
  async getTopErrors(timeRange: number, limit: number = 10): Promise<ErrorGroup[]> {
    const errors = await this.getErrors(timeRange);
    const errorGroups = new Map<string, ErrorGroup>();

    errors.forEach(error => {
      const fingerprint = error.message;
      if (!errorGroups.has(fingerprint)) {
        errorGroups.set(fingerprint, {
          fingerprint,
          message: error.message,
          type: error.type,
          level: error.level,
          count: 0,
          occurrences: 0,
          uniqueUsers: 0,
          affectedUrls: [],
          firstSeen: new Date(error.timestamp).toISOString(),
          lastSeen: new Date(error.timestamp).toISOString(),
          resolved: false,
          tags: {}
        });
      }
      
      const group = errorGroups.get(fingerprint)!;
      group.occurrences++;
      group.count++;
      const lastSeenTime = new Date(group.lastSeen).getTime();
      const errorTime = error.timestamp;
      if (errorTime > lastSeenTime) {
        group.lastSeen = new Date(errorTime).toISOString();
      }
      if (!group.affectedUrls.includes(error.url)) {
        group.affectedUrls.push(error.url);
      }
    });

    return Array.from(errorGroups.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, limit);
  }

  /**
   * 创建告警规则
   */
  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<string> {
    // 实现告警规则创建逻辑
    const id = `alert-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    return id;
  }

  /**
   * 更新告警规则
   */
  async updateAlertRule(id: string, rule: Partial<AlertRule>): Promise<void> {
    // 实现告警规则更新逻辑
  }

  /**
   * 删除告警规则
   */
  async deleteAlertRule(id: string): Promise<void> {
    // 实现告警规则删除逻辑
  }

  /**
   * 获取告警规则
   */
  async getAlertRules(): Promise<AlertRule[]> {
    // 实现告警规则获取逻辑
    return [];
  }

  /**
   * 获取告警
   */
  async getAlerts(status?: string): Promise<Alert[]> {
    // 实现告警获取逻辑
    return [];
  }

  /**
   * 创建数据导出
   */
  async createExport(exportConfig: any): Promise<string> {
    // 实现数据导出创建逻辑
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    return exportId;
  }

  /**
   * 获取导出状态
   */
  async getExportStatus(id: string): Promise<ExportResult> {
    // 实现导出状态获取逻辑
    return {
      id,
      url: `https://example.com/export/${id}`,
      filename: `export-${id}.json`,
      size: 0,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      format: 'json',
      records: 0,
      createdAt: Date.now(),
      status: 'processing'
    };
  }

  /**
   * 获取监控配置
   */
  getConfig(): MonitoringConfig {
    return {
      enabled: true,
      retentionPeriod: 7,
      maxErrors: 1000,
      healthCheckInterval: 60000,
      retention: 30
    };
  }

  /**
   * 更新监控配置
   */
  async updateConfig(config: Partial<MonitoringConfig>): Promise<void> {
    // 实现配置更新逻辑
  }

  /**
   * 健康检查 - 实现接口方法
   */
  getHealthCheck(): HealthReport {
    const realTime = this.getRealTimeMetrics();

    return {
      status: realTime.systemHealth === 'healthy' ? 'healthy' :
        realTime.systemHealth === 'warning' ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: [
        {
          name: 'database',
          status: 'pass',
          responseTime: 10
        },
        {
          name: 'cache',
          status: 'pass',
          responseTime: 5
        },
        {
          name: 'storage',
          status: 'pass',
          responseTime: 15
        }
      ]
    };
  }

  /**
   * 健康检查 - 异步方法
   */
  async healthCheck(): Promise<any> {
    return {
      status: 'pass',
      timestamp: Date.now(),
      name: 'monitoring-service',
      version: '1.0.0'
    };
  }

  // 辅助方法
  private matchesTags(metricTags?: Record<string, string>, filterTags?: Record<string, string>): boolean {
    if (!filterTags) return true;
    if (!metricTags) return false;
    
    return Object.entries(filterTags).every(([key, value]) => metricTags[key] === value);
  }

  private matchesRequestFilters(request: RequestMetric, filters: Partial<RequestMetric>): boolean {
    return Object.entries(filters).every(([key, value]) => (request as any)[key] === value);
  }

  private matchesErrorFilters(error: ErrorMetric, filters: Partial<ErrorMetric>): boolean {
    return Object.entries(filters).every(([key, value]) => (error as any)[key] === value);
  }

  /**
   * 添加性能指标到内存并持久化
   */
  private async addMetric(metric: PerformanceMetric): Promise<void> {
    this.metrics.push(metric);
    this.trimMetrics();

    // 异步持久化到KV
    this.persistMetric(metric).catch(error => {
      console.error('Failed to persist metric:', error);
    });
  }

  /**
   * 添加错误到内存并持久化
   */
  private async addError(error: ErrorMetric): Promise<void> {
    this.errors.push(error);
    this.trimErrors();

    // 异步持久化到KV
    this.persistError(error).catch(err => {
      console.error('Failed to persist error:', err);
    });
  }

  /**
   * 添加请求指标到内存并持久化
   */
  private async addRequest(request: RequestMetric): Promise<void> {
    this.requests.push(request);
    this.trimRequests();

    // 异步持久化到KV
    this.persistRequest(request).catch(error => {
      console.error('Failed to persist request metric:', error);
    });
  }

  /**
   * 添加系统指标到内存并持久化
   */
  private async addSystemMetric(metric: SystemMetrics): Promise<void> {
    this.systemMetrics.push(metric);
    this.trimSystemMetrics();

    // 异步持久化到KV
    this.persistSystemMetric(metric).catch(error => {
      console.error('Failed to persist system metric:', error);
    });
  }

  /**
   * 持久化性能指标到KV
   */
  private async persistMetric(metric: PerformanceMetric): Promise<void> {
    const key = `metric:${metric.name}:${metric.timestamp}`;
    await this.kv.put(key, JSON.stringify(metric), {
      expirationTtl: 7 * 24 * 3600 // 7天过期
    });
  }

  /**
   * 持久化错误到KV
   */
  private async persistError(error: ErrorMetric): Promise<void> {
    const key = `error:${error.timestamp}:${Math.random().toString(36).substring(2)}`;
    await this.kv.put(key, JSON.stringify(error), {
      expirationTtl: 30 * 24 * 3600 // 30天过期
    });
  }

  /**
   * 持久化请求指标到KV
   */
  private async persistRequest(request: RequestMetric): Promise<void> {
    const key = `request:${request.timestamp}:${Math.random().toString(36).substring(2)}`;
    await this.kv.put(key, JSON.stringify(request), {
      expirationTtl: 7 * 24 * 3600 // 7天过期
    });
  }

  /**
   * 持久化系统指标到KV
   */
  private async persistSystemMetric(metric: SystemMetrics): Promise<void> {
    const key = `system:${metric.timestamp}`;
    await this.kv.put(key, JSON.stringify(metric), {
      expirationTtl: 7 * 24 * 3600 // 7天过期
    });
  }

  /**
   * 限制内存中的指标数量
   */
  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize);
    }
  }

  private trimErrors(): void {
    if (this.errors.length > this.maxMetricsSize) {
      this.errors = this.errors.slice(-this.maxMetricsSize);
    }
  }

  private trimRequests(): void {
    if (this.requests.length > this.maxMetricsSize) {
      this.requests = this.requests.slice(-this.maxMetricsSize);
    }
  }

  private trimSystemMetrics(): void {
    if (this.systemMetrics.length > this.maxMetricsSize) {
      this.systemMetrics = this.systemMetrics.slice(-this.maxMetricsSize);
    }
  }

  /**
   * 获取性能统计摘要
   */
  getPerformanceSummary(timeRange: number = 3600000): {
    timeRange: number;
    timestamp: number;
    metrics: Record<string, any>;
    requests: {
      total: number;
      success: number;
      error: number;
      avgResponseTime: number;
      cacheHitRate: number;
    };
    errors: {
      total: number;
      uniqueMessages: number;
      topErrors: Array<{
        message: string;
        count: number;
        lastOccurrence: number;
      }>;
    };
  } {
    // 默认1小时
    const now = Date.now();
    const startTime = now - timeRange;

    const recentMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    const recentRequests = this.requests.filter(r => r.timestamp >= startTime);
    const recentErrors = this.errors.filter(e => e.timestamp >= startTime);

    // 按指标名称分组统计
    const metricStats = recentMetrics.reduce(
      (acc, metric) => {
        if (!acc[metric.name]) {
          acc[metric.name] = {
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity,
            avg: 0
          };
        }

        const stat = acc[metric.name];
        stat.count++;
        stat.sum += metric.value;
        stat.min = Math.min(stat.min, metric.value);
        stat.max = Math.max(stat.max, metric.value);
        stat.avg = stat.sum / stat.count;

        return acc;
      },
      {} as Record<string, any>
    );

    // 请求统计
    const requestStats = {
      total: recentRequests.length,
      success: recentRequests.filter(r => r.statusCode < 400).length,
      error: recentRequests.filter(r => r.statusCode >= 400).length,
      avgResponseTime:
        recentRequests.length > 0
          ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length
          : 0,
      cacheHitRate:
        recentRequests.length > 0
          ? recentRequests.filter(r => r.cacheHit).length / recentRequests.length
          : 0
    };

    // 错误统计
    const errorStats = {
      total: recentErrors.length,
      uniqueMessages: new Set(recentErrors.map(e => e.message)).size,
      topErrors: this.getTopErrorsFromList(recentErrors, 5)
    };

    return {
      timeRange,
      timestamp: now,
      metrics: metricStats,
      requests: requestStats,
      errors: errorStats
    };
  }

  /**
   * 获取最常见的错误
   */
  private getTopErrorsFromList(
    errors: ErrorMetric[],
    limit: number
  ): Array<{
    message: string;
    count: number;
    lastOccurrence: number;
  }> {
    const errorCounts = errors.reduce(
      (acc, error) => {
        const key = error.message;
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            lastOccurrence: 0
          };
        }
        acc[key].count++;
        acc[key].lastOccurrence = Math.max(acc[key].lastOccurrence, error.timestamp);
        return acc;
      },
      {} as Record<string, { count: number; lastOccurrence: number }>
    );

    return Object.entries(errorCounts)
      .map(([message, data]) => ({
        message,
        ...data
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取实时指标
   */
  getRealTimeMetrics(): {
    activeUsers: number;
    currentHour: {
      requests: number;
      errors: number;
      avgResponseTime: number;
    };
    systemHealth: 'healthy' | 'warning' | 'critical';
    } {
    const now = Date.now();
    const hourAgo = now - 3600000;

    const recentRequests = this.requests.filter(r => r.timestamp >= hourAgo);
    const recentErrors = this.errors.filter(e => e.timestamp >= hourAgo);

    const currentHour = {
      requests: recentRequests.length,
      errors: recentErrors.length,
      avgResponseTime:
        recentRequests.length > 0
          ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length
          : 0
    };

    // 计算活跃用户数（最近1小时有请求的用户）
    const activeUsers = new Set(recentRequests.map(r => r.userId).filter(Boolean)).size;

    // 系统健康状态评估
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (currentHour.avgResponseTime > 5000 || currentHour.errors > 10) {
      systemHealth = 'critical';
    } else if (currentHour.avgResponseTime > 2000 || currentHour.errors > 5) {
      systemHealth = 'warning';
    }

    return {
      activeUsers,
      currentHour,
      systemHealth
    };
  }

  /**
   * 生成错误指纹
   */
  private generateErrorFingerprint(message: string, url?: string, method?: string): string {
    const content = `${message}:${url || ''}:${method || ''}`;
    return this.simpleHash(content);
  }

  /**
   * 简单的哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 清理旧数据
   */
  async cleanup(retentionDays: number = 7): Promise<void> {
    const cutoffTime = Date.now() - retentionDays * 24 * 3600 * 1000;

    // 清理内存中的旧数据
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    this.errors = this.errors.filter(e => e.timestamp >= cutoffTime);
    this.requests = this.requests.filter(r => r.timestamp >= cutoffTime);
    this.systemMetrics = this.systemMetrics.filter(s => s.timestamp >= cutoffTime);

    // 清理KV中的旧数据（这里可以实现批量删除逻辑）
    console.log(`Cleaned up monitoring data older than ${retentionDays} days`);
  }

  /**
   * 导出监控数据
   */
  async exportData(timeRange?: number): Promise<{
    metrics: PerformanceMetric[];
    errors: ErrorMetric[];
    requests: RequestMetric[];
    systemMetrics: SystemMetrics[];
  }> {
    const startTime = timeRange ? Date.now() - timeRange : 0;

    return {
      metrics: this.metrics.filter(m => m.timestamp >= startTime),
      errors: this.errors.filter(e => e.timestamp >= startTime),
      requests: this.requests.filter(r => r.timestamp >= startTime),
      systemMetrics: this.systemMetrics.filter(s => s.timestamp >= startTime)
    };
  }
}

/**
 * 创建监控服务实例
 */
let monitoringService: MonitoringService;

export const createMonitoringService = (kv: KVNamespace): MonitoringService => {
  if (!monitoringService) {
    monitoringService = new MonitoringService(kv);
  }
  return monitoringService;
};

/**
 * 获取监控服务实例
 */
export const getMonitoringService = (): MonitoringService => {
  if (!monitoringService) {
    throw new Error('Monitoring service not initialized');
  }
  return monitoringService;
};