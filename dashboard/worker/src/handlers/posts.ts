import { Hono } from 'hono';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { requireRole, canAccessResource } from '../middleware/auth';
import type {
  DashboardBlogPost,
  DashboardEnv,
  BlogQueryParams,
  BlogListResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  AdminUser
} from '../types';
import type {
  BlogStatus,
  BlogCategory,
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,
  PaginationMeta
} from '../types/local-shared';

const postRoutes = new Hono<{
  Bindings: DashboardEnv;
  Variables: {
    user: AdminUser;
  }
}>();

// 文章创建/更新验证模式
const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'private', 'archived']),
  category: z.enum(['blog', 'project', 'announcement']).optional(),
  tags: z.string().optional(), // JSON string array
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  reading_time: z.number().min(0).optional(),
  is_featured: z.boolean().default(false),
  published_at: z.string().optional()
});

// 查询参数验证模式
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'private', 'archived']).optional(),
  category: z.enum(['blog', 'project', 'announcement']).optional(),
  sort_by: z
    .enum(['created_at', 'updated_at', 'published_at', 'title', 'view_count'])
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// 辅助函数：将查询参数记录转换为普通对象
function queryParamsToObject(queries: Record<string, string[]>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, values] of Object.entries(queries)) {
    // 对于数组类型的查询参数，取第一个值
    result[key] = values[0] || '';
  }
  return result;
}

// 数据库结果转换为DashboardBlogPost
interface DatabaseBlogPost extends Record<string, unknown> {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  category_id?: number;
  tags?: string;
  status: string;
  is_featured: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author_id?: number;
  author_name?: string;
  author_avatar?: string;
}

function mapDbRowToBlogPost(row: Record<string, unknown>): DashboardBlogPost {
  return {
    id: row.id as number,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    excerpt: row.excerpt as string,
    featured_image: row.featured_image as string,
    category: {
      id: parseInt(String(row.category_id)) || 1,
      name: row.category as string,
      slug: (row.category as string)?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
      description: '',
      created_at: new Date().toISOString()
    },
    tags: JSON.parse(String(row.tags || '[]')),
    status: row.status as BlogStatus,
    is_featured: Boolean(row.is_featured),
    view_count: row.view_count as number || 0,
    like_count: row.like_count as number || 0,
    comment_count: row.comment_count as number || 0,
    published_at: row.published_at as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author_id: row.author_id as number,
    author_name: row.author_name as string,
    author_avatar: row.author_avatar as string
  };
}

