import React from 'react';
import { TrendingUp, TrendingDown, Users, Eye, FileText, MessageSquare } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  description?: string;
}

interface OverviewCardsProps {
  data: {
    pageViews: {
      total: number;
      today: number;
      growth: number;
    };
    visitors: {
      total: number;
      today: number;
      growth: number;
    };
    posts: {
      total: number;
      published: number;
      this_month: number;
    };
    projects: {
      total: number;
      published: number;
      this_month: number;
    };
    comments: {
      total: number;
      approved: number;
      pending: number;
      this_month: number;
    };
  };
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const cards: StatCard[] = [
    {
      title: '页面浏览量',
      value: formatNumber(data.pageViews.total),
      change: data.pageViews.growth,
      changeType: data.pageViews.growth >= 0 ? 'increase' : 'decrease',
      icon: <Eye className="w-5 h-5" />,
      description: `今日新增 ${formatNumber(data.pageViews.today)}`
    },
    {
      title: '访客数量',
      value: formatNumber(data.visitors.total),
      change: data.visitors.growth,
      changeType: data.visitors.growth >= 0 ? 'increase' : 'decrease',
      icon: <Users className="w-5 h-5" />,
      description: `今日新增 ${formatNumber(data.visitors.today)}`
    },
    {
      title: '文章总数',
      value: data.posts.total,
      change: data.posts.this_month,
      changeType: 'increase',
      icon: <FileText className="w-5 h-5" />,
      description: `本月新增 ${data.posts.this_month}，已发布 ${data.posts.published}`
    },
    {
      title: '评论总数',
      value: data.comments.total,
      change: data.comments.pending,
      changeType: data.comments.pending > 0 ? 'decrease' : 'increase',
      icon: <MessageSquare className="w-5 h-5" />,
      description: `待审核 ${data.comments.pending}，已通过 ${data.comments.approved}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.value}
                </p>
                {card.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {card.description}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center
                  text-blue-600 dark:text-blue-400">
                  {card.icon}
                </div>
              </div>
            </div>

            {card.change !== undefined && (
              <div className="flex items-center mt-4">
                {card.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    card.changeType === 'increase'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {card.change > 0 ? '+' : ''}
                  {card.change.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500 ml-2">vs 昨日</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
