import { Hono } from 'hono';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { canAccessResource } from '../middleware/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  ENVIRONMENT: string;
};

type Variables = {
  user: any; // 这里应该使用具体的用户类型，但为了快速修复先使用any
};

const commentRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 查询参数验证模式
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  search: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'spam']).optional(),
  post_id: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  sort_by: z.enum(['created_at', 'updated_at']).default('created_at'),
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

// 获取评论列表
commentRoutes.get('/', async c => {
  try {
    const query = querySchema.parse(queryParamsToObject(c.req.queries()));
    const user = c.get('user');

    // 构建WHERE条件
    const conditions = [];
    const params = [];

    if (query.search) {
      conditions.push('(content LIKE ? OR author_name LIKE ? OR author_email LIKE ?)');
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (query.status) {
      conditions.push('c.status = ?');
      params.push(query.status);
    }

    if (query.post_id) {
      conditions.push('c.post_id = ?');
      params.push(query.post_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM comments c
      ${whereClause}
    `;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first();
    const total = (countResult as any)?.total || 0;

    // 获取评论列表
    const commentsQuery = `
      SELECT
        c.*,
        p.title as post_title,
        p.slug as post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      ${whereClause}
      ORDER BY c.${query.sort_by} ${query.sort_order}
      LIMIT ? OFFSET ?
    `;

    const comments = await c.env.DB.prepare(commentsQuery)
      .bind(...params, query.limit, (query.page - 1) * query.limit)
      .all();

    return c.json({
      success: true,
      data: {
        comments: comments.results,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit)
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取单条评论
commentRoutes.get('/:id', async c => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw createError.badRequest('Invalid comment ID');
  }

  const comment = await c.env.DB.prepare(
    `
    SELECT
      c.*,
      p.title as post_title,
      p.slug as post_slug
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.id
    WHERE c.id = ?
  `
  )
    .bind(id)
    .first();

  if (!comment) {
    throw createError.notFound('Comment not found');
  }

  return c.json({
    success: true,
    data: { comment }
  });
});

// 审核评论
commentRoutes.put('/:id/status', async c => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { status } = z
      .object({
        status: z.enum(['approved', 'rejected', 'spam'])
      })
      .parse(body);

    if (isNaN(id)) {
      throw createError.badRequest('Invalid comment ID');
    }

    // 检查评论是否存在
    const existingComment = await c.env.DB.prepare(
      `
      SELECT id FROM comments WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!existingComment) {
      throw createError.notFound('Comment not found');
    }

    // 更新评论状态
    await c.env.DB.prepare(
      `
      UPDATE comments SET
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `
    )
      .bind(status, id)
      .run();

    // 获取更新后的评论
    const updatedComment = await c.env.DB.prepare(
      `
      SELECT
        c.*,
        p.title as post_title,
        p.slug as post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.id = ?
    `
    )
      .bind(id)
      .first();

    return c.json({
      success: true,
      data: { comment: updatedComment },
      message: `Comment ${status} successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 批量审核评论
commentRoutes.post('/batch-moderate', async c => {
  try {
    const body = await c.req.json();
    const { action, commentIds } = z
      .object({
        action: z.enum(['approve', 'reject', 'spam', 'delete']),
        commentIds: z.array(z.number()).min(1)
      })
      .parse(body);

    const results = [];

    for (const commentId of commentIds) {
      try {
        // 检查评论是否存在
        const exists = await c.env.DB.prepare(
          `
          SELECT id FROM comments WHERE id = ?
        `
        )
          .bind(commentId)
          .first();

        if (!exists) {
          results.push({ id: commentId, success: false, error: 'Comment not found' });
          continue;
        }

        // 执行操作
        switch (action) {
          case 'approve':
            await c.env.DB.prepare(
              `
              UPDATE comments SET status = 'approved', updated_at = datetime('now') WHERE id = ?
            `
            )
              .bind(commentId)
              .run();
            break;
          case 'reject':
            await c.env.DB.prepare(
              `
              UPDATE comments SET status = 'rejected', updated_at = datetime('now') WHERE id = ?
            `
            )
              .bind(commentId)
              .run();
            break;
          case 'spam':
            await c.env.DB.prepare(
              `
              UPDATE comments SET status = 'spam', updated_at = datetime('now') WHERE id = ?
            `
            )
              .bind(commentId)
              .run();
            break;
          case 'delete':
            await c.env.DB.prepare(
              `
              DELETE FROM comments WHERE id = ?
            `
            )
              .bind(commentId)
              .run();
            break;
        }

        results.push({ id: commentId, success: true });
      } catch (error) {
        results.push({ id: commentId, success: false, error: 'Operation failed' });
      }
    }

    return c.json({
      success: true,
      data: { results },
      message: `${action} ${results.filter(r => r.success).length} comments successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除评论
commentRoutes.delete('/:id', async c => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw createError.badRequest('Invalid comment ID');
  }

  // 检查评论是否存在
  const existingComment = await c.env.DB.prepare(
    `
    SELECT id FROM comments WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!existingComment) {
    throw createError.notFound('Comment not found');
  }

  // 删除评论
  await c.env.DB.prepare(
    `
    DELETE FROM comments WHERE id = ?
  `
  )
    .bind(id)
    .run();

  return c.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// 获取评论统计
commentRoutes.get('/stats/overview', async c => {
  const stats = await c.env.DB.prepare(
    `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COUNT(CASE WHEN status = 'spam' THEN 1 END) as spam,
      COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as this_week,
      COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as this_month
    FROM comments
  `
  ).first();

  return c.json({
    success: true,
    data: { stats }
  });
});

export { commentRoutes };
