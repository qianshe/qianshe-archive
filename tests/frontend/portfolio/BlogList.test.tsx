/**
 * Portfolio 博客列表组件测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import BlogList from '../../../portfolio/src/components/BlogList';
import { createMockPost, mockFetchResponse } from '../setup';

// Mock组件
vi.mock('../../../portfolio/src/components/PostCard', () => ({
  default: ({ post, onTagClick }: { post: any; onTagClick: (tag: string) => void }) => (
    <div data-testid={`post-card-${post.id}`}>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <div>
        {post.tags.map((tag: string) => (
          <button key={tag} data-testid={`tag-${tag}`} onClick={() => onTagClick(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}));

vi.mock('../../../portfolio/src/components/Pagination', () => ({
  default: ({
    currentPage,
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      <button
        data-testid="prev-page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  )
}));

vi.mock('../../../portfolio/src/components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderBlogList = (initialRoute = '/blog') => {
  const queryClient = createTestQueryClient();
  window.history.pushState({}, '', initialRoute);

  return {
    ...vi.requireActual('@testing-library/react').render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <BlogList />
        </BrowserRouter>
      </QueryClientProvider>
    ),
    queryClient
  };
};

describe('BlogList', () => {
  const mockPosts = [
    createMockPost({
      id: 1,
      title: 'React开发技巧',
      excerpt: '分享React开发的实用技巧',
      tags: ['react', 'frontend']
    }),
    createMockPost({
      id: 2,
      title: 'TypeScript最佳实践',
      excerpt: 'TypeScript项目开发中的最佳实践',
      tags: ['typescript', 'frontend']
    }),
    createMockPost({
      id: 3,
      title: '性能优化指南',
      excerpt: 'Web应用性能优化的完整指南',
      tags: ['performance', 'optimization']
    })
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render blog list with posts', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      })
    );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-3')).toBeInTheDocument();
    });

    expect(screen.getByText('React开发技巧')).toBeInTheDocument();
    expect(screen.getByText('TypeScript最佳实践')).toBeInTheDocument();
    expect(screen.getByText('性能优化指南')).toBeInTheDocument();
  });

  it('should handle tag filtering', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      })
    );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    });

    // 点击标签进行筛选
    fireEvent.click(screen.getByTestId('tag-react'));

    // 验证API调用包含标签筛选参数
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('tag=react'));
  });

  it('should handle search functionality', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      })
    );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    });

    // 测试搜索功能
    const searchInput = screen.getByPlaceholderText('搜索文章...');
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'React' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=React'));
    }
  });

  it('should handle pagination', async () => {
    const firstPagePosts = mockPosts.slice(0, 2);
    const secondPagePosts = [createMockPost({ id: 4, title: '第二页文章' })];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: {
            items: firstPagePosts,
            pagination: {
              page: 1,
              limit: 2,
              total: 3,
              totalPages: 2
            }
          }
        })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: {
            items: secondPagePosts,
            pagination: {
              page: 2,
              limit: 2,
              total: 3,
              totalPages: 2
            }
          }
        })
      );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    });

    // 点击下一页
    fireEvent.click(screen.getByTestId('next-page'));

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });
  });

  it('should show loading state', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderBlogList();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle empty state', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0
          }
        }
      })
    );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByText('暂无文章')).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('should be accessible', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      })
    );

    renderBlogList();

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // 测试键盘导航
    const firstTag = screen.getByTestId('tag-react');
    firstTag.focus();
    expect(firstTag).toHaveFocus();

    // 测试ARIA标签
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('should handle URL parameters correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: {
          items: mockPosts,
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1
          }
        }
      })
    );

    renderBlogList('/blog?page=1&tag=react');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('page=1&tag=react'));
    });
  });
});
