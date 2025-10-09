import { useState, useEffect, useMemo, useCallback } from 'react';
import { BlogPost, BlogPostQuery, BlogPostStats } from '../types/blog';
import { postsApi } from '../services/api';

interface UsePostListReturn {
  // 数据状态
  posts: BlogPost[];
  stats: BlogPostStats;
  loading: boolean;
  error: Error | null;

  // 筛选和搜索
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;

  // 分页
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;

  // 选择状态
  selectedPosts: number[];
  setSelectedPosts: (ids: number[]) => void;
  selectAll: () => void;
  selectPost: (id: number) => void;
  clearSelection: () => void;

  // 操作方法
  refreshPosts: () => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  batchDeletePosts: (ids: number[]) => Promise<void>;

  // 计算属性
  filteredPosts: BlogPost[];
  paginatedPosts: BlogPost[];
  hasSelection: boolean;
}

/**
 * 文章列表管理 Hook
 * 提供完整的文章列表状态管理、筛选、分页和操作功能
 */
export const usePostList = (initialItemsPerPage = 10): UsePostListReturn => {
  // 数据状态
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogPostStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 筛选和搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = initialItemsPerPage;

  // 选择状态
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  // 加载文章列表和统计信息
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 构建查询参数
      const query: BlogPostQuery = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (categoryFilter !== 'all') {
        query.category = categoryFilter;
      }

      if (statusFilter !== 'all') {
        query.status = statusFilter;
      }

      if (searchQuery) {
        query.search = searchQuery;
      }

      // 并行请求文章列表和统计信息
      const [postsResponse, statsResponse] = await Promise.all([
        postsApi.getPosts(query),
        postsApi.getStats()
      ]);

      setPosts(postsResponse.posts);
      setStats(statsResponse);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, categoryFilter, statusFilter, searchQuery]);

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 筛选后的文章列表
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || post.category.slug === categoryFilter;
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchQuery, categoryFilter, statusFilter]);

  // 总页数
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  // 分页后的文章列表
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPosts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPosts, currentPage, itemsPerPage]);

  // 全选
  const selectAll = useCallback(() => {
    if (selectedPosts.length === paginatedPosts.length && paginatedPosts.length > 0) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(paginatedPosts.map(post => post.id));
    }
  }, [paginatedPosts, selectedPosts.length]);

  // 单选
  const selectPost = useCallback((postId: number) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  }, []);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedPosts([]);
  }, []);

  // 刷新文章列表
  const refreshPosts = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // 删除单篇文章
  const deletePost = useCallback(
    async (id: number) => {
      try {
        await postsApi.deletePost(id);
        setPosts(prev => prev.filter(post => post.id !== id));
        setSelectedPosts(prev => prev.filter(postId => postId !== id));
        await loadData(); // 重新加载统计信息
      } catch (err) {
        console.error('Failed to delete post:', err);
        throw err;
      }
    },
    [loadData]
  );

  // 批量删除文章
  const batchDeletePosts = useCallback(
    async (ids: number[]) => {
      try {
        await postsApi.deletePosts(ids);
        setPosts(prev => prev.filter(post => !ids.includes(post.id)));
        setSelectedPosts([]);
        await loadData(); // 重新加载统计信息
      } catch (err) {
        console.error('Failed to batch delete posts:', err);
        throw err;
      }
    },
    [loadData]
  );

  // 是否有选中项
  const hasSelection = selectedPosts.length > 0;

  return {
    // 数据状态
    posts,
    stats,
    loading,
    error,

    // 筛选和搜索
    searchQuery,
    categoryFilter,
    statusFilter,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,

    // 分页
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,

    // 选择状态
    selectedPosts,
    setSelectedPosts,
    selectAll,
    selectPost,
    clearSelection,

    // 操作方法
    refreshPosts,
    deletePost,
    batchDeletePosts,

    // 计算属性
    filteredPosts,
    paginatedPosts,
    hasSelection
  };
};
