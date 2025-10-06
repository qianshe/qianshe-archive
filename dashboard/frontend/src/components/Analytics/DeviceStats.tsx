import React from 'react';
import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { CustomPieChart } from '../Charts';
import { DeviceStatsProps } from '../../types/analytics';

export const DeviceStats: React.FC<DeviceStatsProps> = ({ devices, browsers, loading = false }) => {
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceName = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return '桌面端';
      case 'mobile':
        return '移动端';
      case 'tablet':
        return '平板';
      default:
        return deviceType;
    }
  };

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return '#3b82f6';
      case 'mobile':
        return '#10b981';
      case 'tablet':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const totalVisits = devices.reduce((sum, device) => sum + device.visits, 0);

  const devicePieData = devices.map(device => ({
    name: getDeviceName(device.device_type),
    value: device.visits,
    color: getDeviceColor(device.device_type)
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 设备类型统计 */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center mb-6">
            <Monitor className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">设备类型分布</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CustomPieChart
                data={devicePieData}
                height={200}
                showLegend={false}
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              />
            </div>

            <div className="space-y-4">
              {devices.map(device => {
                const percentage =
                  totalVisits > 0 ? ((device.visits / totalVisits) * 100).toFixed(1) : '0';
                return (
                  <div key={device.device_type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: getDeviceColor(device.device_type) }}
                      ></div>
                      <div className="flex items-center">
                        {getDeviceIcon(device.device_type)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {getDeviceName(device.device_type)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {device.visits.toLocaleString()} 次
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 浏览器统计 */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center mb-6">
            <Globe className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">浏览器使用统计</h3>
          </div>

          <div className="space-y-4">
            {browsers.slice(0, 8).map((browser, index) => {
              const maxVisits = Math.max(...browsers.map(b => b.visits));
              const percentage = maxVisits > 0 ? (browser.visits / maxVisits) * 100 : 0;

              const getBrowserColor = (index: number) => {
                const colors = [
                  '#3b82f6',
                  '#10b981',
                  '#f59e0b',
                  '#ef4444',
                  '#8b5cf6',
                  '#ec4899',
                  '#06b6d4',
                  '#84cc16'
                ];
                return colors[index % colors.length];
              };

              return (
                <div key={browser.browser} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {browser.browser}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {browser.visits.toLocaleString()} ({browser.unique_visitors.toLocaleString()}{' '}
                      访客)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getBrowserColor(index)
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {browsers.length === 0 && !loading && (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
              <p className="text-sm text-gray-500 dark:text-gray-500">暂无浏览器数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};