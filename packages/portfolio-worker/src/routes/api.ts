import { Hono } from 'hono';
import { PostHandler } from '../handlers/posts';
import { ProjectHandler } from '../handlers/projects';
import { CommentHandler } from '../handlers/comments';
import { SearchHandler } from '../handlers/search';
import { SystemHandler } from '../handlers/system';
import { Env } from '../types';
import {
  corsHandler,
  securityHeaders,
  rateLimit,
  errorHandler,
  notFoundHandler
} from '../middleware/cors';

export function createApiRoutes(env: Env): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  // 全局中间件
  app.use('*', errorHandler());
  app.use('*', corsHandler(env));
  app.use('*', securityHeaders());
  app.use('*', rateLimit(100, 60000)); // 每分钟100次请求

  // 创建处理器实例
  const postHandler = new PostHandler(env);
  const projectHandler = new ProjectHandler(env);
  const commentHandler = new CommentHandler(env);
  const searchHandler = new SearchHandler(env);
  const systemHandler = new SystemHandler(env);

  // 健康检查
  app.get('/health', systemHandler.healthCheck.bind(systemHandler));

  // 文章相关路由
  app.get('/posts', postHandler.getPosts.bind(postHandler));
  app.get('/posts/:slug', postHandler.getPostBySlug.bind(postHandler));
  app.get('/posts/:slug/related', postHandler.getRelatedPosts.bind(postHandler));
  app.get('/posts/archive', postHandler.getArchive.bind(postHandler));
  app.get('/posts/tags/stats', postHandler.getTagStats.bind(postHandler));
  app.get('/posts/categories/stats', postHandler.getCategoryStats.bind(postHandler));

  // 项目相关路由
  app.get('/projects', projectHandler.getProjects.bind(projectHandler));
  app.get('/projects/:slug', projectHandler.getProjectBySlug.bind(projectHandler));
  app.get('/projects/tech/stats', projectHandler.getTechStats.bind(projectHandler));

  // 评论相关路由
  app.get('/comments', commentHandler.getComments.bind(commentHandler));
  app.post('/comments', commentHandler.createComment.bind(commentHandler));
  app.post('/comments/:id/like', commentHandler.likeComment.bind(commentHandler));
  app.post('/comments/verify-email', commentHandler.verifyEmail.bind(commentHandler));
  app.get('/comments/count', commentHandler.getCommentCount.bind(commentHandler));

  // 搜索相关路由
  app.get('/search', searchHandler.search.bind(searchHandler));
  app.get('/search/suggestions', searchHandler.getSuggestions.bind(searchHandler));
  app.get('/search/popular', searchHandler.getPopularSearchTerms.bind(searchHandler));

  // 系统相关路由
  app.get('/system/info', systemHandler.getSystemInfo.bind(systemHandler));
  app.get('/settings/public', systemHandler.getPublicSettings.bind(systemHandler));
  app.get('/links', systemHandler.getLinks.bind(systemHandler));
  app.post('/analytics/track', systemHandler.trackAnalytics.bind(systemHandler));
  app.get('/analytics', systemHandler.getAnalytics.bind(systemHandler));
  app.get('/analytics/overview', systemHandler.getAnalyticsOverview.bind(systemHandler));
  app.get('/analytics/trends', systemHandler.getAnalyticsTrends.bind(systemHandler));
  app.get('/analytics/popular', systemHandler.getPopularPages.bind(systemHandler));

  // 404处理
  app.notFound(notFoundHandler());

  return app;
}
