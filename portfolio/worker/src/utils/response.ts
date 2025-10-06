import { Context } from 'hono';

// 局部响应类型定义
interface LocalApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 成功响应
export function successResponse<T>(c: Context, data: T, message?: string) {
  const response: LocalApiResponse<T> = {
    success: true,
    data,
    message
  };
  return c.json(response);
}

// 错误响应
export function errorResponse(c: Context, message: string, status: number = 400) {
  const response: LocalApiResponse = {
    success: false,
    error: message
  };
  return c.json(response, status as any);
}

// 分页响应
export function paginatedResponse<T>(
  c: Context,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
) {
  const totalPages = Math.ceil(total / limit);

  const response = {
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    message
  };

  return c.json(response);
}

// 404响应
export function notFoundResponse(c: Context, resource: string = 'Resource') {
  return errorResponse(c, `${resource} not found`, 404);
}

// 服务器错误响应
export function serverErrorResponse(c: Context, message: string = 'Internal server error') {
  return errorResponse(c, message, 500);
}

// 未授权响应
export function unauthorizedResponse(c: Context, message: string = 'Unauthorized') {
  return errorResponse(c, message, 401);
}

// 禁止访问响应
export function forbiddenResponse(c: Context, message: string = 'Forbidden') {
  return errorResponse(c, message, 403);
}
