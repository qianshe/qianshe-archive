/**
 * 类型定义导入测试文件
 */

// 测试核心类型导入
import {
  ApiResponse,
  BlogPost,
  Project,
  User,
  AuthResponse,
  DatabaseConfig,
  Pagination,
  UUID,
  ISODateString
} from './index';

// 测试类型定义
const testBlogPost: Partial<BlogPost> = {
  title: '测试文章',
  content: '这是一篇测试文章的内容',
  category: 'blog',
  tags: ['test', 'typescript'],
  status: 'published'
};

const testProject: Partial<Project> = {
  title: '测试项目',
  description: '这是一个测试项目',
  category: 'web-application',
  status: 'completed',
  difficulty: 'beginner',
  team_size: 'solo'
};

const testApiResponse: ApiResponse = {
  success: true,
  data: testBlogPost,
  timestamp: Date.now()
};

const testUUID: UUID = '550e8400-e29b-41d4-a716-446655440000';
const testDateString: ISODateString = '2024-01-01';

console.log('类型导入测试通过！');
console.log('测试数据:', {
  blogPost: testBlogPost,
  project: testProject,
  apiResponse: testApiResponse,
  uuid: testUUID,
  dateString: testDateString
});