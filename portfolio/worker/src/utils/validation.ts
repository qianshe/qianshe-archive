import { z } from 'zod';

// 分页参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

// 文章查询参数验证
export const blogQuerySchema = paginationSchema.extend({
  category: z.enum(['blog', 'project', 'announcement']).optional(),
  search: z.string().min(1).max(100).optional(),
  featured: z.coerce.boolean().optional(),
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(t => t.trim()) : undefined)),
  sort_by: z
    .enum(['published_at', 'view_count', 'like_count', 'created_at'])
    .default('published_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// 项目查询参数验证
export const projectQuerySchema = paginationSchema.extend({
  featured: z.coerce.boolean().optional(),
  tech: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(t => t.trim()) : undefined)),
  status: z.enum(['completed', 'in-progress', 'planned']).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// 评论查询参数验证
export const commentQuerySchema = paginationSchema.extend({
  post_id: z.coerce.number().int().min(1).optional(),
  project_id: z.coerce.number().int().min(1).optional(),
  approved: z.coerce.boolean().optional(),
  sort_by: z.enum(['created_at', 'like_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// 创建评论验证
export const createCommentSchema = z
  .object({
    post_id: z.coerce.number().int().min(1).optional(),
    project_id: z.coerce.number().int().min(1).optional(),
    parent_id: z.coerce.number().int().min(1).optional(),
    author_name: z.string().min(1).max(50),
    author_email: z.string().email().max(100),
    author_website: z.string().url().max(200).optional(),
    content: z.string().min(1).max(1000)
  })
  .refine(data => data.post_id || data.project_id, {
    message: 'Either post_id or project_id must be provided'
  });

// 搜索参数验证
export const searchSchema = paginationSchema.extend({
  query: z.string().min(1).max(100),
  type: z.enum(['all', 'posts', 'projects']).default('all')
});

// 分析统计验证
export const analyticsSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
  user_agent: z.string().max(500).optional(),
  ip_address: z.string().ip().optional()
});

// 邮箱验证
export const emailVerifySchema = z.object({
  email: z.string().email().max(100),
  token: z.string().min(32).max(64)
});

// 点赞验证
export const likeSchema = z.object({
  type: z.enum(['comment']),
  id: z.coerce.number().int().min(1)
});

// 验证中间件函数
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (
    data: unknown
  ): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    try {
      const validated = await schema.parseAsync(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Validation failed' };
    }
  };
}

// 清理和转义HTML内容
export function sanitizeHtml(content: string): string {
  // 简单的HTML清理，在Workers环境中
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 生成随机token
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
