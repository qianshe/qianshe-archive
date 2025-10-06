import { Env } from '../types';

// 缓存键前缀
const CACHE_PREFIX = 'portfolio:';

// 生成缓存键
export function getCacheKey(type: string, identifier: string): string {
  return `${CACHE_PREFIX}${type}:${identifier}`;
}

// 设置缓存
export async function setCache(
  env: Env,
  key: string,
  value: any,
  ttl: number = 300 // 默认5分钟
): Promise<void> {
  try {
    await env.CACHE.put(key, JSON.stringify(value), {
      expirationTtl: ttl
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

// 获取缓存
export async function getCache<T>(env: Env, key: string): Promise<T | null> {
  try {
    const cached = await env.CACHE.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

// 删除缓存
export async function deleteCache(env: Env, key: string): Promise<void> {
  try {
    await env.CACHE.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// 批量删除缓存（根据前缀）
export async function deleteCacheByPrefix(env: Env, prefix: string): Promise<void> {
  try {
    // 注意：KV namespace的list功能在某些计划中可能不可用
    const list = await env.CACHE.list({ prefix: CACHE_PREFIX + prefix });
    const deletePromises = list.keys.map(key => env.CACHE.delete(key.name));
    await Promise.allSettled(deletePromises);
  } catch (error) {
    console.error('Cache delete by prefix error:', error);
  }
}

// 文章缓存相关
export const PostCacheKeys = {
  list: (params: string) => getCacheKey('posts', `list:${params}`),
  detail: (slug: string) => getCacheKey('posts', `detail:${slug}`),
  related: (slug: string) => getCacheKey('posts', `related:${slug}`),
  archive: () => getCacheKey('posts', 'archive'),
  tagsStats: () => getCacheKey('posts', 'tags-stats'),
  categoriesStats: () => getCacheKey('posts', 'categories-stats')
};

// 项目缓存相关
export const ProjectCacheKeys = {
  list: (params: string) => getCacheKey('projects', `list:${params}`),
  detail: (slug: string) => getCacheKey('projects', `detail:${slug}`),
  techStats: () => getCacheKey('projects', 'tech-stats')
};

// 评论缓存相关
export const CommentCacheKeys = {
  list: (params: string) => getCacheKey('comments', `list:${params}`),
  count: (postId?: number, projectId?: number) =>
    getCacheKey('comments', `count:${postId || 'null'}:${projectId || 'null'}`)
};

// 系统缓存相关
export const SystemCacheKeys = {
  info: () => getCacheKey('system', 'info'),
  settings: () => getCacheKey('system', 'settings-public'),
  links: () => getCacheKey('system', 'links')
};

// 搜索缓存相关
export const SearchCacheKeys = {
  results: (query: string, type: string, page: number) =>
    getCacheKey('search', `${type}:${query}:${page}`)
};
