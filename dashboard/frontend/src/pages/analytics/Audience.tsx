import React from 'react';
import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { DeviceStats } from '../../components/Analytics/DeviceStats';
import { GeoStats } from '../../components/Analytics/GeoStats';
import { useDeviceStats, useGeoStats, useDateRange, DATE_PRESETS } from '../../hooks/useAnalytics';

// 设备统计数据接口
interface DeviceData {
  devices: Array<{
    device_type: string;
    visits: number;
    unique_visitors?: number;
  }>;
  browsers: Array<{
    name: string;
    visits: number;
    browser?: string;
  }>;
}

// 地理统计数据接口
interface GeoData {
  geography: Array<{
    country: string;
    visits: number;
  }>;
}

export const Audience: React.FC = () => {
  const { startDate, endDate, preset, setPresetRange } = useDateRange(30);

  const {
    data: deviceData,
    isLoading: deviceLoading,
    error: deviceError
  } = useDeviceStats(startDate, endDate);

  const {
    data: geoData,
    isLoading: geoLoading,
    error: geoError
  } = useGeoStats(20, startDate, endDate);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (deviceError || geoError) {
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
              <p className="text-gray-500 dark:text-gray-400 mb-6">无法加载用户数据，请稍后重试</p>
              <button onClick={handleRefresh} className="btn btn-primary">
                重新加载
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalDevices =
    deviceData?.devices?.reduce((sum: number, device: DeviceData['devices'][0]) => sum + device.visits, 0) || 0;
  const totalGeoVisits =
    geoData?.geography?.reduce((sum: number, item: GeoData['geography'][0]) => sum + item.visits, 0) || 0;

  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">用户分析</h1>
        <p className="text-gray-600 dark:text-gray-400">了解用户设备使用情况和地理分布</p>
      </div>

      {/* 日期筛选 */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-500" />
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

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Monitor className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">桌面端</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {deviceData?.devices
                    ?.find((d: DeviceData['devices'][0]) => d.device_type === 'desktop')
                    ?.visits?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {totalDevices > 0
                    ? (
                      ((deviceData?.devices?.find((d: DeviceData['devices'][0]) => d.device_type === 'desktop')
                        ?.visits || 0) /
                          totalDevices) *
                        100
                    ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Smartphone className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">移动端</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {deviceData?.devices
                    ?.find((d: DeviceData['devices'][0]) => d.device_type === 'mobile')
                    ?.visits?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {totalDevices > 0
                    ? (
                      ((deviceData?.devices?.find((d: DeviceData['devices'][0]) => d.device_type === 'mobile')
                        ?.visits || 0) /
                          totalDevices) *
                        100
                    ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Tablet className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平板</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {deviceData?.devices
                    ?.find((d: DeviceData['devices'][0]) => d.device_type === 'tablet')
                    ?.visits?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {totalDevices > 0
                    ? (
                      ((deviceData?.devices?.find((d: DeviceData['devices'][0]) => d.device_type === 'tablet')
                        ?.visits || 0) /
                          totalDevices) *
                        100
                    ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">覆盖国家</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {geoData?.geography?.length || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  总访问 {totalGeoVisits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 设备统计 */}
      <div className="mb-8">
        <DeviceStats
          devices={deviceData?.devices || []}
          browsers={deviceData?.browsers || []}
          loading={deviceLoading}
        />
      </div>

      {/* 地理分布 */}
      <div>
        <GeoStats data={geoData?.geography || []} loading={geoLoading} />
      </div>

      {/* 用户行为分析 */}
      {deviceData?.devices && deviceData?.browsers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                设备偏好分析
              </h3>
              <div className="space-y-4">
                {deviceData.devices.map((device: DeviceData['devices'][0]) => {
                  const deviceIcon =
                    device.device_type === 'desktop' ? (
                      <Monitor className="w-4 h-4" />
                    ) : device.device_type === 'mobile' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Tablet className="w-4 h-4" />
                    );

                  const deviceName =
                    device.device_type === 'desktop'
                      ? '桌面端'
                      : device.device_type === 'mobile'
                        ? '移动端'
                        : '平板';

                  const avgSessionsPerVisitor =
                    (device.unique_visitors ?? 0) > 0
                      ? (device.visits / (device.unique_visitors ?? 0)).toFixed(2)
                      : '0';

                  return (
                    <div
                      key={device.device_type}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-500">{deviceIcon}</div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {deviceName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {(device.unique_visitors ?? 0).toLocaleString()} 独立访客
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {avgSessionsPerVisitor} 会话/访客
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {device.visits.toLocaleString()} 总会话
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                浏览器使用趋势
              </h3>
              <div className="space-y-3">
                {deviceData.browsers.slice(0, 5).map((browser: DeviceData['browsers'][0], index: number) => {
                  const totalBrowserVisits = deviceData.browsers.reduce(
                    (sum: number, b: DeviceData['browsers'][0]) => sum + b.visits,
                    0
                  );
                  const percentage =
                    totalBrowserVisits > 0 ? (browser.visits / totalBrowserVisits) * 100 : 0;

                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-orange-500',
                    'bg-purple-500',
                    'bg-pink-500'
                  ];

                  return (
                    <div key={browser.browser} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {browser.browser}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
