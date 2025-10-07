import React, { useState } from 'react';
import { CustomLineChart, CustomAreaChart } from '../Charts';
import { TrendingUp } from 'lucide-react';
import { TrendChartProps } from '../../types/analytics';
import { formatShortDate } from '../../utils/date';

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  loading = false,
  onPeriodChange,
  currentPeriod = 'day'
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const handlePeriodClick = (period: 'day' | 'week' | 'month') => {
    onPeriodChange?.(period);
  };

  const getDisplayDateRange = () => {
    const now = new Date();
    let start: Date;
    
    switch (currentPeriod) {
      case 'day':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      start: formatShortDate(start),
      end: formatShortDate(now)
    };
  };

  
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const ChartComponent = chartType === 'line' ? CustomLineChart : CustomAreaChart;

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              访问趋势
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {getDisplayDateRange().start} - {getDisplayDateRange().end}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => handlePeriodClick(period)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPeriod === period
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period === 'day' ? '日' : period === 'week' ? '周' : '月'}
                </button>
              ))}
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                面积图
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                折线图
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartComponent
              data={data.map(item => ({
                date: item.period,
                value: item.page_views
              }))}
              stroke="#3b82f6"
              fill="#3b82f6"
              height={300}
              title="页面浏览量"
              dataKey="value"
              xAxisDataKey="date"
              xAxisKey="date"
              yAxisKeys={['value']}
              showGrid={true}
              showTooltip={true}
              showLegend={false}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                独立访客
              </h4>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data[data.length - 1]?.unique_visitors || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                会话数: {data[data.length - 1]?.sessions || 0}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">平均浏览量</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.length > 0
                    ? Math.round(data.reduce((sum, item) => sum + item.page_views, 0) / data.length)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">峰值浏览量</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.length > 0 ? Math.max(...data.map(item => item.page_views)) : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">总访客数</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.reduce((sum, item) => sum + item.unique_visitors, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
