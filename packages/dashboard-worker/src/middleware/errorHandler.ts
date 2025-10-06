import { Context } from 'hono';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err: Error, c: Context) {
  console.error('API Error:', err);

  if (err instanceof ApiError) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
        ...(err.details && { details: err.details })
      },
      err.statusCode as any
    );
  }

  // 数据库错误
  if (err.message.includes('D1_ERROR')) {
    return c.json(
      {
        success: false,
        error: 'Database operation failed',
        code: 'DATABASE_ERROR'
      },
      500
    );
  }

  // JWT错误
  if (err.message.includes('jwt')) {
    return c.json(
      {
        success: false,
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      },
      401
    );
  }

  // 验证错误
  if (err.message.includes('validation')) {
    return c.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.message
      },
      400
    );
  }

  // 默认错误
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    500
  );
}

// 创建API错误的便捷函数
export const createError = {
  badRequest: (message: string, details?: any) =>
    new ApiError(message, 400, 'BAD_REQUEST', details),

  unauthorized: (message: string = 'Unauthorized') => new ApiError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden') => new ApiError(message, 403, 'FORBIDDEN'),

  notFound: (message: string = 'Resource not found') => new ApiError(message, 404, 'NOT_FOUND'),

  conflict: (message: string, details?: any) => new ApiError(message, 409, 'CONFLICT', details),

  internal: (message: string = 'Internal server error', details?: any) =>
    new ApiError(message, 500, 'INTERNAL_ERROR', details)
};