// 获取文章列表
postRoutes.get('/', async (c) => {
  try {
    const query = querySchema.parse(queryParamsToObject(c.req.queries()));
    const user = c.get('user');

    // 构建WHERE条件
    const conditions = [];
    const params = [];

    // 非管理员只能看到自己的文章和已发布的文章
    if (user.role !== 'admin') {
      conditions.push('(author_id = ? OR status = "published")');
      params.push(user.userId);
    }

    if (query.search) {
      conditions.push('(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)');
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }

    if (query.category) {
      conditions.push('category = ?');
      params.push(query.category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM posts
      ${whereClause}
    `;
    const countResult = await c.env.SHARED_DB.prepare(countQuery)
      .bind(...params)
      .first();
    const total = (countResult as { total?: number })?.total || 0;

    // 计算分页信息
    const totalPages = Math.ceil(total / query.limit);
    const pagination: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1
    };

    // 获取文章列表
    const postsQuery = `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.${query.sort_by} ${query.sort_order}
      LIMIT ? OFFSET ?
    `;

    const postsResult = await c.env.SHARED_DB.prepare(postsQuery)
      .bind(...params, query.limit, (query.page - 1) * query.limit)
      .all();

    const posts = postsResult.results.map(mapDbRowToBlogPost);

    const response: BlogListResponse = {
      success: true,
      data: posts,
      pagination
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Invalid query parameters',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取单篇文章
postRoutes.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid post ID');
  }

  const postResult = await c.env.SHARED_DB.prepare(
    `
    SELECT
      p.*,
      u.username as author_name,
      u.avatar_url as author_avatar
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `
  )
    .bind(id)
    .first();

  if (!postResult) {
    throw createError.notFound('Post not found');
  }

  const post = mapDbRowToBlogPost(postResult);

  // 检查权限：只有作者和管理员可以查看非公开文章
  if (
    post.status !== 'published' &&
    post.author_id !== user.userId &&
    user.role !== 'admin'
  ) {
    throw createError.forbidden('You do not have permission to view this post');
  }

  const response: ApiResponse<{ post: DashboardBlogPost }> = {
    success: true,
    data: { post },
    timestamp: Date.now()
  };

  return c.json(response);
});

// 创建文章
postRoutes.post('/', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const postData = postSchema.parse(body);

    // 检查slug唯一性
    const existingPost = await c.env.SHARED_DB.prepare(
      `
      SELECT id FROM posts WHERE slug = ?
    `
    )
      .bind(postData.slug)
      .first();

    if (existingPost) {
      throw createError.conflict('Post with this slug already exists');
    }

    // 自动生成阅读时间（如果未提供）
    if (!postData.reading_time) {
      const wordsPerMinute = 200;
      const wordCount = postData.content.split(/\s+/).length;
      postData.reading_time = Math.ceil(wordCount / wordsPerMinute);
    }

    // 插入文章
    const result = await c.env.SHARED_DB.prepare(
      `
      INSERT INTO posts (
        title, slug, excerpt, content, featured_image, status, category,
        tags, meta_description, meta_keywords, reading_time, is_featured,
        author_id, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `
    )
      .bind(
        postData.title,
        postData.slug,
        postData.excerpt || '',
        postData.content,
        postData.featured_image || '',
        postData.status,
        postData.category || 'blog',
        postData.tags || '[]',
        postData.meta_description || '',
        postData.meta_keywords || '',
        postData.reading_time,
        postData.is_featured ? 1 : 0,
        user.userId,
        postData.status === 'published' ? new Date().toISOString() : null
      )
      .run();

    // 获取创建的文章
    const newPostResult = await c.env.SHARED_DB.prepare(
      `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `
    )
      .bind(result.meta.last_row_id)
      .first();

    const newPost = mapDbRowToBlogPost(newPostResult);

    const response: ApiResponse<{ post: DashboardBlogPost }> = {
      success: true,
      data: { post: newPost },
      timestamp: Date.now()
    };

    return c.json(response, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 更新文章
postRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user');
    const body = await c.req.json();
    const postData = postSchema.parse(body);

    if (isNaN(id)) {
      throw createError.badRequest('Invalid post ID');
    }

    // 检查文章是否存在
    const existingPostResult = await c.env.SHARED_DB.prepare(
      `
      SELECT id, author_id, slug FROM posts WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!existingPostResult) {
      throw createError.notFound('Post not found');
    }

    // 检查权限
    const canEdit = await canAccessResource(c, 'post', id);
    if (!canEdit) {
      throw createError.forbidden('You do not have permission to edit this post');
    }

    // 如果更改了slug，检查新slug的唯一性
    if (postData.slug !== (existingPostResult as { slug: string }).slug) {
      const slugExists = await c.env.SHARED_DB.prepare(
        `
        SELECT id FROM posts WHERE slug = ? AND id != ?
      `
      )
        .bind(postData.slug, id)
        .first();

      if (slugExists) {
        throw createError.conflict('Post with this slug already exists');
      }
    }

    // 自动生成阅读时间（如果未提供）
    if (!postData.reading_time) {
      const wordsPerMinute = 200;
      const wordCount = postData.content.split(/\s+/).length;
      postData.reading_time = Math.ceil(wordCount / wordsPerMinute);
    }

    // 更新文章
    await c.env.SHARED_DB.prepare(
      `
      UPDATE posts SET
        title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?,
        status = ?, category = ?, tags = ?, meta_description = ?,
        meta_keywords = ?, reading_time = ?, is_featured = ?,
        updated_at = datetime('now'),
        published_at = CASE
          WHEN published_at IS NULL AND status = 'published' THEN datetime('now')
          WHEN published_at IS NOT NULL AND status != 'published' THEN NULL
          ELSE published_at
        END
      WHERE id = ?
    `
    )
      .bind(
        postData.title,
        postData.slug,
        postData.excerpt || '',
        postData.content,
        postData.featured_image || '',
        postData.status,
        postData.category || 'blog',
        postData.tags || '[]',
        postData.meta_description || '',
        postData.meta_keywords || '',
        postData.reading_time,
        postData.is_featured ? 1 : 0,
        id
      )
      .run();

    // 获取更新后的文章
    const updatedPostResult = await c.env.SHARED_DB.prepare(
      `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `
    )
      .bind(id)
      .first();

    const updatedPost = mapDbRowToBlogPost(updatedPostResult);

    const response: ApiResponse<{ post: DashboardBlogPost }> = {
      success: true,
      data: { post: updatedPost },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除文章
postRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw createError.badRequest('Invalid post ID');
  }

  // 检查文章是否存在
  const existingPost = await c.env.SHARED_DB.prepare(
    `
    SELECT id FROM posts WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!existingPost) {
    throw createError.notFound('Post not found');
  }

  // 检查权限
  const canDelete = await canAccessResource(c, 'post', id);
  if (!canDelete) {
    throw createError.forbidden('You do not have permission to delete this post');
  }

  // 软删除：将状态设置为archived
  await c.env.SHARED_DB.prepare(
    `
    UPDATE posts SET status = 'archived', updated_at = datetime('now') WHERE id = ?
  `
  )
    .bind(id)
    .run();

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Post deleted successfully',
    timestamp: Date.now()
  };

  return c.json(response);
});

// 批量操作
postRoutes.post('/batch', async (c) => {
  try {
    const body = await c.req.json();
    const { action, postIds } = z
      .object({
        action: z.enum(['delete', 'publish', 'draft', 'archive']),
        postIds: z.array(z.number()).min(1)
      })
      .parse(body);

    const user = c.get('user');
    const results = [];

    for (const postId of postIds) {
      try {
        // 检查权限
        const canModify = await canAccessResource(c, 'post', postId);
        if (!canModify) {
          results.push({ id: postId, success: false, error: 'Permission denied' });
          continue;
        }

        // 执行操作
        let updateQuery = '';
        switch (action) {
          case 'delete':
            updateQuery =
              'UPDATE posts SET status = "archived", updated_at = datetime("now") WHERE id = ?';
            break;
          case 'publish':
            updateQuery =
              'UPDATE posts SET status = "published", published_at = datetime("now"), updated_at = datetime("now") WHERE id = ?';
            break;
          case 'draft':
            updateQuery =
              'UPDATE posts SET status = "draft", updated_at = datetime("now") WHERE id = ?';
            break;
          case 'archive':
            updateQuery =
              'UPDATE posts SET status = "archived", updated_at = datetime("now") WHERE id = ?';
            break;
        }

        await c.env.SHARED_DB.prepare(updateQuery).bind(postId).run();
        results.push({ id: postId, success: true });
      } catch (error) {
        results.push({ id: postId, success: false, error: 'Operation failed' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;

    const response: ApiResponse<{ results: Array<{ id: number; success: boolean; error?: string }> }> = {
      success: true,
      data: { results },
      timestamp: Date.now()
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { errors: error.errors },
        timestamp: Date.now()
      };
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

export { postRoutes };