import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { CustomPieChart } from '../Charts';
import { GeoStatsProps } from '../../types/analytics';

export const GeoStats: React.FC<GeoStatsProps> = ({ data, loading = false }) => {
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      China: '🇨🇳',
      'United States': '🇺🇸',
      Japan: '🇯🇵',
      'South Korea': '🇰🇷',
      'United Kingdom': '🇬🇧',
      Germany: '🇩🇪',
      France: '🇫🇷',
      Canada: '🇨🇦',
      Australia: '🇦🇺',
      Singapore: '🇸🇬',
      India: '🇮🇳',
      Brazil: '🇧🇷',
      Russia: '🇷🇺',
      Italy: '🇮🇹',
      Spain: '🇪🇸',
      Netherlands: '🇳🇱',
      Switzerland: '🇨🇭',
      Sweden: '🇸🇪',
      Norway: '🇳🇴',
      Denmark: '🇩🇰'
    };
    return flags[country] || '🌍';
  };

  const getCountryName = (country: string) => {
    const names: { [key: string]: string } = {
      China: '中国',
      'United States': '美国',
      Japan: '日本',
      'South Korea': '韩国',
      'United Kingdom': '英国',
      Germany: '德国',
      France: '法国',
      Canada: '加拿大',
      Australia: '澳大利亚',
      Singapore: '新加坡',
      India: '印度',
      Brazil: '巴西',
      Russia: '俄罗斯',
      Italy: '意大利',
      Spain: '西班牙',
      Netherlands: '荷兰',
      Switzerland: '瑞士',
      Sweden: '瑞典',
      Norway: '挪威',
      Denmark: '丹麦'
    };
    return names[country] || country;
  };

  // 按国家聚合数据
  const countryData = data.reduce(
    (acc, item) => {
      const existing = acc.find(c => c.country === item.country);
      if (existing) {
        existing.visits += item.visits;
        existing.unique_visitors += item.unique_visitors;
      } else {
        acc.push({
          country: item.country,
          visits: item.visits,
          unique_visitors: item.unique_visitors
        });
      }
      return acc;
    },
    [] as { country: string; visits: number; unique_visitors: number }[]
  );

  const totalVisits = countryData.reduce((sum, country) => sum + country.visits, 0);

  const pieData = countryData.slice(0, 8).map((country) => ({
    name: getCountryName(country.country),
    value: country.visits
  }));

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center mb-6">
          <Globe className="w-5 h-5 mr-2 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">地理位置分布</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 饼图 */}
          <div>
            {pieData.length > 0 ? (
              <CustomPieChart
                data={pieData}
                height={300}
                showLegend={true}
                innerRadius={40}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                  <p className="text-sm text-gray-500 dark:text-gray-500">暂无地理数据</p>
                </div>
              </div>
            )}
          </div>

          {/* 详细列表 */}
          <div className="space-y-3">
            {countryData.slice(0, 10).map((country) => {
              const percentage =
                totalVisits > 0 ? ((country.visits / totalVisits) * 100).toFixed(1) : '0';

              return (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCountryFlag(country.country)}</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getCountryName(country.country)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {country.unique_visitors.toLocaleString()} 访客
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">{percentage}%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {country.visits.toLocaleString()} 次
                    </div>
                  </div>
                </div>
              );
            })}

            {countryData.length === 0 && !loading && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                <p className="text-sm text-gray-500 dark:text-gray-500">暂无地理数据</p>
              </div>
            )}
          </div>
        </div>

        {/* 城市详情 */}
        {data.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">热门城市</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data
                .filter(item => item.city && item.city.trim() !== '')
                .slice(0, 9)
                .map((item, index) => (
                  <div
                    key={`${item.country}-${item.city}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.city}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({getCountryName(item.country)})
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
