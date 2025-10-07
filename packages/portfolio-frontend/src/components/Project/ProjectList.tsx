import React from 'react';
import ProjectCard from './ProjectCard';
import EmptyState from '@/components/Common/EmptyState';
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
      <EmptyState
        type="search"
        title="暂无项目"
        description="还没有发布的开源项目，或者当前筛选条件下没有找到相关内容。"
      />
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
