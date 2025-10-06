import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ProjectDetail from '@/components/Project/ProjectDetail';
import { useProject } from '@/hooks';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading, error } = useProject(slug || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Cover Image Skeleton */}
          <div className="h-64 md:h-96 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-14"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project?.data) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">项目未找到</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              抱歉，您访问的项目不存在或已被删除。
            </p>
            <a
              href="/projects"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              返回项目列表
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProjectDetail project={project.data} />
    </Layout>
  );
};

export default ProjectDetailPage;
