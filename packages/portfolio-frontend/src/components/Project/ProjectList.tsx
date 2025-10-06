import React from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
          >
            {/* Cover placeholder */}
            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>

            {/* Content placeholder */}
            <div className="p-6 space-y-4">
              {/* Status badges placeholder */}
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="h-5 w-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>

              {/* Title placeholder */}
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>

              {/* Description placeholder */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
              </div>

              {/* Tech stack placeholder */}
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
              </div>

              {/* Meta placeholder */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无项目</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          还没有发布的开源项目，或者当前筛选条件下没有找到相关内容。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;
