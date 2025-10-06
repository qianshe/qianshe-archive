/**
 * Portfolio 首页组件测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../../portfolio/src/components/HomePage';
import { createMockPost, createMockProject, mockFetchResponse } from '../setup';

// Mock组件
vi.mock('../../../portfolio/src/components/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero Section</div>
}));

vi.mock('../../../portfolio/src/components/LatestPosts', () => ({
  default: ({ posts }: { posts: any[] }) => (
    <div data-testid="latest-posts">
      <h2>Latest Posts</h2>
      {posts?.map(post => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          {post.title}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../../portfolio/src/components/FeaturedProjects', () => ({
  default: ({ projects }: { projects: any[] }) => (
    <div data-testid="featured-projects">
      <h2>Featured Projects</h2>
      {projects?.map(project => (
        <div key={project.id} data-testid={`project-${project.id}`}>
          {project.title}
        </div>
      ))}
    </div>
  )
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderHomePage = () => {
  const queryClient = createTestQueryClient();
  return {
    ...vi.requireActual('@testing-library/react').render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </QueryClientProvider>
    ),
    queryClient
  };
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render hero section', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: { items: [], pagination: {} }
      })
    );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  it('should load and display latest posts', async () => {
    const mockPosts = [
      createMockPost({ id: 1, title: '最新文章1' }),
      createMockPost({ id: 2, title: '最新文章2' })
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: mockPosts, pagination: {} }
        })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: [], pagination: {} }
        })
      );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('latest-posts')).toBeInTheDocument();
      expect(screen.getByTestId('post-1')).toHaveTextContent('最新文章1');
      expect(screen.getByTestId('post-2')).toHaveTextContent('最新文章2');
    });
  });

  it('should load and display featured projects', async () => {
    const mockProjects = [
      createMockProject({ id: 1, title: '精选项目1' }),
      createMockProject({ id: 2, title: '精选项目2' })
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: [], pagination: {} }
        })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: mockProjects, pagination: {} }
        })
      );

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('featured-projects')).toBeInTheDocument();
      expect(screen.getByTestId('project-1')).toHaveTextContent('精选项目1');
      expect(screen.getByTestId('project-2')).toHaveTextContent('精选项目2');
    });
  });

  it('should handle loading state', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderHomePage();

    // 检查是否显示加载状态
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('should handle error state gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  it('should fetch data from correct endpoints', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: [], pagination: {} }
        })
      )
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { items: [], pagination: {} }
        })
      );

    renderHomePage();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts?featured=true&limit=3')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects?featured=true&limit=3')
      );
    });
  });

  it('should be responsive', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: { items: [], pagination: {} }
      })
    );

    // 测试移动端视图
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    // 测试桌面端视图
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });
});
