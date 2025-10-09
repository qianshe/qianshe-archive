import React from 'react';
import { FileText, Eye, CheckCircle, FileEdit } from 'lucide-react';
import { BlogPostStats } from '../types/blog';

interface PostStatsCardsProps {
  stats: BlogPostStats;
  loading?: boolean;
}

export const PostStatsCards: React.FC<PostStatsCardsProps> = ({ stats, loading = false }) => {
  const cards = [
    {
      title: '总文章数',
      value: stats.total,
      icon: FileText,
      color: 'blue',
      bgClass: 'bg-blue-100 dark:bg-blue-900/20',
      iconClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: '已发布',
      value: stats.published,
      icon: CheckCircle,
      color: 'green',
      bgClass: 'bg-green-100 dark:bg-green-900/20',
      iconClass: 'text-green-600 dark:text-green-400'
    },
    {
      title: '草稿',
      value: stats.draft,
      icon: FileEdit,
      color: 'yellow',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconClass: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: '总浏览量',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'purple',
      bgClass: 'bg-purple-100 dark:bg-purple-900/20',
      iconClass: 'text-purple-600 dark:text-purple-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-3 ${card.bgClass} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${card.iconClass}`} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
