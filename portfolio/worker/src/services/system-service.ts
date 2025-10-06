import { Env, SystemInfo, Link, AnalyticsRequest } from '../types';
import { executeQuery, executeQueryFirst, executeMutation } from './database';
import { SystemCacheKeys, getCache, setCache, deleteCache } from '../utils/cache';

export class SystemService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // 获取系统信息
  async getSystemInfo(): Promise<SystemInfo> {
    const cacheKey = SystemCacheKeys.info();
    const cached = await getCache<SystemInfo>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const [postsCount, projectsCount, commentsCount, lastUpdated] = await Promise.all([
      this.getPostsCount(),
      this.getProjectsCount(),
      this.getCommentsCount(),
      this.getLastUpdatedDate()
    ]);

    const info: SystemInfo = {
      version: '1.0.0',
      total_posts: postsCount,
      total_projects: projectsCount,
      total_comments: commentsCount,
      last_updated: lastUpdated
    };

    await setCache(this.env, cacheKey, info, 600); // 10分钟缓存
    return info;
  }

  // 获取公开设置
  async getPublicSettings(): Promise<Record<string, any>> {
    const cacheKey = SystemCacheKeys.settings();
    const cached = await getCache<Record<string, any>>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<{ key: string; value: string; type: string }>(
      this.env,
      `
        SELECT key, value, type FROM settings
        WHERE is_public = 1
      `
    );

    const settings: Record<string, any> = {};

    if (result.success && result.data) {
      result.data.forEach(setting => {
        try {
          switch (setting.type) {
            case 'number':
              settings[setting.key] = Number(setting.value);
              break;
            case 'boolean':
              settings[setting.key] = setting.value === 'true';
              break;
            case 'json':
              settings[setting.key] = JSON.parse(setting.value);
              break;
            default:
              settings[setting.key] = setting.value;
          }
        } catch (error) {
          settings[setting.key] = setting.value;
        }
      });
    }

    await setCache(this.env, cacheKey, settings, 1800); // 30分钟缓存
    return settings;
  }

  // 获取友情链接
  async getLinks(): Promise<Link[]> {
    const cacheKey = SystemCacheKeys.links();
    const cached = await getCache<Link[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<Link>(
      this.env,
      `
        SELECT * FROM links
        WHERE is_active = 1
        ORDER BY sort_order ASC, created_at DESC
      `
    );

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 1800); // 30分钟缓存
      return result.data;
    }

    return [];
  }

  // 记录访问统计
  async trackAnalytics(data: AnalyticsRequest): Promise<void> {
    // 记录页面访问
    await executeMutation(
      this.env,
      `
        INSERT INTO analytics (
          path, referrer, user_agent, ip_address, visit_date, created_at
        ) VALUES (?, ?, ?, ?, date('now'), datetime('now'))
      `,
      [data.path, data.referrer || null, data.user_agent || null, data.ip_address || null]
    );

    // 更新页面浏览量（如果posts或projects表有view_count字段）
    if (data.path.startsWith('/blog/') || data.path.startsWith('/project/')) {
      const slug = data.path.split('/')[2];
      if (data.path.startsWith('/blog/')) {
        await this.updatePostViewCount(slug);
      } else if (data.path.startsWith('/project/')) {
        await this.updateProjectViewCount(slug);
      }
    }
  }

  // 获取访问统计
  async getAnalytics(days: number = 30): Promise<any> {
    const result = await executeQuery(
      this.env,
      `
        SELECT
          visit_date,
          COUNT(*) as visits,
          COUNT(DISTINCT path) as unique_pages
        FROM analytics
        WHERE visit_date >= date('now', '-${days} days')
        GROUP BY visit_date
        ORDER BY visit_date DESC
      `
    );

    return result.success ? result.data || [] : [];
  }

  // 获取热门页面
  async getPopularPages(limit: number = 10): Promise<any[]> {
    const result = await executeQuery(
      this.env,
      `
        SELECT
          path,
          COUNT(*) as visits,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM analytics
        WHERE visit_date >= date('now', '-30 days')
        GROUP BY path
        ORDER BY visits DESC
        LIMIT ?
      `,
      [limit]
    );

    return result.success ? result.data || [] : [];
  }

  // 清除系统缓存
  async clearSystemCache(): Promise<void> {
    await deleteCache(this.env, SystemCacheKeys.info());
    await deleteCache(this.env, SystemCacheKeys.settings());
    await deleteCache(this.env, SystemCacheKeys.links());
  }

  // 私有辅助方法
  private async getPostsCount(): Promise<number> {
    const result = await executeQueryFirst<{ count: number }>(
      this.env,
      'SELECT COUNT(*) as count FROM posts WHERE is_published = 1'
    );
    return result.success ? result.data?.count || 0 : 0;
  }

  private async getProjectsCount(): Promise<number> {
    const result = await executeQueryFirst<{ count: number }>(
      this.env,
      'SELECT COUNT(*) as count FROM projects'
    );
    return result.success ? result.data?.count || 0 : 0;
  }

  private async getCommentsCount(): Promise<number> {
    const result = await executeQueryFirst<{ count: number }>(
      this.env,
      'SELECT COUNT(*) as count FROM comments WHERE is_approved = 1'
    );
    return result.success ? result.data?.count || 0 : 0;
  }

  private async getLastUpdatedDate(): Promise<string> {
    const result = await executeQueryFirst<{ last_updated: string }>(
      this.env,
      `
        SELECT MAX(updated_at) as last_updated FROM (
          SELECT updated_at FROM posts WHERE is_published = 1
          UNION ALL
          SELECT updated_at FROM projects
          UNION ALL
          SELECT updated_at FROM comments WHERE is_approved = 1
        )
      `
    );
    return result.success ? result.data?.last_updated || '' : '';
  }

  private async updatePostViewCount(slug: string): Promise<void> {
    await executeMutation(this.env, 'UPDATE posts SET view_count = view_count + 1 WHERE slug = ?', [
      slug
    ]);
  }

  private async updateProjectViewCount(slug: string): Promise<void> {
    await executeMutation(
      this.env,
      'UPDATE projects SET star_count = star_count + 1 WHERE slug = ?',
      [slug]
    );
  }
}
