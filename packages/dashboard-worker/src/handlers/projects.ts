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

const projectRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 项目创建/更新验证模式
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  cover_image: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'private', 'archived']),
  category: z.string().optional(),
  tags: z.string().optional(), // JSON string array
  tech_stack: z.string().optional(), // JSON string array
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
  published_at: z.string().optional()
});

// 查询参数验证模式
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'private', 'archived']).optional(),
  category: z.string().optional(),
  sort_by: z
    .enum(['created_at', 'updated_at', 'published_at', 'title', 'sort_order'])
    .default('sort_order'),
  sort_order: z.enum(['asc', 'desc']).default('asc')
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

// 获取项目列表
projectRoutes.get('/', async c => {
  try {
    const query = querySchema.parse(queryParamsToObject(c.req.queries()));
    const user = c.get('user');

    // 构建WHERE条件
    const conditions = [];
    const params = [];

    // 非管理员只能看到自己的项目和已发布的项目
    if (user.role !== 'admin') {
      conditions.push('(author_id = ? OR status = "published")');
      params.push(user.userId);
    }

    if (query.search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR content LIKE ?)');
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
      SELECT COUNT(*) as total FROM projects
      ${whereClause}
    `;
    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...params)
      .first();
    const total = (countResult as any)?.total || 0;

    // 获取项目列表
    const projectsQuery = `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.${query.sort_by} ${query.sort_order}
      LIMIT ? OFFSET ?
    `;

    const projects = await c.env.DB.prepare(projectsQuery)
      .bind(...params, query.limit, (query.page - 1) * query.limit)
      .all();

    return c.json({
      success: true,
      data: {
        projects: projects.results,
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

// 获取单个项目
projectRoutes.get('/:id', async c => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid project ID');
  }

  const project = await c.env.DB.prepare(
    `
    SELECT
      p.*,
      u.username as author_name,
      u.avatar_url as author_avatar
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `
  )
    .bind(id)
    .first();

  if (!project) {
    throw createError.notFound('Project not found');
  }

  // 检查权限：只有作者和管理员可以查看非公开项目
  if (
    (project as any).status !== 'published' &&
    (project as any).author_id !== user.userId &&
    user.role !== 'admin'
  ) {
    throw createError.forbidden('You do not have permission to view this project');
  }

  return c.json({
    success: true,
    data: { project }
  });
});

// 创建项目
projectRoutes.post('/', async c => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const projectData = projectSchema.parse(body);

    // 检查slug唯一性
    const existingProject = await c.env.DB.prepare(
      `
      SELECT id FROM projects WHERE slug = ?
    `
    )
      .bind(projectData.slug)
      .first();

    if (existingProject) {
      throw createError.conflict('Project with this slug already exists');
    }

    // 插入项目
    const result = await c.env.DB.prepare(
      `
      INSERT INTO projects (
        title, slug, description, content, cover_image, demo_url, github_url,
        status, category, tags, tech_stack, meta_description, meta_keywords,
        is_featured, sort_order, author_id, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `
    )
      .bind(
        projectData.title,
        projectData.slug,
        projectData.description,
        projectData.content,
        projectData.cover_image || '',
        projectData.demo_url || '',
        projectData.github_url || '',
        projectData.status,
        projectData.category || '',
        projectData.tags || '[]',
        projectData.tech_stack || '[]',
        projectData.meta_description || '',
        projectData.meta_keywords || '',
        projectData.is_featured ? 1 : 0,
        projectData.sort_order,
        user.userId,
        projectData.status === 'published' ? new Date().toISOString() : null
      )
      .run();

    // 获取创建的项目
    const newProject = await c.env.DB.prepare(
      `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(
      {
        success: true,
        data: { project: newProject }
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 更新项目
projectRoutes.put('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user');
    const body = await c.req.json();
    const projectData = projectSchema.parse(body);

    if (isNaN(id)) {
      throw createError.badRequest('Invalid project ID');
    }

    // 检查项目是否存在
    const existingProject = await c.env.DB.prepare(
      `
      SELECT id, author_id FROM projects WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!existingProject) {
      throw createError.notFound('Project not found');
    }

    // 检查权限
    const canEdit = await canAccessResource(c as any, 'project', id);
    if (!canEdit) {
      throw createError.forbidden('You do not have permission to edit this project');
    }

    // 如果更改了slug，检查新slug的唯一性
    if (projectData.slug !== (existingProject as any).slug) {
      const slugExists = await c.env.DB.prepare(
        `
        SELECT id FROM projects WHERE slug = ? AND id != ?
      `
      )
        .bind(projectData.slug, id)
        .first();

      if (slugExists) {
        throw createError.conflict('Project with this slug already exists');
      }
    }

    // 更新项目
    await c.env.DB.prepare(
      `
      UPDATE projects SET
        title = ?, slug = ?, description = ?, content = ?, cover_image = ?,
        demo_url = ?, github_url = ?, status = ?, category = ?, tags = ?,
        tech_stack = ?, meta_description = ?, meta_keywords = ?, is_featured = ?,
        sort_order = ?, updated_at = datetime('now'),
        published_at = CASE
          WHEN published_at IS NULL AND status = 'published' THEN datetime('now')
          WHEN published_at IS NOT NULL AND status != 'published' THEN NULL
          ELSE published_at
        END
      WHERE id = ?
    `
    )
      .bind(
        projectData.title,
        projectData.slug,
        projectData.description,
        projectData.content,
        projectData.cover_image || '',
        projectData.demo_url || '',
        projectData.github_url || '',
        projectData.status,
        projectData.category || '',
        projectData.tags || '[]',
        projectData.tech_stack || '[]',
        projectData.meta_description || '',
        projectData.meta_keywords || '',
        projectData.is_featured ? 1 : 0,
        projectData.sort_order,
        id
      )
      .run();

    // 获取更新后的项目
    const updatedProject = await c.env.DB.prepare(
      `
      SELECT
        p.*,
        u.username as author_name,
        u.avatar_url as author_avatar
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `
    )
      .bind(id)
      .first();

    return c.json({
      success: true,
      data: { project: updatedProject }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除项目
projectRoutes.delete('/:id', async c => {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw createError.badRequest('Invalid project ID');
  }

  // 检查项目是否存在
  const existingProject = await c.env.DB.prepare(
    `
    SELECT id FROM projects WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!existingProject) {
    throw createError.notFound('Project not found');
  }

  // 检查权限
  const canDelete = await canAccessResource(c as any, 'project', id);
  if (!canDelete) {
    throw createError.forbidden('You do not have permission to delete this project');
  }

  // 软删除：将状态设置为archived
  await c.env.DB.prepare(
    `
    UPDATE projects SET status = 'archived', updated_at = datetime('now') WHERE id = ?
  `
  )
    .bind(id)
    .run();

  return c.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// 批量操作
projectRoutes.post('/batch', async c => {
  try {
    const body = await c.req.json();
    const { action, projectIds } = z
      .object({
        action: z.enum(['delete', 'publish', 'draft', 'archive']),
        projectIds: z.array(z.number()).min(1)
      })
      .parse(body);

    const user = c.get('user');
    const results = [];

    for (const projectId of projectIds) {
      try {
        // 检查权限
        const canModify = await canAccessResource(c as any, 'project', projectId);
        if (!canModify) {
          results.push({ id: projectId, success: false, error: 'Permission denied' });
          continue;
        }

        // 执行操作
        let updateQuery = '';
        switch (action) {
          case 'delete':
            updateQuery =
              'UPDATE projects SET status = "archived", updated_at = datetime("now") WHERE id = ?';
            break;
          case 'publish':
            updateQuery =
              'UPDATE projects SET status = "published", published_at = datetime("now"), updated_at = datetime("now") WHERE id = ?';
            break;
          case 'draft':
            updateQuery =
              'UPDATE projects SET status = "draft", updated_at = datetime("now") WHERE id = ?';
            break;
          case 'archive':
            updateQuery =
              'UPDATE projects SET status = "archived", updated_at = datetime("now") WHERE id = ?';
            break;
        }

        await c.env.DB.prepare(updateQuery).bind(projectId).run();
        results.push({ id: projectId, success: true });
      } catch (error) {
        results.push({ id: projectId, success: false, error: 'Operation failed' });
      }
    }

    return c.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

export { projectRoutes };
