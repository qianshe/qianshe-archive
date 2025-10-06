import { Hono } from 'hono';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';

type Bindings = {
  SHARED_DB: D1Database;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  ENVIRONMENT: string;
};

const analyticsRoutes = new Hono<{ Bindings: Bindings }>();

// 日期范围查询验证模式
const dateRangeSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  period: z.enum(['day', 'week', 'month']).default('day')
});

// 获取概览统计
analyticsRoutes.get('/overview', async (c: any) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 并行获取各种统计数据
  const [pageViews, uniqueVisitors, posts, projects, comments, todayStats, yesterdayStats] =
    await Promise.all([
      // 总页面浏览量
      c.env.SHARED_DB.prepare(
        `
      SELECT COUNT(*) as total FROM analytics WHERE event_type = 'page_view'
    `
      ).first(),

      // 总访问用户数
      c.env.SHARED_DB.prepare(
        `
      SELECT COUNT(DISTINCT session_id) as total FROM analytics WHERE event_type = 'page_view'
    `
      ).first(),

      // 文章统计
      c.env.SHARED_DB.prepare(
        `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as this_month
      FROM posts
    `
      )
        .bind(monthAgo)
        .first(),

      // 项目统计
      c.env.SHARED_DB.prepare(
        `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as this_month
      FROM projects
    `
      )
        .bind(monthAgo)
        .first(),

      // 评论统计
      c.env.SHARED_DB.prepare(
        `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN created_at >= ? THEN 1 END) as this_month
      FROM comments
    `
      )
        .bind(monthAgo)
        .first(),

      // 今日统计
      c.env.SHARED_DB.prepare(
        `
      SELECT
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view' AND DATE(created_at) = ?
    `
      )
        .bind(today)
        .first(),

      // 昨日统计
      c.env.SHARED_DB.prepare(
        `
      SELECT
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view' AND DATE(created_at) = ?
    `
      )
        .bind(yesterday)
        .first()
    ]);

  // 计算增长率
  const todayViews = (todayStats as any)?.page_views || 0;
  const yesterdayViews = (yesterdayStats as any)?.page_views || 0;
  const todayVisitors = (todayStats as any)?.unique_visitors || 0;
  const yesterdayVisitors = (yesterdayStats as any)?.unique_visitors || 0;

  const viewGrowth =
    yesterdayViews > 0 ? (((todayViews - yesterdayViews) / yesterdayViews) * 100).toFixed(1) : '0';
  const visitorGrowth =
    yesterdayVisitors > 0
      ? (((todayVisitors - yesterdayVisitors) / yesterdayVisitors) * 100).toFixed(1)
      : '0';

  return c.json({
    success: true,
    data: {
      pageViews: {
        total: (pageViews as any)?.total || 0,
        today: todayViews,
        growth: parseFloat(viewGrowth)
      },
      visitors: {
        total: (uniqueVisitors as any)?.total || 0,
        today: todayVisitors,
        growth: parseFloat(visitorGrowth)
      },
      posts: (posts as any) || {},
      projects: (projects as any) || {},
      comments: (comments as any) || {}
    }
  });
});

