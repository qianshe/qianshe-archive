import {
  Env,
  BlogPost,
  BlogPostQuery,
  RelatedPost,
  BlogArchive,
  TagStats,
  CategoryStats
} from '../types';
import {
  executeQuery,
  executeQueryFirst,
  buildOrderByClause,
  buildPaginationClause
} from './database';
import {
  PostCacheKeys,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPrefix
} from '../utils/cache';

export class PostService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // 获取文章列表
  async getPosts(query: BlogPostQuery): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const cacheKey = PostCacheKeys.list(JSON.stringify(query));
    const cached = await getCache<any>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, ...filters } = query;

    // 构建WHERE条件
    const conditions: Record<string, any> = {};
    if (filters.category) conditions.category = filters.category;
    if (filters.featured !== undefined) conditions.is_featured = filters.featured;
    if (filters.tags && filters.tags.length > 0) {
      // 多标签查询需要特殊处理
      conditions.tag_query = filters.tags.join(',');
    }
    if (filters.search) {
      conditions.search_query = `%${filters.search}%`;
    }

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as count FROM posts WHERE is_published = 1';
    const countParams: any[] = [1];
    let dataQuery = `
      SELECT
        id, title, slug, category, tags, excerpt, cover_image,
        view_count, like_count, comment_count, is_featured,
        published_at, created_at, updated_at
      FROM posts
      WHERE is_published = 1
    `;
    const dataParams: any[] = [1];

    if (filters.search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)';
      countParams.push(filters.search, filters.search, filters.search);
      dataQuery += ' AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)';
      dataParams.push(filters.search, filters.search, filters.search);
    }

    if (filters.category) {
      countQuery += ' AND category = ?';
      countParams.push(filters.category);
      dataQuery += ' AND category = ?';
      dataParams.push(filters.category);
    }

    if (filters.featured !== undefined) {
      countQuery += ' AND is_featured = ?';
      countParams.push(filters.featured);
      dataQuery += ' AND is_featured = ?';
      dataParams.push(filters.featured);
    }

    // 标签查询需要使用JSON_EXTRACT
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map(tag => `JSON_EXTRACT(tags, '$') LIKE '%${tag}%'`)
        .join(' OR ');
      countQuery += ` AND (${tagConditions})`;
      dataQuery += ` AND (${tagConditions})`;
    }

    const orderBy = buildOrderByClause(
      filters.sort_by || 'published_at',
      filters.sort_order || 'desc'
    );
    const pagination = buildPaginationClause(page, limit);

    const [countResult, dataResult] = await Promise.all([
      executeQueryFirst<{ count: number }>(this.env, countQuery, countParams),
      executeQuery(this.env, `${dataQuery} ${orderBy} ${pagination}`, dataParams)
    ]);

    if (!countResult.success || !dataResult.success) {
      throw new Error('Failed to fetch posts');
    }

    const total = countResult.data?.count || 0;
    const posts = dataResult.data as BlogPost[];
    const totalPages = Math.ceil(total / limit);

    const result = {
      posts,
      total,
      page,
      limit,
      totalPages
    };

    // 缓存结果
    await setCache(this.env, cacheKey, result, 300); // 5分钟缓存

    return result;
  }

  // 获取文章详情
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const cacheKey = PostCacheKeys.detail(slug);
    const cached = await getCache<BlogPost>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQueryFirst<BlogPost>(
      this.env,
      `
        SELECT * FROM posts
        WHERE slug = ? AND is_published = 1
      `,
      [slug]
    );

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 600); // 10分钟缓存
      return result.data;
    }

    return null;
  }

  // 获取相关文章
  async getRelatedPosts(slug: string, limit: number = 3): Promise<RelatedPost[]> {
    const cacheKey = PostCacheKeys.related(slug);
    const cached = await getCache<RelatedPost[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    // 首先获取当前文章的标签和分类
    const currentPost = await this.getPostBySlug(slug);
    if (!currentPost) {
      return [];
    }

    // 根据标签和分类查找相关文章
    let query = `
      SELECT
        id, title, slug, excerpt, cover_image, published_at
      FROM posts
      WHERE id != ? AND is_published = 1
    `;
    const params: any[] = [currentPost.id];

    if (currentPost.category) {
      query += ' AND category = ?';
      params.push(currentPost.category);
    }

    query += ' ORDER BY published_at DESC LIMIT ?';
    params.push(limit);

    const result = await executeQuery<RelatedPost>(this.env, query, params);

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 300); // 5分钟缓存
      return result.data;
    }

    return [];
  }

  // 获取文章归档
  async getArchive(): Promise<BlogArchive[]> {
    const cacheKey = PostCacheKeys.archive();
    const cached = await getCache<BlogArchive[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<BlogArchive>(
      this.env,
      `
        SELECT
          strftime('%Y', published_at) as year,
          strftime('%m', published_at) as month,
          COUNT(*) as count
        FROM posts
        WHERE is_published = 1
        GROUP BY year, month
        ORDER BY year DESC, month DESC
      `
    );

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 3600); // 1小时缓存
      return result.data;
    }

    return [];
  }

  // 获取标签统计
  async getTagStats(): Promise<TagStats[]> {
    const cacheKey = PostCacheKeys.tagsStats();
    const cached = await getCache<TagStats[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<{ tags: string }>(
      this.env,
      `
        SELECT tags FROM posts
        WHERE is_published = 1 AND tags IS NOT NULL
      `
    );

    if (result.success && result.data) {
      // 统计标签
      const tagCounts: Record<string, number> = {};
      result.data.forEach(post => {
        if (post.tags) {
          try {
            const tags = JSON.parse(post.tags);
            if (Array.isArray(tags)) {
              tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          } catch (error) {
            // 忽略JSON解析错误
          }
        }
      });

      const stats: TagStats[] = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      await setCache(this.env, cacheKey, stats, 1800); // 30分钟缓存
      return stats;
    }

    return [];
  }

  // 获取分类统计
  async getCategoryStats(): Promise<CategoryStats[]> {
    const cacheKey = PostCacheKeys.categoriesStats();
    const cached = await getCache<CategoryStats[]>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const result = await executeQuery<CategoryStats>(
      this.env,
      `
        SELECT
          category,
          COUNT(*) as count
        FROM posts
        WHERE is_published = 1
        GROUP BY category
        ORDER BY count DESC
      `
    );

    if (result.success && result.data) {
      await setCache(this.env, cacheKey, result.data, 1800); // 30分钟缓存
      return result.data;
    }

    return [];
  }

  // 增加浏览量
  async incrementViewCount(id: number): Promise<void> {
    await this.env.SHARED_DB.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?')
      .bind(id)
      .run();
  }

  // 清除相关缓存
  async clearPostCache(slug?: string): Promise<void> {
    if (slug) {
      await deleteCache(this.env, PostCacheKeys.detail(slug));
      await deleteCache(this.env, PostCacheKeys.related(slug));
    }
    await deleteCacheByPrefix(this.env, 'posts:list');
    await deleteCache(this.env, PostCacheKeys.archive());
    await deleteCache(this.env, PostCacheKeys.tagsStats());
    await deleteCache(this.env, PostCacheKeys.categoriesStats());
  }
}
