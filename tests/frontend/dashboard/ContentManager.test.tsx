/**
 * Dashboard 内容管理页面测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ContentManager from '../../../dashboard/src/components/ContentManager';
import { createMockPost, createMockProject, mockFetchResponse } from '../setup';

// Mock组件
vi.mock('../../../dashboard/src/components/PostEditor', () => ({
  default: ({
    post,
    onSave,
    onCancel
  }: {
    post?: any;
    onSave: (post: any) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="post-editor">
      <input data-testid="post-title" defaultValue={post?.title || ''} placeholder="文章标题" />
      <textarea
        data-testid="post-content"
        defaultValue={post?.content || ''}
        placeholder="文章内容"
      />
      <button
        data-testid="save-post"
        onClick={() =>
          onSave(
            post || {
              title: '新文章',
              content: '新内容',
              status: 'published'
            }
          )
        }
      >
        保存
      </button>
      <button data-testid="cancel-edit" onClick={onCancel}>
        取消
      </button>
    </div>
  )
}));

vi.mock('../../../dashboard/src/components/ProjectEditor', () => ({
  default: ({
    project,
    onSave,
    onCancel
  }: {
    project?: any;
    onSave: (project: any) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="project-editor">
      <input
        data-testid="project-title"
        defaultValue={project?.title || ''}
        placeholder="项目标题"
      />
      <textarea
        data-testid="project-description"
        defaultValue={project?.description || ''}
        placeholder="项目描述"
      />
      <button
        data-testid="save-project"
        onClick={() =>
          onSave(
            project || {
              title: '新项目',
              description: '新项目描述',
              status: 'published'
            }
          )
        }
      >
        保存
      </button>
      <button data-testid="cancel-edit" onClick={onCancel}>
        取消
      </button>
    </div>
  )
}));

vi.mock('../../../dashboard/src/components/DataTable', () => ({
  default: ({
    data,
    columns,
    onEdit,
    onDelete
  }: {
    data: any[];
    columns: any[];
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
  }) => (
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.status}</td>
              <td>
                <button data-testid={`edit-${item.id}`} onClick={() => onEdit(item)}>
                  编辑
                </button>
                <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}));

vi.mock('../../../dashboard/src/components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

// Mock auth token
localStorage.setItem('auth_token', 'mock-token');

const renderContentManager = (contentType = 'posts') => {
  const queryClient = createTestQueryClient();
  window.history.pushState({}, '', `/dashboard/${contentType}`);

  return {
    ...vi.requireActual('@testing-library/react').render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ContentManager />
        </BrowserRouter>
      </QueryClientProvider>
    ),
    queryClient
  };
};

describe('ContentManager', () => {
  const mockPosts = [
    createMockPost({ id: 1, title: '文章1', status: 'published' }),
    createMockPost({ id: 2, title: '文章2', status: 'draft' })
  ];

  const mockProjects = [
    createMockProject({ id: 1, title: '项目1', status: 'published' }),
    createMockProject({ id: 2, title: '项目2', status: 'draft' })
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Posts Management', () => {
    it('should render posts list', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: {
            items: mockPosts,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText('文章管理')).toBeInTheDocument();
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      expect(screen.getByText('文章1')).toBeInTheDocument();
      expect(screen.getByText('文章2')).toBeInTheDocument();
    });

    it('should create new post', async () => {
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
            data: createMockPost({ id: 3, title: '新文章' })
          })
        );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText('新建文章')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('新建文章'));

      await waitFor(() => {
        expect(screen.getByTestId('post-editor')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-post'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/posts'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('新文章')
          })
        );
      });
    });

    it('should edit existing post', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: {
            items: mockPosts,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-1'));

      await waitFor(() => {
        expect(screen.getByTestId('post-editor')).toBeInTheDocument();
        expect(screen.getByTestId('post-title')).toHaveValue('文章1');
      });
    });

    it('should delete post', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(
          mockFetchResponse({
            success: true,
            data: { items: mockPosts, pagination: {} }
          })
        )
        .mockResolvedValueOnce(mockFetchResponse({ success: true }));

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('delete-1'));

      // 确认删除
      await waitFor(() => {
        const confirmButton = screen.getByText('确认删除');
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/posts/1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    it('should handle post search', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: { items: mockPosts, pagination: {} }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByPlaceholderText('搜索文章...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('搜索文章...');
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('search=React'));
      });
    });
  });

  describe('Projects Management', () => {
    it('should render projects list', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: {
            items: mockProjects,
            pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
          }
        })
      );

      renderContentManager('projects');

      await waitFor(() => {
        expect(screen.getByText('项目管理')).toBeInTheDocument();
        expect(screen.getByTestId('data-table')).toBeInTheDocument();
      });

      expect(screen.getByText('项目1')).toBeInTheDocument();
      expect(screen.getByText('项目2')).toBeInTheDocument();
    });

    it('should create new project', async () => {
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
            data: createMockProject({ id: 3, title: '新项目' })
          })
        );

      renderContentManager('projects');

      await waitFor(() => {
        expect(screen.getByText('新建项目')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('新建项目'));

      await waitFor(() => {
        expect(screen.getByTestId('project-editor')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('save-project'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/projects'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('新项目')
          })
        );
      });
    });
  });

  describe('Common Functionality', () => {
    it('should handle pagination', async () => {
      const paginatedPosts = Array.from({ length: 15 }, (_, i) =>
        createMockPost({ id: i + 1, title: `文章${i + 1}` })
      );

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(
          mockFetchResponse({
            success: true,
            data: {
              items: paginatedPosts.slice(0, 10),
              pagination: { page: 1, limit: 10, total: 15, totalPages: 2 }
            }
          })
        )
        .mockResolvedValueOnce(
          mockFetchResponse({
            success: true,
            data: {
              items: paginatedPosts.slice(10, 15),
              pagination: { page: 2, limit: 10, total: 15, totalPages: 2 }
            }
          })
        );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText('下一页')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('下一页'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('page=2'));
      });
    });

    it('should handle filtering by status', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: { items: mockPosts, pagination: {} }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText('状态筛选')).toBeInTheDocument();
      });

      const statusFilter = screen.getByDisplayValue('全部');
      fireEvent.change(statusFilter, { target: { value: 'published' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('status=published'));
      });
    });

    it('should handle bulk actions', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(
          mockFetchResponse({
            success: true,
            data: { items: mockPosts, pagination: {} }
          })
        )
        .mockResolvedValueOnce(mockFetchResponse({ success: true }));

      renderContentManager('posts');

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        if (checkboxes.length > 0) {
          fireEvent.click(checkboxes[0]); // 选择第一项
        }
      });

      const bulkAction = screen.getByText('批量删除');
      if (bulkAction) {
        fireEvent.click(bulkAction);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/posts/bulk-delete'),
            expect.objectContaining({ method: 'POST' })
          );
        });
      }
    });

    it('should show loading state', () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      renderContentManager('posts');

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should handle error state', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
      });
    });

    it('should be accessible', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: { items: mockPosts, pagination: {} }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // 测试键盘导航
      const editButton = screen.getByTestId('edit-1');
      editButton.focus();
      expect(editButton).toHaveFocus();

      // 测试ARIA标签
      expect(screen.getByLabelText('搜索文章...')).toBeInTheDocument();
    });

    it('should handle auto-save', async () => {
      vi.useFakeTimers();

      global.fetch = vi.fn().mockResolvedValue(
        mockFetchResponse({
          success: true,
          data: { items: mockPosts, pagination: {} }
        })
      );

      renderContentManager('posts');

      await waitFor(() => {
        expect(screen.getByText('新建文章')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('新建文章'));

      await waitFor(() => {
        expect(screen.getByTestId('post-editor')).toBeInTheDocument();
      });

      const titleInput = screen.getByTestId('post-title');
      fireEvent.change(titleInput, { target: { value: '自动保存测试' } });

      // 触发自动保存
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/posts/draft'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('自动保存测试')
          })
        );
      });

      vi.useRealTimers();
    });
  });
});
