import React from 'react';
import { Search, Filter } from 'lucide-react';

export interface ProjectFilterState {
  search: string;
  status: string;
  tech_stack: string[];
  featured: boolean;
  open_source: boolean;
  sort: string;
  order: string;
}

interface ProjectFiltersProps {
  filters: ProjectFilterState;
  onChange: (filters: Partial<ProjectFilterState>) => void;
  onReset: () => void;
  availableTechStacks: string[];
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onChange,
  onReset,
  availableTechStacks
}) => {
  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'completed', label: '已完成' },
    { value: 'in-progress', label: '进行中' },
    { value: 'planning', label: '规划中' },
    { value: 'on-hold', label: '暂停' },
    { value: 'archived', label: '已归档' }
  ];

  const sortOptions = [
    { value: 'created_at', label: '创建时间' },
    { value: 'updated_at', label: '更新时间' },
    { value: 'star_count', label: '星标数' },
    { value: 'view_count', label: '浏览量' },
    { value: 'title', label: '标题' }
  ];

  const handleTechStackToggle = (tech: string) => {
    const newTechStack = filters.tech_stack.includes(tech)
      ? filters.tech_stack.filter(t => t !== tech)
      : [...filters.tech_stack, tech];
    onChange({ tech_stack: newTechStack });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.tech_stack.length > 0 ||
    filters.featured ||
    filters.open_source;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">项目筛选</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            重置筛选
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          搜索项目
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onChange({ search: e.target.value })}
            placeholder="搜索项目标题、描述或标签..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            项目状态
          </label>
          <select
            value={filters.status}
            onChange={e => onChange({ status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            排序方式
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sort}
              onChange={e => onChange({ sort: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.order}
              onChange={e => onChange({ order: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>

        {/* Checkbox Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            特殊标记
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={e => onChange({ featured: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">精选项目</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.open_source}
                onChange={e => onChange({ open_source: e.target.checked })}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">开源项目</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tech Stack Filter */}
      {availableTechStacks.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            技术栈
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTechStacks.map(tech => (
              <button
                key={tech}
                onClick={() => handleTechStackToggle(tech)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.tech_stack.includes(tech)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;
