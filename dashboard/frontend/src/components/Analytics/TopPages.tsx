import React from 'react';
import { ExternalLink, TrendingUp, Clock, Users } from 'lucide-react';
import { CustomBarChart } from '../Charts';

interface PageData {
  page_url: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
}

interface TopPagesProps {
  data: PageData[];
  loading?: boolean;
}

export const TopPages: React.FC<TopPagesProps> = ({ data, loading = false }) => {
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '--';
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    return `${Math.round(seconds / 3600)}小时`;
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  };

  const pageTitle = (title: string, url: string) => {
    return title || formatUrl(url);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">热门页面</h3>
          <div className="text-sm text-gray-500 dark:text-gray-500">Top {data.length} 页面</div>
        </div>

        {/* 图表视图 */}
        <div className="mb-8">
          <CustomBarChart
            data={data.slice(0, 10).map((item) => ({
              date:
                pageTitle(item.page_title, item.page_url).substring(0, 20) +
                (pageTitle(item.page_title, item.page_url).length > 20 ? '...' : ''),
              value: item.views,
              label: item.page_title
            }))}
            fill="#3b82f6"
            height={300}
            title="页面浏览量排行"
            dataKey="value"
            xAxisDataKey="date"
          />
        </div>

        {/* 列表视图 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  页面
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  浏览量
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  访客数
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  平均停留时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((page, index) => (
                <tr
                  key={page.page_url}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : index === 1
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              : index === 2
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center max-w-md">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {pageTitle(page.page_title, page.page_url)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {formatUrl(page.page_url)}
                        </p>
                      </div>
                      <a
                        href={page.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                      {page.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 mr-1 text-green-500" />
                      {page.unique_visitors.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Clock className="w-4 h-4 mr-1 text-orange-500" />
                      {formatDuration(page.avg_duration)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">暂无页面数据</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
