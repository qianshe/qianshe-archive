import { Hono } from 'hono';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import type { UserRole, DashboardEnv } from '../types';

// 用户类型定义
type User = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  userId: number;
};

const uploadRoutes = new Hono<{
  Bindings: DashboardEnv;
  Variables: {
    user: User;
  };
}>();

// 允许的文件类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/json'
];

// 文件大小限制（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 获取文件列表
uploadRoutes.get('/', async c => {
  try {
    // 正确处理查询参数
    const queries = c.req.queries();
    const queryObj: Record<string, string> = {};

    // 将查询参数对象转换为可迭代的格式
    for (const [key, values] of Object.entries(queries)) {
      queryObj[key] = values[0] || ''; // 取第一个值
    }

    const query = z
      .object({
        page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
        limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20'),
        search: z.string().optional(),
        mime_type: z.string().optional(),
        is_public: z
          .string()
          .transform(val => val === 'true')
          .optional(),
        sort_by: z.enum(['created_at', 'filename', 'size']).default('created_at'),
        sort_order: z.enum(['asc', 'desc']).default('desc')
      })
      .parse(queryObj);

    const user = c.get('user');

    // 构建WHERE条件
    const conditions = [];
    const params = [];

    // 非管理员只能看到自己的文件和公开文件
    if (user.role !== 'admin') {
      conditions.push('(uploaded_by = ? OR is_public = 1)');
      params.push(user.userId);
    }

    if (query.search) {
      conditions.push('(filename LIKE ? OR original_name LIKE ?)');
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (query.mime_type) {
      conditions.push('mime_type LIKE ?');
      params.push(`%${query.mime_type}%`);
    }

    if (query.is_public !== undefined) {
      conditions.push('is_public = ?');
      params.push(query.is_public ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total FROM uploads
      ${whereClause}
    `;
    const countResult = await c.env.SHARED_DB.prepare(countQuery)
      .bind(...params)
      .first();
    const total = (countResult as any)?.total || 0;

    // 获取文件列表
    const filesQuery = `
      SELECT
        f.*,
        u.username as uploader_name
      FROM uploads f
      LEFT JOIN users u ON f.uploaded_by = u.id
      ${whereClause}
      ORDER BY f.${query.sort_by} ${query.sort_order}
      LIMIT ? OFFSET ?
    `;

    const files = await c.env.SHARED_DB.prepare(filesQuery)
      .bind(...params, query.limit, (query.page - 1) * query.limit)
      .all();

    return c.json({
      success: true,
      data: {
        files: files.results,
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

// 上传文件
uploadRoutes.post('/', async c => {
  try {
    const user = c.get('user');
    const contentType = c.req.header('Content-Type');

    if (!contentType?.includes('multipart/form-data')) {
      throw createError.badRequest('Content-Type must be multipart/form-data');
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as unknown as File;
    const isPublic = formData.get('is_public') === 'true';

    if (!file) {
      throw createError.badRequest('No file provided');
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw createError.badRequest(`File type ${file.type} is not allowed`);
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw createError.badRequest('File size exceeds 5MB limit');
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || '';
    const filename = `${timestamp}_${randomId}.${fileExtension}`;

    // 使用Worker代理URL而不是不存在的域名
    const origin = new URL(c.req.url).origin;
    const fileUrl = `${origin}/assets/${filename}`;
    const filePath = `/uploads/${filename}`;

    // 保存文件信息到数据库
    const result = await c.env.SHARED_DB.prepare(
      `
      INSERT INTO uploads (
        filename, original_name, mime_type, size, path, url,
        uploaded_by, is_public, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    )
      .bind(
        filename,
        file.name,
        file.type,
        file.size,
        filePath,
        fileUrl,
        user.userId,
        isPublic ? 1 : 0
      )
      .run();

    // 实际上传文件到 R2
    const fileBuffer = await file.arrayBuffer();
    
    // 检查 R2 绑定是否存在
    if (!c.env.UPLOAD_BUCKET) {
      throw createError.internal('R2 storage not configured');
    }

    await c.env.UPLOAD_BUCKET.put(filename, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.userId.toString(),
        uploadedAt: new Date().toISOString(),
      }
    });

    // 获取保存的文件信息
    const uploadedFile = await c.env.SHARED_DB.prepare(
      `
      SELECT
        f.*,
        u.username as uploader_name
      FROM uploads f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = ?
    `
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(
      {
        success: true,
        data: { file: uploadedFile },
        message: 'File uploaded successfully'
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

// 获取单个文件信息
uploadRoutes.get('/:id', async c => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid file ID');
  }

  const file = await c.env.SHARED_DB.prepare(
    `
    SELECT
      f.*,
      u.username as uploader_name
    FROM uploads f
    LEFT JOIN users u ON f.uploaded_by = u.id
    WHERE f.id = ?
  `
  )
    .bind(id)
    .first();

  if (!file) {
    throw createError.notFound('File not found');
  }

  // 检查权限：非管理员只能查看自己的文件和公开文件
  if (
    user.role !== 'admin' &&
    (file as any).uploaded_by !== user.userId &&
    !(file as any).is_public
  ) {
    throw createError.forbidden('You do not have permission to view this file');
  }

  return c.json({
    success: true,
    data: { file }
  });
});

// 更新文件信息
uploadRoutes.put('/:id', async c => {
  try {
    const id = parseInt(c.req.param('id'));
    const user = c.get('user');
    const body = await c.req.json();

    const { is_public } = z
      .object({
        is_public: z.boolean().optional()
      })
      .parse(body);

    if (isNaN(id)) {
      throw createError.badRequest('Invalid file ID');
    }

    // 检查文件是否存在
    const existingFile = await c.env.SHARED_DB.prepare(
      `
      SELECT id, uploaded_by FROM uploads WHERE id = ?
    `
    )
      .bind(id)
      .first();

    if (!existingFile) {
      throw createError.notFound('File not found');
    }

    // 检查权限：只有文件上传者和管理员可以修改
    if (user.role !== 'admin' && (existingFile as any).uploaded_by !== user.userId) {
      throw createError.forbidden('You do not have permission to update this file');
    }

    // 构建更新查询
    const updates = [];
    const params = [];

    if (is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(is_public ? 1 : 0);
    }

    if (updates.length === 0) {
      throw createError.badRequest('No fields to update');
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    await c.env.SHARED_DB.prepare(
      `
      UPDATE uploads SET ${updates.join(', ')} WHERE id = ?
    `
    )
      .bind(...params)
      .run();

    // 获取更新后的文件信息
    const updatedFile = await c.env.SHARED_DB.prepare(
      `
      SELECT
        f.*,
        u.username as uploader_name
      FROM uploads f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = ?
    `
    )
      .bind(id)
      .first();

    return c.json({
      success: true,
      data: { file: updatedFile }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除文件
uploadRoutes.delete('/:id', async c => {
  const id = parseInt(c.req.param('id'));
  const user = c.get('user');

  if (isNaN(id)) {
    throw createError.badRequest('Invalid file ID');
  }

  // 检查文件是否存在
  const existingFile = await c.env.SHARED_DB.prepare(
    `
    SELECT id, uploaded_by, filename FROM uploads WHERE id = ?
  `
  )
    .bind(id)
    .first();

  if (!existingFile) {
    throw createError.notFound('File not found');
  }

  // 检查权限：只有文件上传者和管理员可以删除
  if (user.role !== 'admin' && (existingFile as any).uploaded_by !== user.userId) {
    throw createError.forbidden('You do not have permission to delete this file');
  }

  // 删除数据库记录
  await c.env.SHARED_DB.prepare(
    `
    DELETE FROM uploads WHERE id = ?
  `
  )
    .bind(id)
    .run();

  // 同时删除 R2 中的文件
  if (c.env.UPLOAD_BUCKET) {
    try {
      await c.env.UPLOAD_BUCKET.delete((existingFile as any).filename);
    } catch (error) {
      console.error('Failed to delete file from R2:', error);
    }
  }

  return c.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// 批量删除文件
uploadRoutes.post('/batch-delete', async c => {
  try {
    const body = await c.req.json();
    const { fileIds } = z
      .object({
        fileIds: z.array(z.number()).min(1)
      })
      .parse(body);

    const user = c.get('user');
    const results = [];

    for (const fileId of fileIds) {
      try {
        // 检查文件是否存在和权限
        const file = await c.env.SHARED_DB.prepare(
          `
          SELECT id, uploaded_by FROM uploads WHERE id = ?
        `
        )
          .bind(fileId)
          .first();

        if (!file) {
          results.push({ id: fileId, success: false, error: 'File not found' });
          continue;
        }

        if (user.role !== 'admin' && (file as any).uploaded_by !== user.userId) {
          results.push({ id: fileId, success: false, error: 'Permission denied' });
          continue;
        }

        // 删除文件
        await c.env.SHARED_DB.prepare(
          `
          DELETE FROM uploads WHERE id = ?
        `
        )
          .bind(fileId)
          .run();

        results.push({ id: fileId, success: true });
      } catch (error) {
        results.push({ id: fileId, success: false, error: 'Delete failed' });
      }
    }

    return c.json({
      success: true,
      data: { results },
      message: `${results.filter(r => r.success).length} files deleted successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 获取文件统计
uploadRoutes.get('/stats/overview', async c => {
  const user = c.get('user');

  let whereClause = '';
  let params: any[] = [];

  // 非管理员只能看到自己的文件统计
  if (user.role !== 'admin') {
    whereClause = 'WHERE uploaded_by = ?';
    params = [user.userId];
  }

  const stats = await c.env.SHARED_DB.prepare(
    `
    SELECT
      COUNT(*) as total_files,
      COUNT(CASE WHEN is_public = 1 THEN 1 END) as public_files,
      COUNT(CASE WHEN is_public = 0 THEN 1 END) as private_files,
      SUM(size) as total_size,
      COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as images,
      COUNT(CASE WHEN mime_type LIKE 'application/%' THEN 1 END) as documents,
      COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as this_week,
      COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as this_month
    FROM uploads
    ${whereClause}
  `
  )
    .bind(...params)
    .first();

  return c.json({
    success: true,
    data: { stats }
  });
});

export { uploadRoutes };