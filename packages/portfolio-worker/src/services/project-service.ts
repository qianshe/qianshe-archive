import { Env, Project, ProjectQuery, TechStats } from '../types';
import {
  executeQuery,
  executeQueryFirst,
  buildOrderByClause,
  buildPaginationClause
} from './database';
import {
  ProjectCacheKeys,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPrefix
} from '../utils/cache';

export class ProjectService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // 获取项目列表
  async getProjects(query: ProjectQuery): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const cacheKey = ProjectCacheKeys.list(JSON.stringify(query));
    const cached = await getCache<any>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, ...filters } = query;

    // 构建查询
    let whereClause = 'WHERE is_featured = is_featured'; // 占位符，后面会被替换
    const params: any[] = [];

    if (filters.featured !== undefined) {
      whereClause += ' AND is_featured = ?';
      params.push(filters.featured);
    }

    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.tech && filters.tech.length > 0) {
      const techConditions = filters.tech
        .map(tech => `JSON_EXTRACT(tech_stack, '$') LIKE '%${tech}%'`)
        .join(' OR ');
      whereClause += ` AND (${techConditions})`;
    }

    const orderBy = buildOrderByClause(
      filters.sort_by || 'created_at',
      filters.sort_order || 'desc'
    );
    const pagination = buildPaginationClause(page, limit);

    const dataQuery = `
      SELECT
        id, title, slug, description, tech_stack, status, is_featured,
        github_url, demo_url, cover_image, created_at, updated_at
      FROM projects
      ${whereClause}
      ${orderBy}
      ${pagination}
    `;

    const countQuery = `
      SELECT COUNT(*) as count FROM projects ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      executeQuery<Project>(this.env, dataQuery, params),
      executeQueryFirst<{ count: number }>(this.env, countQuery, params)
    ]);

    if (!dataResult.success || !countResult.success) {
      throw new Error('Failed to fetch projects');
    }

    const total = countResult.data?.count || 0;
    const projects = dataResult.data as Project[];
    const totalPages = Math.ceil(total / limit);

    const result = {
      projects,
      total,
      page,
      limit,
      totalPages
    };

    // 缓存结果
    await setCache(this.env, cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  // 获取项目详情
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const cacheKey = ProjectCacheKeys.detail(slug);
    const cached = await getCache<Project>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQueryFirst<Project>(
      this.env,
      `
        SELECT * FROM projects
        WHERE slug = ?
      `,
      [slug]
    );

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 600); // 10分钟缓存
      return result.data;
    }

    return null;
  }

  // 获取技术栈统计
  async getTechStats(): Promise<TechStats[]> {
    const cacheKey = ProjectCacheKeys.techStats();
    const cached = await getCache<TechStats[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<{ tech_stack: string }>(
      this.env,
      `
        SELECT tech_stack FROM projects
        WHERE tech_stack IS NOT NULL
      `
    );

    if (result.success && result.data) {
      // 统计技术栈
      const techCounts: Record<string, { count: number; projects: Project[] }> = {};

      result.data.forEach(project => {
        if (project.tech_stack) {
          try {
            const techs = JSON.parse(project.tech_stack);
            if (Array.isArray(techs)) {
              techs.forEach(tech => {
                if (!techCounts[tech]) {
                  techCounts[tech] = { count: 0, projects: [] };
                }
                techCounts[tech].count++;
              });
            }
          } catch (error) {
            // 忽略JSON解析错误
          }
        }
      });

      // 构建结果
      const stats: TechStats[] = [];
      for (const [tech, data] of Object.entries(techCounts)) {
        // 获取使用该技术的项目
        const projectsResult = await executeQuery<Project>(
          this.env,
          `
            SELECT id, title, slug FROM projects
            WHERE JSON_EXTRACT(tech_stack, '$') LIKE ?
            ORDER BY created_at DESC
            LIMIT 3
          `,
          [`%${tech}%`]
        );

        const projects = projectsResult.success ? projectsResult.data || [] : [];

        stats.push({
          tech,
          count: data.count,
          projects
        });
      }

      // 按使用次数排序
      stats.sort((a, b) => b.count - a.count);

      await setCache(this.env, cacheKey, stats, 1800); // 30分钟缓存
      return stats;
    }

    return [];
  }

  // 清除相关缓存
  async clearProjectCache(slug?: string): Promise<void> {
    if (slug) {
      await deleteCache(this.env, ProjectCacheKeys.detail(slug));
    }
    await deleteCacheByPrefix(this.env, 'projects:list');
    await deleteCache(this.env, ProjectCacheKeys.techStats());
  }
}
