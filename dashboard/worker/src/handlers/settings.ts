import { Hono } from 'hono';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import type { UserRole } from '../types';

// 用户类型定义
type User = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  userId: number;
};

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  ENVIRONMENT: string;
};

const settingsRoutes = new Hono<{
  Bindings: Bindings;
  Variables: {
    user: User;
  };
}>();

// 设置验证模式
const settingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100, 'Key too long'),
  value: z.string(),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  is_public: z.boolean().default(false)
});

// 获取设置列表
settingsRoutes.get('/', async c => {
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
        public_only: z
          .string()
          .transform(val => val === 'true')
          .default('false'),
        category: z.string().optional()
      })
      .parse(queryObj);

    const user = c.get('user');

    let whereClause = '';
    const params: any[] = [];

    // 非管理员只能获取公开设置
    if (query.public_only || user.role !== 'admin') {
      whereClause = 'WHERE is_public = 1';
    }

    if (query.category) {
      whereClause += whereClause ? ' AND key LIKE ?' : 'WHERE key LIKE ?';
      params.push(`${query.category}%`);
    }

    const settings = await c.env.DB.prepare(
      `
      SELECT
        id, key, value, description, type, is_public, updated_at
      FROM settings
      ${whereClause}
      ORDER BY key ASC
    `
    )
      .bind(...params)
      .all();

    // 解析JSON类型的值
    const processedSettings = settings.results.map((setting: any) => {
      let parsedValue = setting.value;

      if (setting.type === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'number') {
        parsedValue = Number(setting.value);
      } else if (setting.type === 'json') {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch (e) {
          // 保持原始字符串值
        }
      }

      return {
        ...setting,
        value: parsedValue
      };
    });

    return c.json({
      success: true,
      data: { settings: processedSettings }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Invalid query parameters', error.errors);
    }
    throw error;
  }
});

// 获取单个设置
settingsRoutes.get('/:key', async c => {
  const key = c.req.param('key');
  const user = c.get('user');

  const setting = await c.env.DB.prepare(
    `
    SELECT
      id, key, value, description, type, is_public, updated_at
    FROM settings
    WHERE key = ?
  `
  )
    .bind(key)
    .first();

  if (!setting) {
    throw createError.notFound('Setting not found');
  }

  // 检查权限：非管理员只能获取公开设置
  if (user.role !== 'admin' && !(setting as any).is_public) {
    throw createError.forbidden('You do not have permission to view this setting');
  }

  // 解析值
  let parsedValue = (setting as any).value;
  if ((setting as any).type === 'boolean') {
    parsedValue = (setting as any).value === 'true';
  } else if ((setting as any).type === 'number') {
    parsedValue = Number((setting as any).value);
  } else if ((setting as any).type === 'json') {
    try {
      parsedValue = JSON.parse((setting as any).value);
    } catch (e) {
      // 保持原始字符串值
    }
  }

  return c.json({
    success: true,
    data: {
      ...setting,
      value: parsedValue
    }
  });
});

