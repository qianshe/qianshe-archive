import { Env, Comment, CreateCommentRequest, CommentQuery } from '../types';
import {
  executeQuery,
  executeQueryFirst,
  executeMutation,
  buildOrderByClause,
  buildPaginationClause
} from './database';
import {
  CommentCacheKeys,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPrefix
} from '../utils/cache';
import { sanitizeHtml } from '../utils/validation';

export class CommentService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // 获取评论列表
  async getComments(query: CommentQuery): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const cacheKey = CommentCacheKeys.list(JSON.stringify(query));
    const cached = await getCache<any>(this.env, cacheKey);
    if (cached) {
      return cached;
    }

    const { page = 1, limit = 10, ...filters } = query;

    // 构建WHERE条件
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters.post_id) {
      whereClause += ' AND post_id = ?';
      params.push(filters.post_id);
    }

    if (filters.project_id) {
      whereClause += ' AND project_id = ?';
      params.push(filters.project_id);
    }

    if (filters.approved !== undefined) {
      whereClause += ' AND is_approved = ?';
      params.push(filters.approved);
    }

    const orderBy = buildOrderByClause(
      filters.sort_by || 'created_at',
      filters.sort_order || 'desc'
    );
    const pagination = buildPaginationClause(page, limit);

    const dataQuery = `
      SELECT * FROM comments
      ${whereClause}
      ${orderBy}
      ${pagination}
    `;

    const countQuery = `
      SELECT COUNT(*) as count FROM comments
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      executeQuery<Comment>(this.env, dataQuery, params),
      executeQueryFirst<{ count: number }>(this.env, countQuery, params)
    ]);

    if (!dataResult.success || !countResult.success) {
      throw new Error('Failed to fetch comments');
    }

    const total = countResult.data?.count || 0;
    const comments = dataResult.data as Comment[];
    const totalPages = Math.ceil(total / limit);

    const result = {
      comments,
      total,
      page,
      limit,
      totalPages
    };

    // 缓存结果
    await setCache(this.env, cacheKey, result, 180); // 3分钟缓存

    return result;
  }

  // 创建评论
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    // 清理内容
    const sanitizedContent = sanitizeHtml(data.content);

    // 插入评论
    const insertQuery = `
      INSERT INTO comments (
        post_id, project_id, parent_id, author_name, author_email,
        author_website, content, is_approved, like_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params = [
      data.post_id || null,
      data.project_id || null,
      data.parent_id || null,
      data.author_name,
      data.author_email,
      data.author_website || null,
      sanitizedContent,
      false, // 默认需要审核
      0
    ];

    const result = await executeMutation(this.env, insertQuery, params);

    if (!result.success || !result.data?.meta.last_row_id) {
      throw new Error('Failed to create comment');
    }

    // 获取新创建的评论
    const newComment = await this.getCommentById(result.data.meta.last_row_id);
    if (!newComment) {
      throw new Error('Failed to retrieve created comment');
    }

    // 清除相关缓存
    await this.clearCommentCache(data.post_id, data.project_id);

    // 发送邮箱验证通知（这里可以集成邮件服务）
    await this.sendVerificationEmail(data.author_email, newComment.id);

    return newComment;
  }

  // 获取评论详情
  async getCommentById(id: number): Promise<Comment | null> {
    const result = await executeQueryFirst<Comment>(
      this.env,
      'SELECT * FROM comments WHERE id = ?',
      [id]
    );

    return result.success ? result.data || null : null;
  }

  // 点赞评论
  async likeComment(id: number): Promise<void> {
    await executeMutation(
      this.env,
      'UPDATE comments SET like_count = like_count + 1 WHERE id = ?',
      [id]
    );

    // 清除相关缓存
    await deleteCacheByPrefix(this.env, 'comments:list');
  }

  // 验证邮箱
  async verifyEmail(email: string, _token: string): Promise<boolean> {
    // 检查token是否有效（这里简化处理，实际应该存储验证token）
    const commentResult = await executeQueryFirst<Comment>(
      this.env,
      'SELECT * FROM comments WHERE author_email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (commentResult.success && commentResult.data) {
      // 更新评论为已审核状态
      await executeMutation(
        this.env,
        'UPDATE comments SET is_approved = 1 WHERE author_email = ?',
        [email]
      );

      // 清除缓存
      await deleteCacheByPrefix(this.env, 'comments:list');

      return true;
    }

    return false;
  }

  // 获取评论数量
  async getCommentCount(postId?: number, projectId?: number): Promise<number> {
    const cacheKey = CommentCacheKeys.count(postId, projectId);
    const cached = await getCache<number>(this.env, cacheKey);
    if (cached !== null) {
      return cached;
    }

    let whereClause = 'WHERE is_approved = 1';
    const params: any[] = [true];

    if (postId) {
      whereClause += ' AND post_id = ?';
      params.push(postId);
    }

    if (projectId) {
      whereClause += ' AND project_id = ?';
      params.push(projectId);
    }

    const result = await executeQueryFirst<{ count: number }>(
      this.env,
      `SELECT COUNT(*) as count FROM comments ${whereClause}`,
      params
    );

    const count = result.success ? result.data?.count || 0 : 0;
    await setCache(this.env, cacheKey, count, 300); // 5分钟缓存

    return count;
  }

  // 发送验证邮件（简化版本）
  private async sendVerificationEmail(email: string, commentId: number): Promise<void> {
    // 在实际应用中，这里应该集成邮件服务
    // 例如使用SendGrid, AWS SES等服务
    console.log(`Verification email sent to ${email} for comment ${commentId}`);
  }

  // 清除评论相关缓存
  async clearCommentCache(postId?: number, projectId?: number): Promise<void> {
    await deleteCacheByPrefix(this.env, 'comments:list');

    if (postId !== undefined || projectId !== undefined) {
      await deleteCache(this.env, CommentCacheKeys.count(postId, projectId));
    }
  }
}
