import { Env, SearchRequest, SearchResponse, SearchResult } from '../types';
import { executeQuery } from './database';
import { SearchCacheKeys, getCache, setCache } from '../utils/cache';

export class SearchService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // 全站搜索
  async search(query: SearchRequest): Promise<SearchResponse> {
    const cacheKey = SearchCacheKeys.results(query.query, query.type || 'all', query.page || 1);
    const cached = await getCache<SearchResponse>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, type = 'all' } = query;
    const searchTerm = `%${query.query}%`;
    const offset = (page - 1) * limit;

    const results: SearchResult[] = [];
    let total = 0;

    // 搜索文章
    if (type === 'all' || type === 'posts') {
      const postsResult = await executeQuery(
        this.env,
        `
          SELECT
            id, title, excerpt, slug, published_at,
            'post' as type,
            CASE
              WHEN title LIKE ? THEN 10
              WHEN content LIKE ? THEN 5
              WHEN excerpt LIKE ? THEN 7
              ELSE 3
            END as score
          FROM posts
          WHERE is_published = 1 AND (
            title LIKE ? OR content LIKE ? OR excerpt LIKE ?
          )
          ORDER BY score DESC, published_at DESC
          LIMIT ?
          OFFSET ?
        `,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
      );

      if (postsResult.success && postsResult.data) {
        results.push(
          ...postsResult.data.map((row: any) => ({
            type: 'post' as const,
            id: row.id,
            title: row.title,
            excerpt: row.excerpt,
            slug: row.slug,
            score: row.score
          }))
        );
      }

      // 获取文章总数
      if (page === 1) {
        const countResult = await executeQueryFirst<{ count: number }>(
          this.env,
          `
            SELECT COUNT(*) as count FROM posts
            WHERE is_published = 1 AND (
              title LIKE ? OR content LIKE ? OR excerpt LIKE ?
            )
          `,
          [searchTerm, searchTerm, searchTerm]
        );
        total += countResult.success ? countResult.data?.count || 0 : 0;
      }
    }

    // 搜索项目
    if (type === 'all' || type === 'projects') {
      const projectsResult = await executeQuery(
        this.env,
        `
          SELECT
            id, title, description, slug, created_at,
            'project' as type,
            CASE
              WHEN title LIKE ? THEN 10
              WHEN description LIKE ? THEN 5
              ELSE 3
            END as score
          FROM projects
          WHERE title LIKE ? OR description LIKE ?
          ORDER BY score DESC, created_at DESC
          LIMIT ?
          OFFSET ?
        `,
        [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset]
      );

      if (projectsResult.success && projectsResult.data) {
        results.push(
          ...projectsResult.data.map((row: any) => ({
            type: 'project' as const,
            id: row.id,
            title: row.title,
            excerpt: row.description,
            slug: row.slug,
            score: row.score
          }))
        );
      }

      // 获取项目总数
      if (page === 1) {
        const countResult = await executeQueryFirst<{ count: number }>(
          this.env,
          `
            SELECT COUNT(*) as count FROM projects
            WHERE title LIKE ? OR description LIKE ?
          `,
          [searchTerm, searchTerm]
        );
        total += countResult.success ? countResult.data?.count || 0 : 0;
      }
    }

    // 如果是混合搜索，需要重新计算分页
    if (type === 'all') {
      // 获取准确的总数
      const exactTotalResult = await executeQueryFirst<{ count: number }>(
        this.env,
        `
          SELECT COUNT(*) as count FROM (
            SELECT id FROM posts
            WHERE is_published = 1 AND (
              title LIKE ? OR content LIKE ? OR excerpt LIKE ?
            )
            UNION ALL
            SELECT id FROM projects
            WHERE title LIKE ? OR description LIKE ?
          )
        `,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      total = exactTotalResult.success ? exactTotalResult.data?.count || 0 : 0;
    }

    // 排序所有结果
    results.sort((a, b) => b.score - a.score);

    // 分页处理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    const totalPages = Math.ceil(total / limit);

    const response: SearchResponse = {
      results: paginatedResults,
      total,
      page,
      limit,
      totalPages
    };

    // 缓存结果
    await setCache(this.env, cacheKey, response, 180); // 3分钟缓存

    return response;
  }

  // 获取搜索建议
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;
    const suggestions = new Set<string>();

    // 从文章标题中获取建议
    const postsResult = await executeQuery(
      this.env,
      `
        SELECT DISTINCT title FROM posts
        WHERE is_published = 1 AND title LIKE ?
        ORDER BY view_count DESC
        LIMIT ?
      `,
      [searchTerm, limit]
    );

    if (postsResult.success && postsResult.data) {
      postsResult.data.forEach((row: any) => {
        if (row.title) suggestions.add(row.title);
      });
    }

    // 从项目标题中获取建议
    const projectsResult = await executeQuery(
      this.env,
      `
        SELECT DISTINCT title FROM projects
        WHERE title LIKE ?
        ORDER BY star_count DESC
        LIMIT ?
      `,
      [searchTerm, limit]
    );

    if (projectsResult.success && projectsResult.data) {
      projectsResult.data.forEach((row: any) => {
        if (row.title) suggestions.add(row.title);
      });
    }

    return Array.from(suggestions).slice(0, limit);
  }

  // 热门搜索关键词
  async getPopularSearchTerms(_limit: number = 10): Promise<string[]> {
    // 这里可以从分析数据中获取热门搜索词
    // 目前返回一些默认的热门词汇
    return [
      'JavaScript',
      'React',
      'TypeScript',
      'Node.js',
      'Vue.js',
      'Python',
      'Docker',
      'Kubernetes',
      'Web开发',
      '前端开发'
    ];
  }
}

// 需要导入的函数
async function executeQueryFirst<T>(env: Env, query: string, params: any[]) {
  const stmt = env.SHARED_DB.prepare(query);
  try {
    const result = await stmt.bind(...params).first();
    return { success: true, data: result as T };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
