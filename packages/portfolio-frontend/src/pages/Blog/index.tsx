import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import BlogFilters from '@/components/Blog/BlogFilters';
import BlogList from '@/components/Blog/BlogList';
import Pagination from '@/components/Blog/Pagination';
import { usePosts, useCategoryStats, useTagStats } from '@/hooks/usePosts';
import { BlogPostQuery, BlogCategory } from '@/types/blog';
import { useSearchParams } from 'react-router-dom';

const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<BlogPostQuery>({
    page: 1,
    limit: 10,
    status: 'published',
    sort_by: 'published_at',
    sort_order: 'desc'
  });

  // 从URL参数初始化筛选条件
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const initialFilters: BlogPostQuery = {
      page: 1,
      limit: 10,
      status: 'published',
      sort_by: 'published_at',
      sort_order: 'desc'
    };

    if (category) initialFilters.category = category;
    if (search) initialFilters.search = search;
    if (featured === 'true') initialFilters.featured = true;

    setFilters(initialFilters);
  }, [searchParams]);

  // 获取文章列表
  const { data: postsData, isLoading: postsLoading } = usePosts(filters);

  // 获取分类统计
  const { data: categoryStats } = useCategoryStats();

  // 获取标签统计
  const { data: tagStats } = useTagStats();

  const posts = postsData?.data?.posts || [];
  const totalPages = postsData?.data?.pagination?.totalPages || 1;
  const total = postsData?.data?.pagination?.total || 0;

  const handleFiltersChange = (newFilters: BlogPostQuery) => {
    setFilters(newFilters);

    // 更新URL参数
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.featured) params.set('featured', 'true');

    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 构建分类数据
  const categories = [
    { name: 'blog', count: categoryStats?.data?.find((cat: BlogCategory) => cat.category === 'blog')?.count || 0 },
    { name: 'project', count: categoryStats?.data?.find((cat: BlogCategory) => cat.category === 'project')?.count || 0 },
    {
      name: 'announcement',
      count: categoryStats?.data?.find((cat: BlogCategory) => cat.category === 'announcement')?.count || 0
    }
  ].filter((cat: { name: string; count: number }) => cat.count > 0);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">博客文章</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                分享技术学习心得、实践经验和思考感悟
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">篇文章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">个分类</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {tagStats?.data?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">个标签</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <BlogFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
                tags={tagStats?.data || []}
              />
            </div>

            {/* Blog List */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filters.search && (
                    <span>
                      搜索 "
                      <span className="font-medium text-gray-900 dark:text-white">
                        {filters.search}
                      </span>
                      " 的结果
                    </span>
                  )}
                  {!filters.search && filters.category && (
                    <span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {filters.category === 'blog'
                          ? '博客'
                          : filters.category === 'project'
                            ? '项目'
                            : '公告'}
                      </span>{' '}
                      分类下的文章
                    </span>
                  )}
                  {!filters.search && !filters.category && <span>最新文章</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">共 {total} 篇</div>
              </div>

              {/* Blog Posts */}
              <BlogList posts={posts as any} loading={postsLoading} />

              {/* Pagination */}
              <div className="mt-12">
                <Pagination
                  currentPage={filters.page || 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={postsLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
