import React, { useState } from 'react';
import { FileText, Folder, TrendingUp, Eye, Clock, MessageSquare } from 'lucide-react';
import { CustomBarChart } from '../../components/Charts';
import { useContentPerformance, useDateRange, DATE_PRESETS } from '../../hooks/useAnalytics';

export const Content: React.FC = () => {
  const [contentType, setContentType] = useState<'posts' | 'projects'>('posts');
  const { startDate, endDate, preset, setPresetRange } = useDateRange(30);

  const {
    data: contentData,
    isLoading: contentLoading,
    error: contentError
  } = useContentPerformance(contentType, 10, startDate, endDate);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '--';
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`;
    return `${Math.round(seconds / 3600)}小时`;
  };

  const getEngagementLevel = (avgDuration: number) => {
    if (!avgDuration || avgDuration === 0) return { level: '无数据', color: 'text-gray-500' };

    // 根据平均停留时间判断参与度
    if (avgDuration > 300) return { level: '高', color: 'text-green-600 dark:text-green-400' }; // 5分钟以上
    if (avgDuration > 120) return { level: '中', color: 'text-yellow-600 dark:text-yellow-400' }; // 2-5分钟
    return { level: '低', color: 'text-red-600 dark:text-red-400' }; // 2分钟以下
  };

  if (contentError) {
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
              <p className="text-gray-500 dark:text-gray-400 mb-6">无法加载内容数据，请稍后重试</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">内容分析</h1>
        <p className="text-gray-600 dark:text-gray-400">查看文章和项目的表现数据</p>
      </div>

      {/* 控制面板 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 内容类型选择 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center">
                {contentType === 'posts' ? (
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                ) : (
                  <Folder className="w-5 h-5 mr-2 text-green-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  内容类型
                </span>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setContentType('posts')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    contentType === 'posts'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  文章
                </button>
                <button
                  onClick={() => setContentType('projects')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    contentType === 'projects'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  项目
                </button>
              </div>
            </div>

            {/* 日期范围选择 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  时间范围
                </span>
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
          </div>

          {startDate && endDate && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* 内容表现概览 */}
      {contentData?.content && contentData.content.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {contentData.content
                  .reduce((sum: number, item: any) => sum + item.views, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">总浏览量</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {contentData.content
                  .reduce((sum: number, item: any) => sum + item.unique_visitors, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">独立访客</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(
                  contentData.content.reduce(
                    (sum: number, item: any) => sum + (item.avg_duration || 0),
                    0
                  ) / contentData.content.length
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">平均停留时间</div>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {contentData.content.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">内容数量</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 图表 */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {contentType === 'posts' ? '文章' : '项目'}浏览量排行
              </h3>

              {contentLoading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : contentData?.content && contentData.content.length > 0 ? (
                <CustomBarChart
                  data={contentData.content.slice(0, 10).map((item: any) => ({
                    date: item.title.length > 15 ? `${item.title.substring(0, 15)}...` : item.title,
                    value: item.views
                  }))}
                  fill="#3b82f6"
                  height={300}
                  dataKey="value"
                  xAxisDataKey="date"
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    {contentType === 'posts' ? (
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                    ) : (
                      <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      暂无{contentType === 'posts' ? '文章' : '项目'}数据
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 详细列表 */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">详细数据</h3>

            {contentLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contentData?.content?.map((item: any, index: number) => {
                  const engagement = getEngagementLevel(item.avg_duration);

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.views.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.unique_visitors.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-orange-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDuration(item.avg_duration)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${
                              engagement.color.includes('green')
                                ? 'bg-green-500'
                                : engagement.color.includes('yellow')
                                  ? 'bg-yellow-500'
                                  : engagement.color.includes('red')
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                            }`}
                          ></div>
                          <span className={engagement.color}>{engagement.level}</span>
                        </div>
                      </div>

                      {/* 总浏览量（如果有） */}
                      {item.total_views && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              历史总浏览
                            </span>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {item.total_views.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!contentData?.content || contentData.content.length === 0) && (
                  <div className="text-center py-8">
                    {contentType === 'posts' ? (
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                    ) : (
                      <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      暂无{contentType === 'posts' ? '文章' : '项目'}数据
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 内容表现分析 */}
      {contentData?.content && contentData.content.length > 0 && (
        <div className="card mt-6">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              内容表现分析
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 最受欢迎的内容 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  最受欢迎
                </h4>
                <div className="space-y-2">
                  {contentData.content.slice(0, 3).map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : index === 1
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({item.views.toLocaleString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 参与度最高的内容 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  参与度最高
                </h4>
                <div className="space-y-2">
                  {contentData.content
                    .filter((item: any) => item.avg_duration > 0)
                    .sort((a: any, b: any) => (b.avg_duration || 0) - (a.avg_duration || 0))
                    .slice(0, 3)
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.title.length > 20
                            ? `${item.title.substring(0, 20)}...`
                            : item.title}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {formatDuration(item.avg_duration)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* 独立访客最多的内容 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  独立访客最多
                </h4>
                <div className="space-y-2">
                  {contentData.content
                    .sort((a: any, b: any) => b.unique_visitors - a.unique_visitors)
                    .slice(0, 3)
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {item.title.length > 20
                            ? `${item.title.substring(0, 20)}...`
                            : item.title}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {item.unique_visitors.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
