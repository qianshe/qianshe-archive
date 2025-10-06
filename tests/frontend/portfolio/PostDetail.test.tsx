/**
 * Portfolio 文章详情页面测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PostDetail from '../../../portfolio/src/components/PostDetail';
import { createMockPost, createMockComment, mockFetchResponse } from '../setup';

// Mock组件
vi.mock('../../../portfolio/src/components/CommentSection', () => ({
  default: ({
    postId,
    comments,
    onCommentSubmit
  }: {
    postId: number;
    comments: any[];
    onCommentSubmit: (comment: any) => void;
  }) => (
    <div data-testid="comment-section">
      <h3>评论 ({comments.length})</h3>
      {comments.map(comment => (
        <div key={comment.id} data-testid={`comment-${comment.id}`}>
          <strong>{comment.author_name}</strong>
          <p>{comment.content}</p>
        </div>
      ))}
      <button
        data-testid="submit-comment"
        onClick={() =>
          onCommentSubmit({
            author_name: '测试用户',
            author_email: 'test@example.com',
            content: '测试评论内容'
          })
        }
      >
        提交评论
      </button>
    </div>
  )
}));

vi.mock('../../../portfolio/src/components/ShareButtons', () => ({
  default: ({ title, url }: { title: string; url: string }) => (
    <div data-testid="share-buttons">
      <button data-testid="share-twitter">分享到Twitter</button>
      <button data-testid="share-weibo">分享到微博</button>
    </div>
  )
}));

vi.mock('../../../portfolio/src/components/RelatedPosts', () => ({
  default: ({ posts }: { posts: any[] }) => (
    <div data-testid="related-posts">
      <h3>相关文章</h3>
      {posts.map(post => (
        <div key={post.id} data-testid={`related-post-${post.id}`}>
          {post.title}
        </div>
      ))}
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

const renderPostDetail = (postId = '1') => {
  const queryClient = createTestQueryClient();
  window.history.pushState({}, '', `/blog/${postId}`);

  return {
    ...vi.requireActual('@testing-library/react').render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PostDetail />
        </BrowserRouter>
      </QueryClientProvider>
    ),
    queryClient
  };
};

describe('PostDetail', () => {
  const mockPost = createMockPost({
    id: 1,
    title: 'React Hooks详解',
    content: `# React Hooks详解

React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

## useState Hook

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect Hook

\`\`\`javascript
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理函数
  };
}, [dependencies]);
\`\`\`

## 总结

React Hooks 让函数组件变得更加强大和灵活。`,
    tags: ['react', 'hooks', 'frontend'],
    reading_time: 8,
    view_count: 150,
    published_at: '2024-01-15T10:00:00Z'
  });

  const mockComments = [
    createMockComment({
      id: 1,
      post_id: 1,
      author_name: '张三',
      content: '很详细的文章，学到了很多！',
      created_at: '2024-01-15T11:00:00Z'
    }),
    createMockComment({
      id: 2,
      post_id: 1,
      author_name: '李四',
      content: 'Hooks确实改变了React开发方式。',
      created_at: '2024-01-15T12:00:00Z'
    })
  ];

  const mockRelatedPosts = [
    createMockPost({ id: 2, title: 'React性能优化技巧', tags: ['react', 'performance'] }),
    createMockPost({ id: 3, title: 'TypeScript与React', tags: ['react', 'typescript'] })
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render post content correctly', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: mockComments } }))
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: { items: mockRelatedPosts } })
      );

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByText('React Hooks详解')).toBeInTheDocument();
      expect(screen.getByText(/React Hooks 是 React 16.8 引入的新特性/)).toBeInTheDocument();
      expect(screen.getByText('阅读时间：8分钟')).toBeInTheDocument();
    });

    // 检查标签
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('hooks')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('should render code blocks correctly', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    renderPostDetail('1');

    await waitFor(() => {
      const codeBlocks = screen.getAllByText(/const \[count, setCount\] = useState\(0\);/);
      expect(codeBlocks.length).toBeGreaterThan(0);
    });
  });

  it('should display comments section', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: mockComments } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('comment-section')).toBeInTheDocument();
      expect(screen.getByText('评论 (2)')).toBeInTheDocument();
      expect(screen.getByTestId('comment-1')).toBeInTheDocument();
      expect(screen.getByTestId('comment-2')).toBeInTheDocument();
    });

    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('很详细的文章，学到了很多！')).toBeInTheDocument();
  });

  it('should handle comment submission', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: mockComments } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: createMockComment({
            id: 3,
            author_name: '测试用户',
            content: '测试评论内容'
          })
        })
      );

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('submit-comment')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('submit-comment'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('测试评论内容')
        })
      );
    });
  });

  it('should display related posts', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(
        mockFetchResponse({ success: true, data: { items: mockRelatedPosts } })
      );

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('related-posts')).toBeInTheDocument();
      expect(screen.getByText('相关文章')).toBeInTheDocument();
      expect(screen.getByTestId('related-post-2')).toBeInTheDocument();
      expect(screen.getByTestId('related-post-3')).toBeInTheDocument();
    });
  });

  it('should show share buttons', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('share-weibo')).toBeInTheDocument();
    });
  });

  it('should handle share functionality', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    // Mock window.open
    const mockOpen = vi.fn();
    Object.defineProperty(window, 'open', {
      writable: true,
      value: mockOpen
    });

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('share-twitter'));

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com'),
      '_blank',
      'width=550,height=420'
    );
  });

  it('should handle 404 not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ success: false, error: 'Post not found' })
    });

    renderPostDetail('999');

    await waitFor(() => {
      expect(screen.getByText('文章不存在')).toBeInTheDocument();
    });
  });

  it('should track page view', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    renderPostDetail('1');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('page_view')
        })
      );
    });
  });

  it('should be responsive', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    // 测试移动端
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByText('React Hooks详解')).toBeInTheDocument();
    });

    // 测试桌面端
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByText('React Hooks详解')).toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: mockPost }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }))
      .mockResolvedValueOnce(mockFetchResponse({ success: true, data: { items: [] } }));

    renderPostDetail('1');

    await waitFor(() => {
      expect(screen.getByTestId('share-twitter')).toBeInTheDocument();
    });

    // 测试Tab键导航
    const shareButton = screen.getByTestId('share-twitter');
    shareButton.focus();
    expect(shareButton).toHaveFocus();

    fireEvent.keyDown(shareButton, { key: 'Enter' });

    // 验证Enter键也能触发分享
    expect(window.open).toHaveBeenCalled();
  });
});
