import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  link?: string;
}

interface RecentItem {
  id: string | number;
  title: string;
  type: 'post' | 'project' | 'comment';
  status?: string;
  createdAt: string;
  author?: string;
}

export const DashboardPage: React.FC = () => {
  // 模拟统计数据 - 实际应用中会从API获取
  const stats: StatCard[] = [
    {
      title: '总文章数',
      value: '42',
      change: 12.5,
      icon: FileText,
      color: 'blue',
      link: '/posts'
    },
    {
      title: '总项目数',
      value: '18',
      change: 8.2,
      icon: FolderOpen,
      color: 'green',
      link: '/projects'
    },
    {
      title: '总评论数',
      value: '256',
      change: -2.4,
      icon: MessageSquare,
      color: 'purple',
      link: '/comments'
    },
    {
      title: '总用户数',
      value: '1,234',
      change: 18.7,
      icon: Users,
      color: 'orange',
      link: '/users'
    },
    {
      title: '今日访问',
      value: '567',
      change: 23.1,
      icon: Eye,
      color: 'indigo'
    },
    {
      title: '本月增长',
      value: '15.3%',
      change: 5.8,
      icon: TrendingUp,
      color: 'pink'
    }
  ];

  // 模拟最近内容
  const recentItems: RecentItem[] = [
    {
      id: 1,
      title: 'React 18 新特性详解',
      type: 'post',
      status: 'published',
      createdAt: '2024-01-15 10:30',
      author: '谦舍'
    },
    {
      id: 2,
      title: 'TypeScript 最佳实践指南',
      type: 'post',
      status: 'draft',
      createdAt: '2024-01-15 09:15',
      author: '谦舍'
    },
    {
      id: 3,
      title: '个人博客系统重构完成',
      type: 'project',
      status: 'published',
      createdAt: '2024-01-14 16:45',
      author: '谦舍'
    },
    {
      id: 4,
      title: '这篇文章写得很好，学习了！',
      type: 'comment',
      status: 'pending',
      createdAt: '2024-01-14 14:20',
      author: '访客'
    },
    {
      id: 5,
      title: '前端性能优化技巧分享',
      type: 'post',
      status: 'published',
      createdAt: '2024-01-13 11:00',
      author: '谦舍'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'project':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'comment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; icon: string }> = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/20',
        icon: 'text-indigo-600 dark:text-indigo-400'
      },
      pink: {
        bg: 'bg-pink-100 dark:bg-pink-900/20',
        icon: 'text-pink-600 dark:text-pink-400'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="container-responsive py-8">
      {/* 页面标题 */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">仪表盘</h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          欢迎回到谦舍管理后台，这里是您的数据概览。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          const colorClasses = getStatColorClasses(stat.color);
          const card = (
            <div key={stat.title} className="card hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group">
              <div className="card-body p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <div className="flex items-center mt-2">
                        <TrendingUp
                          className={`w-4 h-4 mr-1 ${
                            stat.change > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            stat.change > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {stat.change > 0 ? '+' : ''}
                          {stat.change}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          vs 上月
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 ${colorClasses.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                  </div>
                </div>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={stat.title} to={stat.link}>
              {card}
            </Link>
          ) : (
            card
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* 最近内容 */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="card-header bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
                最近内容
              </h2>
            </div>
          </div>
          <div className="card-body p-6">
            <div className="space-y-4">
              {recentItems.map(item => (
                <div key={item.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 -mx-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`badge ${getTypeColor(item.type)}`}>
                        {item.type === 'post' ? '文章' : item.type === 'project' ? '项目' : '评论'}
                      </span>
                      {item.status && (
                        <span className={`badge ${getStatusColor(item.status)}`}>
                          {item.status === 'published'
                            ? '已发布'
                            : item.status === 'draft'
                              ? '草稿'
                              : '待审核'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.author && <span>{item.author}</span>}
                      {item.author && <span className="mx-1">•</span>}
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/posts"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                查看全部内容 →
              </Link>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="card-header bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <AlertCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-2" />
                快速操作
              </h2>
            </div>
          </div>
          <div className="card-body p-6">
            <div className="space-y-4">
              <Link
                to="/posts/new"
                className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">新建文章</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">创建新的博客文章</p>
                </div>
              </Link>

              <Link
                to="/projects/new"
                className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <FolderOpen className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">新建项目</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">添加新的项目展示</p>
                </div>
              </Link>

              <Link
                to="/comments"
                className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">审核评论</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">管理用户评论</p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md"
              >
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">查看统计</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">分析访问数据</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
