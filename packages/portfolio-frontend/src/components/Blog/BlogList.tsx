import React from 'react';
import BlogCard from './BlogCard';
import EmptyState from '@/components/Common/EmptyState';
import { BlogPost } from '@/types';

interface BlogListProps {
  posts: BlogPost[];
  loading?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ posts, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>

            {/* Content placeholder */}
            <div className="p-6 space-y-4">
              {/* Category badge placeholder */}
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>

              {/* Title placeholder */}
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>

              {/* Excerpt placeholder */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
              </div>

              {/* Meta placeholder */}
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        type="search"
        title="暂无文章"
        description="还没有发布的文章，或者当前筛选条件下没有找到相关内容。"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default BlogList;
