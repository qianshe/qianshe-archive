import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';
import { PostStatsCards } from '../../components/PostStatsCards';
import { BlogPost, BlogPostStats } from '../../types/blog';
import { postsApi } from '../../services/api';

export const PostsPage: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [menuState, setMenuState] = useState<{
    postId: number;
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  } | null>(null);

  const itemsPerPage = 10;

  const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>, postId: number) => {
    if (typeof window === 'undefined') return;

    if (menuState?.postId === postId) {
      setMenuState(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuWidth = 192; // w-48
    const menuOffset = 8;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement: 'top' | 'bottom' =
      spaceBelow < 200 && spaceAbove > spaceBelow ? 'top' : 'bottom';

    let top = placement === 'bottom' ? rect.bottom + menuOffset : rect.top - menuOffset;
    let left = rect.right - menuWidth;

    const horizontalMargin = 16;
    left = Math.max(horizontalMargin, Math.min(left, viewportWidth - menuWidth - horizontalMargin));

    setMenuState({
      postId,
      top,
      left,
      placement
    });
  };

  useEffect(() => {
    if (!menuState) return;

    const handleClose = () => setMenuState(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuState(null);
      }
    };

    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuState]);

  // 加载文章列表和统计数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行请求文章列表和统计数据
        const [postsResponse, statsResponse] = await Promise.all([
          postsApi.getPosts({
            page: currentPage,
            limit: itemsPerPage,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchQuery || undefined
          }),
          postsApi.getStats()
        ]);

        setPosts(postsResponse.posts);
        setTotalPages(postsResponse.totalPages);
        setStats(statsResponse);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        toast.error('加载文章列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, categoryFilter, statusFilter, searchQuery]);

  // 当筛选条件变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, searchQuery]);

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  // 单选
  const handleSelectPost = (postId: number) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedPosts.length} 篇文章吗？`)) {
      try {
        await postsApi.deletePosts(selectedPosts);
        toast.success(`成功删除 ${selectedPosts.length} 篇文章`);
        setSelectedPosts([]);
        // 重新加载数据
        setPosts(prev => prev.filter(post => !selectedPosts.includes(post.id)));
      } catch (error) {
        console.error('Failed to delete posts:', error);
        toast.error('删除失败');
      }
    }
  };

  // 删除单篇文章
  const handleDeletePost = async (postId: number) => {
    if (confirm('确定要删除这篇文章吗？')) {
      try {
        await postsApi.deletePost(postId);
        toast.success('文章已删除');
        setMenuState(null);
        // 重新加载数据
        setPosts(prev => prev.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Failed to delete post:', error);
        toast.error('删除失败');
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 状态徽章样式
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: {
        label: '已发布',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      },
      draft: {
        label: '草稿',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      },
      archived: {
        label: '已归档',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  };

  // 分类徽章样式
  const getCategoryBadge = (categorySlug: string) => {
    const categoryConfig = {
      blog: {
        label: '博客',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      },
      project: {
        label: '项目',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      },
      announcement: {
        label: '公告',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      }
    };
    return categoryConfig[categorySlug as keyof typeof categoryConfig] || categoryConfig.blog;
  };

  return (
    <div className="container-responsive py-6">
      {/* 统计卡片 */}
      <PostStatsCards stats={stats} loading={loading} />

      {/* 筛选和搜索栏 */}
      <div className="card mb-6">
        <div className="card-body p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索标题或标签..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">全部分类</option>
              <option value="blog">博客</option>
              <option value="project">项目</option>
              <option value="announcement">公告</option>
            </select>

            {/* 状态筛选 */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
              <option value="archived">已归档</option>
            </select>

            {/* 新建按钮 */}
            <button
              onClick={() => navigate('/posts/new')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建文章
            </button>
          </div>

          {/* 批量操作 */}
          {selectedPosts.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                已选择 {selectedPosts.length} 篇文章
              </span>
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                批量删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="card">
        {loading ? (
          <div className="card-body p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="card-body">
            <EmptyState
              type={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? 'search' : 'no-data'}
              title={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? '未找到匹配的文章' : '还没有文章'}
              description={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? '尝试调整筛选条件' : '点击上方按钮创建您的第一篇文章'}
              action={
                searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? undefined
                  : {
                      label: '创建文章',
                      onClick: () => navigate('/posts/new')
                    }
              }
            />
          </div>
        ) : (
          <>
            {/* 表格 - 桌面端 */}
            <div className="hidden md:block overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPosts.length === posts.length && posts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      文章
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      浏览量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      更新时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {posts.map(post => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {post.cover_image && (
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {post.title}
                            </p>
                            {post.excerpt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {post.is_top && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded">
                                  置顶
                                </span>
                              )}
                              {post.is_featured && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded">
                                  推荐
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getCategoryBadge(post.category.slug).className}`}>
                          {getCategoryBadge(post.category.slug).label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusBadge(post.status).className}`}>
                          {getStatusBadge(post.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {post.view_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={e => handleMenuToggle(e, post.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>                          {menuState?.postId === post.id &&
                            typeof document !== 'undefined' &&
                            createPortal(
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setMenuState(null)}
                                />
                                <div
                                  className="fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                                  style={{
                                    top: menuState.top,
                                    left: menuState.left,
                                    transform: menuState.placement === 'top'
                                      ? 'translateY(-100%)'
                                      : 'translateY(0)'
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      navigate(`/posts/edit/${post.id}`);
                                      setMenuState(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4 mr-3" />
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => {
                                      window.open(`/${post.category}/${post.slug}`, '_blank');
                                      setMenuState(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 mr-3" />
                                    预览
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    删除
                                  </button>
                                </div>
                              </>,
                              document.body
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 卡片列表 - 移动端 */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map(post => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`badge ${getCategoryBadge(post.category.slug).className}`}>
                          {getCategoryBadge(post.category.slug).label}
                        </span>
                        <span className={`badge ${getStatusBadge(post.status).className}`}>
                          {getStatusBadge(post.status).label}
                        </span>
                        {post.is_top && (
                          <span className="badge bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            置顶
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.view_count} 浏览</span>
                        <span>{formatDate(post.updated_at)}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/posts/edit/${post.id}`)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 mr-1.5" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1.5" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页器 */}
            {totalPages > 1 && (
              <div className="card-footer border-t border-gray-200 dark:border-gray-700 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};