// 创建/更新设置（仅管理员）
settingsRoutes.put('/:key', requireRole('admin' as UserRole), async c => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    const settingData = settingSchema.parse({ ...body, key });

    // 检查设置是否存在
    const existingSetting = await c.env.DB.prepare(
      `
      SELECT id FROM settings WHERE key = ?
    `
    )
      .bind(key)
      .first();

    // 验证值格式
    let validatedValue = settingData.value;
    if (settingData.type === 'boolean') {
      if (settingData.value === 'true' || settingData.value === 'false') {
        validatedValue = settingData.value;
      } else {
        throw createError.badRequest('Boolean value must be "true" or "false"');
      }
    } else if (settingData.type === 'number') {
      if (isNaN(Number(settingData.value))) {
        throw createError.badRequest('Invalid number value');
      }
      validatedValue = settingData.value;
    } else if (settingData.type === 'json') {
      try {
        JSON.parse(settingData.value);
        validatedValue = settingData.value;
      } catch (e) {
        throw createError.badRequest('Invalid JSON value');
      }
    }

    if (existingSetting) {
      // 更新现有设置
      await c.env.DB.prepare(
        `
        UPDATE settings SET
          value = ?, description = ?, type = ?, is_public = ?, updated_at = datetime('now')
        WHERE key = ?
      `
      )
        .bind(
          validatedValue,
          settingData.description || '',
          settingData.type,
          settingData.is_public ? 1 : 0,
          key
        )
        .run();
    } else {
      // 创建新设置
      await c.env.DB.prepare(
        `
        INSERT INTO settings (key, value, description, type, is_public, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `
      )
        .bind(
          key,
          validatedValue,
          settingData.description || '',
          settingData.type,
          settingData.is_public ? 1 : 0
        )
        .run();
    }

    // 获取更新后的设置
    const updatedSetting = await c.env.DB.prepare(
      `
      SELECT
        id, key, value, description, type, is_public, updated_at
      FROM settings
      WHERE key = ?
    `
    )
      .bind(key)
      .first();

    // 解析值用于返回
    let parsedValue = (updatedSetting as any).value;
    if ((updatedSetting as any).type === 'boolean') {
      parsedValue = (updatedSetting as any).value === 'true';
    } else if ((updatedSetting as any).type === 'number') {
      parsedValue = Number((updatedSetting as any).value);
    } else if ((updatedSetting as any).type === 'json') {
      try {
        parsedValue = JSON.parse((updatedSetting as any).value);
      } catch (e) {
        // 保持原始字符串值
      }
    }

    return c.json({
      success: true,
      data: {
        ...updatedSetting,
        value: parsedValue
      },
      message: existingSetting ? 'Setting updated successfully' : 'Setting created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 批量更新设置（仅管理员）
settingsRoutes.post('/batch', requireRole('admin' as UserRole), async c => {
  try {
    const body = await c.req.json();
    const { settings } = z
      .object({
        settings: z
          .array(
            z.object({
              key: z.string().min(1),
              value: z.string(),
              description: z.string().optional(),
              type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
              is_public: z.boolean().default(false)
            })
          )
          .min(1)
      })
      .parse(body);

    const results = [];

    for (const settingData of settings) {
      try {
        // 验证值格式
        let validatedValue = settingData.value;
        if (settingData.type === 'boolean') {
          if (settingData.value === 'true' || settingData.value === 'false') {
            validatedValue = settingData.value;
          } else {
            results.push({ key: settingData.key, success: false, error: 'Invalid boolean value' });
            continue;
          }
        } else if (settingData.type === 'number') {
          if (isNaN(Number(settingData.value))) {
            results.push({ key: settingData.key, success: false, error: 'Invalid number value' });
            continue;
          }
          validatedValue = settingData.value;
        } else if (settingData.type === 'json') {
          try {
            JSON.parse(settingData.value);
            validatedValue = settingData.value;
          } catch (e) {
            results.push({ key: settingData.key, success: false, error: 'Invalid JSON value' });
            continue;
          }
        }

        // 检查设置是否存在
        const existingSetting = await c.env.DB.prepare(
          `
          SELECT id FROM settings WHERE key = ?
        `
        )
          .bind(settingData.key)
          .first();

        if (existingSetting) {
          // 更新现有设置
          await c.env.DB.prepare(
            `
            UPDATE settings SET
              value = ?, description = ?, type = ?, is_public = ?, updated_at = datetime('now')
            WHERE key = ?
          `
          )
            .bind(
              validatedValue,
              settingData.description || '',
              settingData.type,
              settingData.is_public ? 1 : 0,
              settingData.key
            )
            .run();
        } else {
          // 创建新设置
          await c.env.DB.prepare(
            `
            INSERT INTO settings (key, value, description, type, is_public, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
          `
          )
            .bind(
              settingData.key,
              validatedValue,
              settingData.description || '',
              settingData.type,
              settingData.is_public ? 1 : 0
            )
            .run();
        }

        results.push({ key: settingData.key, success: true });
      } catch (error) {
        results.push({ key: settingData.key, success: false, error: 'Update failed' });
      }
    }

    return c.json({
      success: true,
      data: { results },
      message: `${results.filter(r => r.success).length} settings updated successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError.badRequest('Validation failed', error.errors);
    }
    throw error;
  }
});

// 删除设置（仅管理员）
settingsRoutes.delete('/:key', requireRole('admin' as UserRole), async c => {
  const key = c.req.param('key');

  // 检查设置是否存在
  const existingSetting = await c.env.DB.prepare(
    `
    SELECT id FROM settings WHERE key = ?
  `
  )
    .bind(key)
    .first();

  if (!existingSetting) {
    throw createError.notFound('Setting not found');
  }

  // 删除设置
  await c.env.DB.prepare(
    `
    DELETE FROM settings WHERE key = ?
  `
  )
    .bind(key)
    .run();

  return c.json({
    success: true,
    message: 'Setting deleted successfully'
  });
});

// 获取网站基本信息
settingsRoutes.get('/site/info', async c => {
  const siteInfo = await c.env.DB.prepare(
    `
    SELECT key, value, type FROM settings
    WHERE is_public = 1 AND (
      key LIKE 'site_%' OR
      key LIKE 'contact_%' OR
      key LIKE 'social_%'
    )
    ORDER BY key ASC
  `
  ).all();

  const info: any = {};
  siteInfo.results.forEach((setting: any) => {
    let value = setting.value;
    if (setting.type === 'boolean') {
      value = setting.value === 'true';
    } else if (setting.type === 'number') {
      value = Number(setting.value);
    } else if (setting.type === 'json') {
      try {
        value = JSON.parse(setting.value);
      } catch (e) {
        // 保持原始字符串值
      }
    }

    // 将key转换为更友好的名称
    const cleanKey = setting.key.replace(/^(site_|contact_|social_)/, '');
    info[cleanKey] = value;
  });

  return c.json({
    success: true,
    data: { siteInfo: info }
  });
});

// 初始化默认设置
settingsRoutes.post('/init', requireRole('admin' as UserRole), async c => {
  const defaultSettings = [
    {
      key: 'site_name',
      value: '谦舍博客',
      description: '网站名称',
      type: 'string',
      is_public: true
    },
    {
      key: 'site_description',
      value: '技术分享与思考记录',
      description: '网站描述',
      type: 'string',
      is_public: true
    },
    {
      key: 'site_keywords',
      value: '技术,博客,前端,后端,思考',
      description: '网站关键词',
      type: 'string',
      is_public: true
    },
    { key: 'site_author', value: '谦舍', description: '网站作者', type: 'string', is_public: true },
    {
      key: 'site_url',
      value: 'https://qianshe.top',
      description: '网站URL',
      type: 'string',
      is_public: true
    },
    {
      key: 'posts_per_page',
      value: '10',
      description: '每页文章数量',
      type: 'number',
      is_public: false
    },
    {
      key: 'comments_auto_approve',
      value: 'false',
      description: '自动批准评论',
      type: 'boolean',
      is_public: false
    },
    {
      key: 'analytics_enabled',
      value: 'true',
      description: '启用统计',
      type: 'boolean',
      is_public: false
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: '维护模式',
      type: 'boolean',
      is_public: false
    },
    {
      key: 'contact_email',
      value: 'contact@qianshe.top',
      description: '联系邮箱',
      type: 'string',
      is_public: true
    },
    {
      key: 'social_github',
      value: 'https://github.com/qianshe',
      description: 'GitHub链接',
      type: 'string',
      is_public: true
    },
    {
      key: 'social_twitter',
      value: 'https://twitter.com/qianshe',
      description: 'Twitter链接',
      type: 'string',
      is_public: true
    }
  ];

  const results = [];

  for (const setting of defaultSettings) {
    try {
      // 检查设置是否已存在
      const exists = await c.env.DB.prepare(
        `
        SELECT id FROM settings WHERE key = ?
      `
      )
        .bind(setting.key)
        .first();

      if (!exists) {
        await c.env.DB.prepare(
          `
          INSERT INTO settings (key, value, description, type, is_public, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'))
        `
        )
          .bind(
            setting.key,
            setting.value,
            setting.description,
            setting.type,
            setting.is_public ? 1 : 0
          )
          .run();
        results.push({ key: setting.key, success: true, action: 'created' });
      } else {
        results.push({ key: setting.key, success: true, action: 'exists' });
      }
    } catch (error) {
      results.push({ key: setting.key, success: false, error: 'Failed to create' });
    }
  }

  return c.json({
    success: true,
    data: { results },
    message: 'Default settings initialized successfully'
  });
});

export { settingsRoutes };
