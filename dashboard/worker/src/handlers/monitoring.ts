/**
 * 监控仪表板 API 处理器
 * 提供性能监控数据的查询和分析接口
 */

import { Hono } from 'hono';
import { createMonitoringService, getMonitoringService } from '../services/monitoring';
import { permissionConfigs } from '../middleware/auth';
import type { DashboardEnv } from '../types';

const monitoringRoutes = new Hono<{
  Bindings: DashboardEnv;
  Variables: {
    user: any; // 监控路由需要用户信息
  };
}>();

// 获取实时监控概览
monitoringRoutes.get('/overview', async c => {
  try {
    const monitoring = getMonitoringService();
    const realTimeMetrics = monitoring.getRealTimeMetrics();
    const performanceSummary = monitoring.getPerformanceSummary();

    return c.json({
      success: true,
      data: {
        realTime: realTimeMetrics,
        summary: performanceSummary
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring overview:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch monitoring data'
      },
      500
    );
  }
});

// 获取性能指标历史数据
monitoringRoutes.get('/metrics', async c => {
  try {
    const timeRange = parseInt(c.req.query('timeRange') || '3600000'); // 默认1小时
    const metricName = c.req.query('metric');

    const monitoring = getMonitoringService();
    const data = await monitoring.exportData(timeRange);

    // 如果指定了指标名称，则过滤数据
    if (metricName) {
      data.metrics = data.metrics.filter(m => m.name === metricName);
    }

    // 按时间分组聚合数据
    const aggregatedData = aggregateMetricsByTime(data.metrics, 300000); // 5分钟间隔

    return c.json({
      success: true,
      data: {
        metrics: aggregatedData,
        timeRange,
        totalMetrics: data.metrics.length
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch metrics'
      },
      500
    );
  }
});

// 获取错误统计
monitoringRoutes.get('/errors', async c => {
  try {
    const timeRange = parseInt(c.req.query('timeRange') || '3600000'); // 默认1小时
    const limit = parseInt(c.req.query('limit') || '50');

    const monitoring = getMonitoringService();
    const data = await monitoring.exportData(timeRange);

    // 按错误类型分组统计
    const errorStats = data.errors.reduce(
      (acc, error) => {
        const key = error.message;
        if (!acc[key]) {
          acc[key] = {
            message: error.message,
            count: 0,
            firstOccurrence: error.timestamp,
            lastOccurrence: error.timestamp,
            occurrences: []
          };
        }

        const stat = acc[key];
        stat.count++;
        stat.firstOccurrence = Math.min(stat.firstOccurrence, error.timestamp);
        stat.lastOccurrence = Math.max(stat.lastOccurrence, error.timestamp);

        // 保留最近的几个错误实例
        if (stat.occurrences.length < 5) {
          stat.occurrences.push({
            timestamp: error.timestamp,
            url: error.url,
            method: error.method,
            userId: error.userId,
            userAgent: error.userAgent
          });
        }

        return acc;
      },
      {} as Record<string, any>
    );

    // 按错误次数排序并限制数量
    const sortedErrors = Object.values(errorStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, limit);

    return c.json({
      success: true,
      data: {
        errors: sortedErrors,
        totalErrors: data.errors.length,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching error stats:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch error statistics'
      },
      500
    );
  }
});

// 获取请求统计
monitoringRoutes.get('/requests', async c => {
  try {
    const timeRange = parseInt(c.req.query('timeRange') || '3600000'); // 默认1小时

    const monitoring = getMonitoringService();
    const data = await monitoring.exportData(timeRange);

    // 按状态码分组
    const statusDistribution = data.requests.reduce(
      (acc, request) => {
        const status = request.statusCode;
        if (!acc[status]) {
          acc[status] = 0;
        }
        acc[status]++;
        return acc;
      },
      {} as Record<number, number>
    );

    // 按端点分组
    const endpointStats = data.requests.reduce(
      (acc, request) => {
        const endpoint = `${request.method} ${new URL(request.url).pathname}`;
        if (!acc[endpoint]) {
          acc[endpoint] = {
            endpoint,
            count: 0,
            totalResponseTime: 0,
            avgResponseTime: 0,
            successCount: 0,
            errorCount: 0
          };
        }

        const stat = acc[endpoint];
        stat.count++;
        stat.totalResponseTime += request.responseTime;
        stat.avgResponseTime = stat.totalResponseTime / stat.count;

        if (request.statusCode < 400) {
          stat.successCount++;
        } else {
          stat.errorCount++;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    // 按时间分组请求数量
    const requestsOverTime = aggregateRequestsByTime(data.requests, 300000); // 5分钟间隔

    return c.json({
      success: true,
      data: {
        summary: {
          totalRequests: data.requests.length,
          uniqueEndpoints: Object.keys(endpointStats).length,
          avgResponseTime:
            data.requests.length > 0
              ? data.requests.reduce((sum, r) => sum + r.responseTime, 0) / data.requests.length
              : 0,
          cacheHitRate:
            data.requests.length > 0
              ? data.requests.filter(r => r.cacheHit).length / data.requests.length
              : 0
        },
        statusDistribution,
        endpointStats: Object.values(endpointStats).sort((a: any, b: any) => b.count - a.count),
        requestsOverTime
      }
    });
  } catch (error) {
    console.error('Error fetching request stats:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch request statistics'
      },
      500
    );
  }
});

// 获取系统健康状态
monitoringRoutes.get('/health', async c => {
  try {
    const monitoring = getMonitoringService();
    const realTimeMetrics = monitoring.getRealTimeMetrics();
    const performanceSummary = monitoring.getPerformanceSummary();

    // 健康检查指标
    const healthChecks = {
      responseTime: {
        status:
          realTimeMetrics.currentHour.avgResponseTime < 2000
            ? 'healthy'
            : realTimeMetrics.currentHour.avgResponseTime < 5000
              ? 'warning'
              : 'critical',
        value: realTimeMetrics.currentHour.avgResponseTime,
        threshold: { warning: 2000, critical: 5000 }
      },
      errorRate: {
        status:
          realTimeMetrics.currentHour.errors < 5
            ? 'healthy'
            : realTimeMetrics.currentHour.errors < 10
              ? 'warning'
              : 'critical',
        value: realTimeMetrics.currentHour.errors,
        threshold: { warning: 5, critical: 10 }
      },
      requestRate: {
        status: realTimeMetrics.currentHour.requests > 0 ? 'healthy' : 'warning',
        value: realTimeMetrics.currentHour.requests,
        threshold: { warning: 1, critical: 0 }
      }
    };

    // 计算总体健康状态
    const statuses = Object.values(healthChecks).map(check => check.status);
    const overallHealth = statuses.includes('critical')
      ? 'critical'
      : statuses.includes('warning')
        ? 'warning'
        : 'healthy';

    return c.json({
      success: true,
      data: {
        overallHealth,
        healthChecks,
        realTimeMetrics,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch health status'
      },
      500
    );
  }
});

// 清理监控数据（管理员权限）
monitoringRoutes.delete('/cleanup', async c => {
  try {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
      return c.json(
        {
          success: false,
          error: 'Admin access required'
        },
        403
      );
    }

    const retentionDays = parseInt(c.req.query('retentionDays') || '7');
    const monitoring = getMonitoringService();

    await monitoring.cleanup(retentionDays);

    return c.json({
      success: true,
      message: `Cleaned up monitoring data older than ${retentionDays} days`
    });
  } catch (error) {
    console.error('Error cleaning up monitoring data:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to cleanup monitoring data'
      },
      500
    );
  }
});

// 导出监控数据
monitoringRoutes.get('/export', async c => {
  try {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
      return c.json(
        {
          success: false,
          error: 'Admin access required'
        },
        403
      );
    }

    const timeRange = parseInt(c.req.query('timeRange') || '86400000'); // 默认24小时
    const monitoring = getMonitoringService();

    const data = await monitoring.exportData(timeRange);

    return c.json({
      success: true,
      data: {
        ...data,
        exportTime: new Date().toISOString(),
        timeRange
      }
    });
  } catch (error) {
    console.error('Error exporting monitoring data:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to export monitoring data'
      },
      500
    );
  }
});

// 辅助函数：按时间聚合性能指标
function aggregateMetricsByTime(
  metrics: any[],
  intervalMs: number
): Array<{
  timestamp: number;
  [key: string]: number;
}> {
  const aggregated = new Map<number, any>();

  metrics.forEach(metric => {
    const timeSlot = Math.floor(metric.timestamp / intervalMs) * intervalMs;

    if (!aggregated.has(timeSlot)) {
      aggregated.set(timeSlot, { timestamp: timeSlot });
    }

    const slot = aggregated.get(timeSlot);
    const key = `${metric.name}_avg`;

    if (!slot[key]) {
      slot[key] = 0;
      slot[`${key}_count`] = 0;
    }

    slot[key] += metric.value;
    slot[`${key}_count`]++;
  });

  // 计算平均值
  const result = Array.from(aggregated.values()).map(slot => {
    const avgSlot: any = { timestamp: slot.timestamp };

    Object.keys(slot).forEach(key => {
      if (key.endsWith('_count')) {
        const baseKey = key.replace('_count', '');
        avgSlot[baseKey] = slot[baseKey] / slot[key];
        delete avgSlot[baseKey];
        delete avgSlot[key];
      } else if (!key.startsWith('timestamp')) {
        delete avgSlot[key];
      }
    });

    return avgSlot;
  });

  return result.sort((a, b) => a.timestamp - b.timestamp);
}

// 辅助函数：按时间聚合请求数据
function aggregateRequestsByTime(
  requests: any[],
  intervalMs: number
): Array<{
  timestamp: number;
  count: number;
  avgResponseTime: number;
  errorRate: number;
}> {
  const aggregated = new Map<
    number,
    {
      count: number;
      totalResponseTime: number;
      errors: number;
    }
  >();

  requests.forEach(request => {
    const timeSlot = Math.floor(request.timestamp / intervalMs) * intervalMs;

    if (!aggregated.has(timeSlot)) {
      aggregated.set(timeSlot, {
        count: 0,
        totalResponseTime: 0,
        errors: 0
      });
    }

    const slot = aggregated.get(timeSlot)!;
    slot.count++;
    slot.totalResponseTime += request.responseTime;

    if (request.statusCode >= 400) {
      slot.errors++;
    }
  });

  return Array.from(aggregated.entries())
    .map(([timestamp, data]) => ({
      timestamp,
      count: data.count,
      avgResponseTime: data.totalResponseTime / data.count,
      errorRate: data.errors / data.count
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export { monitoringRoutes };
