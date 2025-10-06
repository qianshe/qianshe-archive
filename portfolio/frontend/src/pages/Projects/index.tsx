import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import ProjectList from '@/components/Project/ProjectList';
import ProjectFilters, { ProjectFilterState } from '@/components/Project/ProjectFilters';
import Pagination from '@/components/Blog/Pagination';
import { useProjects, useTechStats } from '@/hooks';
import { Project, ProjectQuery, ProjectTech } from '@/types';

const ProjectsPage: React.FC = () => {
  const [filters, setFilters] = useState<ProjectFilterState>({
    search: '',
    status: '',
    tech_stack: [],
    featured: false,
    open_source: false,
    sort: 'created_at',
    order: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // 构建查询参数
  const buildQueryParams = (): ProjectQuery => {
    const params: ProjectQuery = {
      page: currentPage,
      limit: pageSize,
      sort: filters.sort as ProjectQuery['sort'],
      order: filters.order as ProjectQuery['order']
    };

    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status as Project['status'];
    if (filters.tech_stack.length > 0) params.tech_stack = filters.tech_stack;
    if (filters.featured) params.featured = true;
    if (filters.open_source) params.open_source = true;

    return params;
  };

  const { data: projectsData, isLoading, error } = useProjects(buildQueryParams());
  const { data: techStatsData } = useTechStats();

  const projects = projectsData?.data?.projects || [];
  const pagination = projectsData?.data?.pagination;
  const availableTechStacks = techStatsData?.data?.map((stat: ProjectTech) => stat.name) || [];

  // 当筛选条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.tech_stack, filters.featured, filters.open_source]);

  const handleFilterChange = (newFilters: Partial<ProjectFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleFilterReset = () => {
    setFilters({
      search: '',
      status: '',
      tech_stack: [],
      featured: false,
      open_source: false,
      sort: 'created_at',
      order: 'desc'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">开源项目</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                探索我的开源项目和技术实践，涵盖Web开发、移动应用、工具软件等多个领域
              </p>
            </div>

            {/* Stats */}
            {projectsData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pagination?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">项目总数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects.reduce((sum: number, project: Project) => sum + project.star_count, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">总星标数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {availableTechStacks.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">技术栈</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projects.filter((p: Project) => p.is_open_source).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">开源项目</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <ProjectFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
            availableTechStacks={availableTechStacks}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
              <div className="text-red-600 dark:text-red-400">
                <h3 className="text-lg font-semibold mb-2">加载失败</h3>
                <p>无法加载项目列表，请稍后重试。</p>
              </div>
            </div>
          )}

          {/* Projects List */}
          <ProjectList projects={projects} loading={isLoading} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
