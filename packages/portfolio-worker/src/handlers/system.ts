import { Context } from 'hono';
import { SystemService } from '../services/system-service';
import { successResponse, errorResponse } from '../utils/response';
import { validateInput } from '../utils/validation';
import { analyticsSchema } from '../utils/validation';

export class SystemHandler {
  private systemService: SystemService;

  constructor(env: any) {
    this.systemService = new SystemService(env);
  }

  // 获取系统信息
  async getSystemInfo(c: Context) {
    try {
      const info = await this.systemService.getSystemInfo();
      return successResponse(c, info);
    } catch (error) {
      console.error('Get system info error:', error);
      return errorResponse(c, 'Failed to get system information', 500);
    }
  }

  // 获取公开设置
  async getPublicSettings(c: Context) {
    try {
      const settings = await this.systemService.getPublicSettings();
      return successResponse(c, settings);
    } catch (error) {
      console.error('Get public settings error:', error);
      return errorResponse(c, 'Failed to get public settings', 500);
    }
  }

  // 获取友情链接
  async getLinks(c: Context) {
    try {
      const links = await this.systemService.getLinks();
      return successResponse(c, links);
    } catch (error) {
      console.error('Get links error:', error);
      return errorResponse(c, 'Failed to get links', 500);
    }
  }

  // 记录访问统计
  async trackAnalytics(c: Context) {
    try {
      const body = await c.req.json();
      const validation = await validateInput(analyticsSchema)(body);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      // 获取客户端IP
      const ip =
        c.req.header('CF-Connecting-IP') ||
        c.req.header('X-Forwarded-For') ||
        c.req.header('X-Real-IP') ||
        'unknown';

      const analyticsData = {
        ...validation.data,
        ip_address: ip,
        user_agent: validation.data.user_agent || c.req.header('User-Agent'),
        referrer: validation.data.referrer || c.req.header('Referer')
      };

      await this.systemService.trackAnalytics(analyticsData);
      return successResponse(c, null, 'Analytics tracked successfully');
    } catch (error) {
      console.error('Track analytics error:', error);
      return errorResponse(c, 'Failed to track analytics', 500);
    }
  }

  // 获取访问统计（管理员功能）
  async getAnalytics(c: Context) {
    try {
      const days = parseInt(c.req.query('days') || '30');
      const analytics = await this.systemService.getAnalytics(days);
      return successResponse(c, analytics);
    } catch (error) {
      console.error('Get analytics error:', error);
      return errorResponse(c, 'Failed to get analytics', 500);
    }
  }

  // 获取热门页面
  async getPopularPages(c: Context) {
    try {
      const limit = parseInt(c.req.query('limit') || '10');
      const popularPages = await this.systemService.getPopularPages(limit);
      return successResponse(c, popularPages);
    } catch (error) {
      console.error('Get popular pages error:', error);
      return errorResponse(c, 'Failed to get popular pages', 500);
    }
  }

  // 获取分析概览
  async getAnalyticsOverview(c: Context) {
    try {
      // 返回基本的统计概览数据
      const overview = {
        total_visits: 0,
        total_page_views: 0,
        unique_visitors: 0,
        avg_session_duration: 0,
        bounce_rate: 0
      };
      return successResponse(c, overview);
    } catch (error) {
      console.error('Get analytics overview error:', error);
      return errorResponse(c, 'Failed to get analytics overview', 500);
    }
  }

  // 获取分析趋势
  async getAnalyticsTrends(c: Context) {
    try {
      const startDate = c.req.query('start_date');
      const endDate = c.req.query('end_date');
      const period = c.req.query('period') || 'day';

      // 返回空的趋势数据
      const trends = {
        labels: [],
        datasets: [{
          label: 'Page Views',
          data: []
        }]
      };
      return successResponse(c, trends);
    } catch (error) {
      console.error('Get analytics trends error:', error);
      return errorResponse(c, 'Failed to get analytics trends', 500);
    }
  }

  // 健康检查
  async healthCheck(c: Context) {
    try {
      // 检查数据库连接
      await this.systemService.getSystemInfo();
      return successResponse(c, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: c.env.ENVIRONMENT,
        database: 'connected'
      });
    } catch (error) {
      console.error('Health check error:', error);
      return errorResponse(c, 'Service unhealthy', 503);
    }
  }
}
