import { Context } from 'hono';
import { CommentService } from '../services/comment-service';
import { successResponse, errorResponse } from '../utils/response';
import { validateInput } from '../utils/validation';
import { commentQuerySchema, createCommentSchema } from '../utils/validation';

export class CommentHandler {
  private commentService: CommentService;

  constructor(env: any) {
    this.commentService = new CommentService(env);
  }

  // 获取评论列表
  async getComments(c: Context) {
    try {
      const query = c.req.query();
      const validation = await validateInput(commentQuerySchema)(query);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      const result = await this.commentService.getComments(validation.data);
      return successResponse(c, result);
    } catch (error) {
      console.error('Get comments error:', error);
      return errorResponse(c, 'Failed to fetch comments', 500);
    }
  }

  // 创建评论
  async createComment(c: Context) {
    try {
      const body = await c.req.json();
      const validation = await validateInput(createCommentSchema)(body);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      const comment = await this.commentService.createComment(validation.data);
      return successResponse(
        c,
        comment,
        'Comment submitted successfully. It will be visible after approval.'
      );
    } catch (error) {
      console.error('Create comment error:', error);
      return errorResponse(c, 'Failed to create comment', 500);
    }
  }

  // 点赞评论
  async likeComment(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return errorResponse(c, 'Invalid comment ID', 400);
      }

      await this.commentService.likeComment(id);
      return successResponse(c, null, 'Comment liked successfully');
    } catch (error) {
      console.error('Like comment error:', error);
      return errorResponse(c, 'Failed to like comment', 500);
    }
  }

  // 验证邮箱
  async verifyEmail(c: Context) {
    try {
      const body = await c.req.json();
      const { email, token } = body;

      if (!email || !token) {
        return errorResponse(c, 'Email and token are required', 400);
      }

      const success = await this.commentService.verifyEmail(email, token);
      if (success) {
        return successResponse(c, null, 'Email verified successfully');
      } else {
        return errorResponse(c, 'Invalid verification token', 400);
      }
    } catch (error) {
      console.error('Verify email error:', error);
      return errorResponse(c, 'Failed to verify email', 500);
    }
  }

  // 获取评论数量
  async getCommentCount(c: Context) {
    try {
      const postId = c.req.query('post_id') ? parseInt(c.req.query('post_id')!) : undefined;
      const projectId = c.req.query('project_id')
        ? parseInt(c.req.query('project_id')!)
        : undefined;

      if (!postId && !projectId) {
        return errorResponse(c, 'Either post_id or project_id is required', 400);
      }

      const count = await this.commentService.getCommentCount(postId, projectId);
      return successResponse(c, { count });
    } catch (error) {
      console.error('Get comment count error:', error);
      return errorResponse(c, 'Failed to get comment count', 500);
    }
  }
}
