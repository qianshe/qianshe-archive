/**
 * 前端测试配置
 * 设置测试环境和工具函数
 */

import React from 'react';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// 清理DOM
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock as any;

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useParams: () => ({})
  };
});

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
      setQueryData: vi.fn(),
      getQueryData: vi.fn()
    })
  };
});

// 测试工具函数
export const createMockPost = (overrides = {}) => ({
  id: 1,
  title: '测试文章',
  slug: 'test-post',
  excerpt: '这是一个测试文章的摘要',
  content: '这是测试文章的内容',
  status: 'published',
  featured_image: null,
  published_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tags: ['test'],
  reading_time: 5,
  view_count: 0,
  ...overrides
});

export const createMockProject = (overrides = {}) => ({
  id: 1,
  title: '测试项目',
  slug: 'test-project',
  description: '这是一个测试项目的描述',
  content: '这是测试项目的详细内容',
  status: 'published',
  featured_image: null,
  demo_url: null,
  repo_url: null,
  technologies: ['React', 'TypeScript'],
  started_at: '2024-01-01T00:00:00Z',
  completed_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockComment = (overrides = {}) => ({
  id: 1,
  post_id: 1,
  author_name: '测试用户',
  author_email: 'test@example.com',
  content: '这是一个测试评论',
  status: 'approved',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  role: 'user',
  avatar: null,
  bio: '这是测试用户的简介',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
});

export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers()
  } as Response);
};

export const mockFetchError = (message = 'Network error') => {
  return Promise.reject(new Error(message));
};

export const waitForLoadingToFinish = () => new Promise(resolve => setTimeout(resolve, 100));

export const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  const Router = ({ children }: { children: React.ReactNode }) => {
    // 简化的路由实现
    return <>{children}</>;
  };

  return {
    ...vi.requireActual('@testing-library/react').render(component, { wrapper: Router })
  };
};
