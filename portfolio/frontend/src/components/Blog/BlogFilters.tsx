import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { BlogPostQuery } from '@/types';

interface BlogFiltersProps {
  filters: BlogPostQuery;
  onFiltersChange: (filters: BlogPostQuery) => void;
  categories: Array<{ name: string; count: number }>;
  tags: Array<{ tag: string; count: number }>;
}

interface CategoryOption {
  value: string;
  label: string;
  count: number;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  tags
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
      page: 1
    });
  };

  const handleFeaturedChange = (featured: boolean) => {
    onFiltersChange({ ...filters, featured: featured || undefined, page: 1 });
  };

  const clearFilters = () => {
    onFiltersChange({ page: 1, limit: filters.limit });
    setShowMobileFilters(false);
  };

  const hasActiveFilters = filters.search || filters.category || filters.featured;

  const categoryOptions: CategoryOption[] = [
    { value: 'all', label: '全部分类', count: categories.reduce((sum, cat) => sum + cat.count, 0) },
    ...categories.map(cat => ({ value: cat.name, label: cat.name, count: cat.count }))
  ];

  const popularTags = tags.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索文章标题、内容..."
          value={filters.search || ''}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">筛选条件</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">分类</h4>
              <div className="space-y-2">
                {categoryOptions.map(category => (
                  <label
                    key={category.value}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={(filters.category || 'all') === category.value}
                        onChange={() => handleCategoryChange(category.value)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {category.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">文章类型</h4>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={e => handleFeaturedChange(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  只显示精选文章
                </span>
              </label>
            </div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">热门标签</h4>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tagData => (
                    <button
                      key={tagData.tag}
                      onClick={() => handleSearchChange(tagData.tag)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors"
                    >
                      #{tagData.tag}
                      <span className="ml-1 text-xs opacity-60">({tagData.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-5 h-5" />
          筛选条件
          {hasActiveFilters && <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>}
        </button>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">筛选条件</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">分类</h4>
                <div className="space-y-2">
                  {categoryOptions.map(category => (
                    <label
                      key={category.value}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="category-mobile"
                          value={category.value}
                          checked={(filters.category || 'all') === category.value}
                          onChange={() => handleCategoryChange(category.value)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {category.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  清除所有筛选
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFilters;