// 获取访问趋势
analyticsRoutes.get('/trends', async (c: any) => {
  try {
    const query = dateRangeSchema.parse(Object.fromEntries(c.req.queries()));
    const { start_date, end_date, period } = query;

    // 根据周期构建SQL查询
    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
    }

    const trendsQuery = `
      SELECT
        strftime('${dateFormat}', created_at) as period,
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors,
        COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) as sessions
      FROM analytics
      WHERE event_type = 'page_view'
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY strftime('${dateFormat}', created_at)
      ORDER BY period ASC
    `;

    const trends = await c.env.SHARED_DB.prepare(trendsQuery).bind(start_date, end_date).all();

    return c.json({
      success: true,
      data: {
        trends: trends.results,
        period
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取热门页面
analyticsRoutes.get('/popular-pages', async (c: any) => {
  try {
    const query = z
      .object({
        limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('10'),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      })
      .parse(Object.fromEntries(c.req.queries()));

    // 默认查询最近30天
    const end = query.end_date || new Date().toISOString();
    const start = query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const popularPagesQuery = `
      SELECT
        page_url,
        page_title,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(visit_duration) as avg_duration
      FROM analytics
      WHERE event_type = 'page_view'
        AND page_url IS NOT NULL
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY page_url, page_title
      ORDER BY views DESC
      LIMIT ?
    `;

    const popularPages = await c.env.SHARED_DB.prepare(popularPagesQuery)
      .bind(start, end, query.limit)
      .all();

    return c.json({
      success: true,
      data: {
        pages: popularPages.results,
        period: { start, end }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取流量来源
analyticsRoutes.get('/referrers', async (c: any) => {
  try {
    const query = z
      .object({
        limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('10'),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      })
      .parse(Object.fromEntries(c.req.queries()));

    const end = query.end_date || new Date().toISOString();
    const start = query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const referrersQuery = `
      SELECT
        referrer,
        COUNT(*) as visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view'
        AND referrer IS NOT NULL
        AND referrer != ''
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY referrer
      ORDER BY visits DESC
      LIMIT ?
    `;

    const referrers = await c.env.SHARED_DB.prepare(referrersQuery).bind(start, end, query.limit).all();

    // 分类流量来源
    const categorizedReferrers = referrers.results.map((item: any) => {
      const referrer = item.referrer.toLowerCase();
      let category = 'other';

      if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('baidu')) {
        category = 'search';
      } else if (
        referrer.includes('twitter') ||
        referrer.includes('facebook') ||
        referrer.includes('linkedin')
      ) {
        category = 'social';
      } else if (referrer.includes('github') || referrer.includes('gitlab')) {
        category = 'development';
      } else if (referrer === 'direct' || referrer === '') {
        category = 'direct';
      }

      return {
        ...item,
        category
      };
    });

    return c.json({
      success: true,
      data: {
        referrers: categorizedReferrers,
        period: { start, end }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取设备统计
analyticsRoutes.get('/devices', async (c: any) => {
  try {
    const query = z
      .object({
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      })
      .parse(Object.fromEntries(c.req.queries()));

    const end = query.end_date || new Date().toISOString();
    const start = query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const devicesQuery = `
      SELECT
        device_type,
        COUNT(*) as visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view'
        AND device_type IS NOT NULL
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY device_type
      ORDER BY visits DESC
    `;

    const devices = await c.env.SHARED_DB.prepare(devicesQuery).bind(start, end).all();

    // 获取浏览器统计
    const browsersQuery = `
      SELECT
        browser,
        COUNT(*) as visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view'
        AND browser IS NOT NULL
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY browser
      ORDER BY visits DESC
      LIMIT 10
    `;

    const browsers = await c.env.SHARED_DB.prepare(browsersQuery).bind(start, end).all();

    return c.json({
      success: true,
      data: {
        devices: devices.results,
        browsers: browsers.results,
        period: { start, end }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取地理分布
analyticsRoutes.get('/geography', async (c: any) => {
  try {
    const query = z
      .object({
        limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('20'),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      })
      .parse(Object.fromEntries(c.req.queries()));

    const end = query.end_date || new Date().toISOString();
    const start = query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const geographyQuery = `
      SELECT
        country,
        city,
        COUNT(*) as visits,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM analytics
      WHERE event_type = 'page_view'
        AND country IS NOT NULL
        AND created_at >= ?
        AND created_at <= ?
      GROUP BY country, city
      ORDER BY visits DESC
      LIMIT ?
    `;

    const geography = await c.env.SHARED_DB.prepare(geographyQuery).bind(start, end, query.limit).all();

    return c.json({
      success: true,
      data: {
        geography: geography.results,
        period: { start, end }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取内容表现
analyticsRoutes.get('/content-performance', async (c: any) => {
  try {
    const query = z
      .object({
        content_type: z.enum(['posts', 'projects']).default('posts'),
        limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default('10'),
        start_date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional()
      })
      .parse(Object.fromEntries(c.req.queries()));

    const end = query.end_date || new Date().toISOString();
    const start = query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let contentQuery;
    if (query.content_type === 'posts') {
      contentQuery = `
        SELECT
          p.id,
          p.title,
          p.slug,
          COUNT(a.id) as views,
          COUNT(DISTINCT a.session_id) as unique_visitors,
          AVG(a.visit_duration) as avg_duration,
          p.view_count as total_views
        FROM posts p
        LEFT JOIN analytics a ON p.slug LIKE '%' || SUBSTR(a.page_url, -20) || '%'
        WHERE a.event_type = 'page_view'
          AND a.created_at >= ?
          AND a.created_at <= ?
        GROUP BY p.id, p.title, p.slug, p.view_count
        ORDER BY views DESC
        LIMIT ?
      `;
    } else {
      contentQuery = `
        SELECT
          p.id,
          p.title,
          p.slug,
          COUNT(a.id) as views,
          COUNT(DISTINCT a.session_id) as unique_visitors,
          AVG(a.visit_duration) as avg_duration
        FROM projects p
        LEFT JOIN analytics a ON p.slug LIKE '%' || SUBSTR(a.page_url, -20) || '%'
        WHERE a.event_type = 'page_view'
          AND a.created_at >= ?
          AND a.created_at <= ?
        GROUP BY p.id, p.title, p.slug
        ORDER BY views DESC
        LIMIT ?
      `;
    }

    const content = await c.env.SHARED_DB.prepare(contentQuery).bind(start, end, query.limit).all();

    return c.json({
      success: true,
      data: {
        content: content.results,
        contentType: query.content_type,
        period: { start, end }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 记录页面访问（公开接口）
analyticsRoutes.post('/track', async (c: any) => {
  try {
    const body = await c.req.json();

    const {
      page_url,
      page_title,
      referrer,
      user_agent,
      ip_address,
      country,
      city,
      device_type,
      browser,
      os,
      session_id,
      user_id,
      visit_duration,
      is_bounce = false
    } = body;

    // 验证必填字段
    if (!page_url) {
      throw createError.badRequest('page_url is required');
    }

    // 插入访问记录
    const result = await c.env.SHARED_DB.prepare(
      `
      INSERT INTO analytics (
        event_type,
        page_url,
        page_title,
        referrer,
        user_agent,
        ip_address,
        country,
        city,
        device_type,
        browser,
        os,
        session_id,
        user_id,
        visit_duration,
        is_bounce,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        'page_view',
        page_url,
        page_title || null,
        referrer || null,
        user_agent || null,
        ip_address || null,
        country || null,
        city || null,
        device_type || null,
        browser || null,
        os || null,
        session_id || null,
        user_id || null,
        visit_duration || null,
        is_bounce ? 1 : 0,
        new Date().toISOString()
      )
      .run();

    return c.json({
      success: true,
      data: {
        id: result.meta.last_row_id,
        message: 'Visit tracked successfully'
      }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // 不抛出错误，避免影响用户体验
    return c.json(
      {
        success: false,
        error: 'Failed to track visit'
      },
      500
    );
  }
});

export { analyticsRoutes };