import { Env } from '../types';

// 数据库查询结果的类型辅助
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 通用数据库查询执行器
export async function executeQuery<T>(
  env: Env,
  query: string,
  params?: any[]
): Promise<DatabaseResult<T[]>> {
  try {
    const stmt = env.SHARED_DB.prepare(query);
    let result;

    if (params && params.length > 0) {
      result = await stmt.bind(...params).all();
    } else {
      result = await stmt.all();
    }

    return {
      success: true,
      data: result.results as T[]
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// 执行单行查询
export async function executeQueryFirst<T>(
  env: Env,
  query: string,
  params?: any[]
): Promise<DatabaseResult<T>> {
  try {
    const stmt = env.SHARED_DB.prepare(query);
    let result;

    if (params && params.length > 0) {
      result = await stmt.bind(...params).first();
    } else {
      result = await stmt.first();
    }

    return {
      success: true,
      data: result as T
    };
  } catch (error) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// 执行插入/更新/删除操作
export async function executeMutation(
  env: Env,
  query: string,
  params?: any[]
): Promise<DatabaseResult<D1Result>> {
  try {
    const stmt = env.SHARED_DB.prepare(query);
    let result;

    if (params && params.length > 0) {
      result = await stmt.bind(...params).run();
    } else {
      result = await stmt.run();
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Database mutation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// 构建WHERE条件
export function buildWhereClause(conditions: Record<string, any>): {
  clause: string;
  params: any[];
} {
  const whereClauses: string[] = [];
  const params: any[] = [];

  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        const placeholders = value.map(() => '?').join(',');
        whereClauses.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else if (typeof value === 'string' && value.includes('%')) {
        whereClauses.push(`${key} LIKE ?`);
        params.push(value);
      } else {
        whereClauses.push(`${key} = ?`);
        params.push(value);
      }
    }
  });

  return {
    clause: whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '',
    params
  };
}

// 构建ORDER BY子句
export function buildOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): string {
  return `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
}

// 构建LIMIT和OFFSET子句
export function buildPaginationClause(page: number, limit: number): string {
  const offset = (page - 1) * limit;
  return `LIMIT ${limit} OFFSET ${offset}`;
}

// 获取总记录数
export async function getTotalCount(
  env: Env,
  table: string,
  conditions?: Record<string, any>
): Promise<DatabaseResult<number>> {
  let query = `SELECT COUNT(*) as count FROM ${table}`;
  let params: any[] = [];

  if (conditions && Object.keys(conditions).length > 0) {
    const { clause, params: whereParams } = buildWhereClause(conditions);
    query += ` ${clause}`;
    params = whereParams;
  }

  const result = await executeQueryFirst<{ count: number }>(env, query, params);

  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.count
    };
  }

  return {
    success: false,
    error: result.error
  };
}

// 事务支持（简单的批量操作）
export async function executeBatch(
  env: Env,
  queries: Array<{ query: string; params?: any[] }>
): Promise<DatabaseResult<D1Result[]>> {
  try {
    const statements = queries.map(({ query, params }) => {
      const stmt = env.SHARED_DB.prepare(query);
      return params && params.length > 0 ? stmt.bind(...params) : stmt;
    });

    const results = await env.SHARED_DB.batch(statements);

    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Database batch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown batch error'
    };
  }
}

// 数据库健康检查
export async function checkDatabaseHealth(env: Env): Promise<boolean> {
  try {
    const result = await executeQueryFirst<{ version: string }>(
      env,
      'SELECT sqlite_version() as version'
    );
    return result.success;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
