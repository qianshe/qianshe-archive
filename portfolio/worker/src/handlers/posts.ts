import { Context } from 'hono';
import { PostService } from '../services/post-service';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';
import { validateInput } from '../utils/validation';
import { blogQuerySchema } from '../utils/validation';
import type { Env } from '../types';

export class PostHandler {
  private postService: PostService;
  private env: Env;

  constructor(env: Env) {
    this.postService = new PostService(env);
    this.env = env;
  }

  // 获取文章列表
  async getPosts(c: Context) {
    try {
      const query = c.req.query();
      const validation = await validateInput(blogQuerySchema as any)(query);

      if (!validation.success) {
        return errorResponse(c, validation.error, 400);
      }

      const result = await this.postService.getPosts(validation.data as any);
      return successResponse(c, result);
    } catch (error) {
      // Only log errors in development environment
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get posts error:', error);
      }
      return errorResponse(c, 'Failed to fetch posts', 500);
    }
  }

  // 获取文章详情
  async getPostBySlug(c: Context) {
    try {
      const slug = c.req.param('slug');
      if (!slug) {
        return errorResponse(c, 'Slug is required', 400);
      }

      const post = await this.postService.getPostBySlug(slug);
      if (!post) {
        return notFoundResponse(c, 'Post');
      }

      // 异步增加浏览量
      this.postService.incrementViewCount(post.id).catch((error) => {
        if (this.env.ENVIRONMENT === 'development') {
          console.error('Increment view count error:', error);
        }
      });

      return successResponse(c, post);
    } catch (error) {
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get post error:', error);
      }
      return errorResponse(c, 'Failed to fetch post', 500);
    }
  }

  // 获取相关文章
  async getRelatedPosts(c: Context) {
    try {
      const slug = c.req.param('slug');
      if (!slug) {
        return errorResponse(c, 'Slug is required', 400);
      }

      const limit = parseInt(c.req.query('limit') || '3');
      const relatedPosts = await this.postService.getRelatedPosts(slug, limit);

      return successResponse(c, relatedPosts);
    } catch (error) {
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get related posts error:', error);
      }
      return errorResponse(c, 'Failed to fetch related posts', 500);
    }
  }

  // 获取文章归档
  async getArchive(c: Context) {
    try {
      const archive = await this.postService.getArchive();
      return successResponse(c, archive);
    } catch (error) {
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get archive error:', error);
      }
      return errorResponse(c, 'Failed to fetch archive', 500);
    }
  }

  // 获取标签统计
  async getTagStats(c: Context) {
    try {
      const tagStats = await this.postService.getTagStats();
      return successResponse(c, tagStats);
    } catch (error) {
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get tag stats error:', error);
      }
      return errorResponse(c, 'Failed to fetch tag statistics', 500);
    }
  }

  // 获取分类统计
  async getCategoryStats(c: Context) {
    try {
      const categoryStats = await this.postService.getCategoryStats();
      return successResponse(c, categoryStats);
    } catch (error) {
      if (this.env.ENVIRONMENT === 'development') {
        console.error('Get category stats error:', error);
      }
      return errorResponse(c, 'Failed to fetch category statistics', 500);
    }
  }
}
