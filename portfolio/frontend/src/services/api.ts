import axios from 'axios';
import { BlogPost, BlogPostQuery, BlogPostListResponse } from '@/types/blog';
import { Project, ProjectQuery, ProjectListResponse } from '@/types/project';
import { Comment, CommentQuery, CommentListResponse, CommentRequest } from '@/types/comment';
import { SearchRequest, SearchResponse } from '@/types';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 文章相关API
export const postsApi = {
  // 获取文章列表
  getPosts: (params: BlogPostQuery) => api.get<BlogPostListResponse>('/posts', { params }),

  // 获取文章详情
  getPost: (slug: string) => api.get<BlogPost>(`/posts/${slug}`),

  // 获取相关文章
  getRelatedPosts: (slug: string) => api.get<BlogPost[]>(`/posts/${slug}/related`),

  // 获取文章归档
  getArchive: (params: { year?: number; month?: number }) => api.get('/posts/archive', { params }),

  // 获取标签统计
  getTagStats: () => api.get('/posts/tags/stats'),

  // 获取分类统计
  getCategoryStats: () => api.get('/posts/categories/stats')
};

// 项目相关API
export const projectsApi = {
  // 获取项目列表
  getProjects: (params: ProjectQuery) => api.get<ProjectListResponse>('/projects', { params }),

  // 获取项目详情
  getProject: (slug: string) => api.get<Project>(`/projects/${slug}`),

  // 获取技术栈统计
  getTechStats: () => api.get('/projects/tech/stats')
};

// 评论相关API
export const commentsApi = {
  // 获取评论列表
  getComments: (params: CommentQuery) => api.get<CommentListResponse>('/comments', { params }),

  // 提交评论
  submitComment: (data: CommentRequest) => api.post<Comment>('/comments', data),

  // 评论点赞
  likeComment: (commentId: number) => api.post(`/comments/${commentId}/like`),

  // 验证邮箱
  verifyEmail: (email: string, code: string) => api.post('/comments/verify-email', { email, code })
};

// 搜索API
export const searchApi = {
  // 搜索
  search: (params: SearchRequest) => api.get<SearchResponse>('/search', { params })
};

// 系统相关API
export const systemApi = {
  // 获取系统信息
  getSystemInfo: () => api.get('/system/info'),

  // 获取公开设置
  getPublicSettings: () => api.get('/settings/public'),

  // 获取友情链接
  getLinks: () => api.get('/links'),

  // 记录访问统计
  trackAnalytics: (data: { path: string; referrer?: string }) => api.post('/analytics/track', data)
};

export default api;
