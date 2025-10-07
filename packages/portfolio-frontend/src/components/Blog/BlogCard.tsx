import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Heart, MessageCircle, Clock } from 'lucide-react';
import { BlogPost } from '@/types';
import { formatDate, calculateReadTime } from '@/utils/date';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, className = '' }) => {

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'blog':
        return '博客';
      case 'project':
        return '项目';
      case 'announcement':
        return '公告';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blog':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'project':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'announcement':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <article
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Featured Image */}
      {post.cover_image && (
        <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </Link>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}
          >
            {getCategoryLabel(post.category)}
          </span>
          {post.is_featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              精选
            </span>
          )}
          {post.is_top && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              置顶
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          <Link to={`/blog/${post.slug}`} className="line-clamp-2">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(post.content)} 分钟阅读</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {post.view_count > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.view_count}</span>
              </div>
            )}
            {post.like_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.like_count}</span>
              </div>
            )}
            {post.comment_count > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comment_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
