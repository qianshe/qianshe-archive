import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { TopPages } from '../../components/Analytics/TopPages';
import {
  usePopularPages,
  useReferrers,
  useDateRange,
  DATE_PRESETS
} from '../../hooks/useAnalytics';

// Referrer数据类型
interface ReferrerInfo {
  referrer: string;
  visits: number;
  pageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export const Traffic: React.FC = () => {
  const { startDate, endDate, preset, setPresetRange } = useDateRange(30);

  const {
    data: pagesData,
    isLoading: pagesLoading,
    error: pagesError
  } = usePopularPages(10, startDate, endDate);

  const {
    data: referrersData,
    isLoading: referrersLoading,
    error: referrersError
  } = useReferrers(10, startDate, endDate);

  const handleRefresh = () => {
    window.location.reload();
  };

  const categorizeReferrer = (referrer: string) => {
    const ref = referrer.toLowerCase();
    if (
      ref.includes('google') ||
      ref.includes('bing') ||
      ref.includes('baidu') ||
      ref.includes('yahoo')
    ) {
      return {
        category: '搜索引擎',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900'
      };
    }
    if (
      ref.includes('twitter') ||
      ref.includes('facebook') ||
      ref.includes('linkedin') ||
      ref.includes('instagram')
    ) {
      return {
        category: '社交媒体',
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900'
      };
    }
    if (ref.includes('github') || ref.includes('gitlab') || ref.includes('stackoverflow')) {
      return {
        category: '开发社区',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900'
      };
    }
    if (ref === 'direct' || ref === '') {
      return {
        category: '直接访问',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-700'
      };
    }
    return {
      category: '其他来源',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900'
    };
  };

  const getReferrerName = (referrer: string) => {
    if (referrer === 'direct' || referrer === '') return '直接访问';

    try {
      const url = new URL(referrer);
      return url.hostname.replace('www.', '');
    } catch {
      return referrer;
    }
  };

  if (pagesError || referrersError) {
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
              <p className="text-gray-500 dark:text-gray-400 mb-6">无法加载流量数据，请稍后重试</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">流量分析</h1>
        <p className="text-gray-600 dark:text-gray-400">查看页面访问情况和流量来源</p>
      </div>

      {/* 日期筛选 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">时间范围</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map(presetOption => (
                <button
                  key={presetOption.value}
                  onClick={() => setPresetRange(presetOption.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    preset === presetOption.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {presetOption.label}
                </button>
              ))}
            </div>
          </div>

          {startDate && endDate && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 热门页面 */}
        <div className="lg:col-span-2">
          <TopPages data={pagesData?.pages || []} loading={pagesLoading} />
        </div>

        {/* 流量来源 */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">流量来源</h3>
            </div>

            {referrersLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {referrersData?.referrers?.slice(0, 10).map((referrer: ReferrerInfo, index: number) => {
                  const { category, color, bg } = categorizeReferrer(referrer.referrer);
                  const totalVisits = referrersData.referrers.reduce(
                    (sum: number, r: ReferrerInfo) => sum + r.visits,
                    0
                  );
                  const percentage =
                    totalVisits > 0 ? ((referrer.visits / totalVisits) * 100).toFixed(1) : '0';

                  return (
                    <div
                      key={`${referrer.referrer}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${bg}`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getReferrerName(referrer.referrer)}
                          </div>
                          <div className={`text-xs ${color}`}>{category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {percentage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {referrer.visits.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!referrersData?.referrers || referrersData.referrers.length === 0) && (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                    <p className="text-sm text-gray-500 dark:text-gray-500">暂无流量来源数据</p>
                  </div>
                )}
              </div>
            )}

            {/* 流量来源分类汇总 */}
            {referrersData?.referrers && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  来源分类
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const categorized = referrersData.referrers.reduce(
                      (acc: any, referrer: any) => {
                        const { category } = categorizeReferrer(referrer.referrer);
                        if (!acc[category]) {
                          acc[category] = { category, visits: 0, unique_visitors: 0 };
                        }
                        acc[category].visits += referrer.visits;
                        acc[category].unique_visitors += referrer.unique_visitors;
                        return acc;
                      },
                      {}
                    );

                    return Object.values(categorized)
                      .sort((a: any, b: any) => b.visits - a.visits)
                      .slice(0, 5)
                      .map((cat: any) => {
                        const totalCatVisits = Object.values(categorized).reduce(
                          (sum: number, c: any) => sum + c.visits,
                          0
                        );
                        const percentage =
                          totalCatVisits > 0
                            ? ((cat.visits / totalCatVisits) * 100).toFixed(1)
                            : '0';

                        return (
                          <div key={cat.category} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {cat.category}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {percentage}% ({cat.visits.toLocaleString()})
                            </span>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
