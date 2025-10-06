import React from 'react';
import { OverviewCards } from '../../components/Analytics/OverviewCards';
import { TrendChart } from '../../components/Analytics/TrendChart';
import { useOverviewStats, useTrends } from '../../hooks/useAnalytics';

export const Overview: React.FC = () => {
  const [trendPeriod, setTrendPeriod] = React.useState<'day' | 'week' | 'month'>('day');

  const {
    data: overviewData,
    error: overviewError
  } = useOverviewStats();
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useTrends(trendPeriod);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (overviewError || trendsError) {
    return (
      <div className="container-responsive py-6">
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">加载失败</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">无法加载分析数据，请稍后重试</p>
              <button onClick={handleRefresh} className="btn btn-primary">
                重新加载
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">数据概览</h1>
        <p className="text-gray-600 dark:text-gray-400">查看网站的整体表现和关键指标</p>
      </div>

      {/* 概览卡片 */}
      <div className="mb-8">
        <OverviewCards
          data={
            overviewData || {
              pageViews: { total: 0, today: 0, growth: 0 },
              visitors: { total: 0, today: 0, growth: 0 },
              posts: { total: 0, published: 0, this_month: 0 },
              projects: { total: 0, published: 0, this_month: 0 },
              comments: { total: 0, approved: 0, pending: 0, this_month: 0 }
            }
          }
        />
      </div>

      {/* 访问趋势 */}
      <div className="mb-8">
        <TrendChart
          data={trendsData?.trends || []}
          loading={trendsLoading}
          currentPeriod={trendPeriod}
          onPeriodChange={setTrendPeriod}
        />
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">今日访问</h4>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overviewData?.pageViews?.today?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              较昨日 {overviewData?.pageViews?.growth > 0 ? '+' : ''}
              {overviewData?.pageViews?.growth?.toFixed(1) || 0}%
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">活跃访客</h4>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {overviewData?.visitors?.today?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              较昨日 {overviewData?.visitors?.growth > 0 ? '+' : ''}
              {overviewData?.visitors?.growth?.toFixed(1) || 0}%
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">文章数量</h4>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {overviewData?.posts?.published || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              本月新增 {overviewData?.posts?.this_month || 0}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">项目数量</h4>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {overviewData?.projects?.published || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              本月新增 {overviewData?.projects?.this_month || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
