import React, { useState } from 'react';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import { Overview } from './Overview';
import { Traffic } from './Traffic';
import { Audience } from './Audience';
import { Content } from './Content';

type TabType = 'overview' | 'traffic' | 'audience' | 'content';

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    {
      id: 'overview' as TabType,
      name: '概览',
      icon: <BarChart3 className="w-4 h-4" />,
      description: '查看整体数据表现'
    },
    {
      id: 'traffic' as TabType,
      name: '流量分析',
      icon: <TrendingUp className="w-4 h-4" />,
      description: '页面访问和流量来源'
    },
    {
      id: 'audience' as TabType,
      name: '用户分析',
      icon: <Users className="w-4 h-4" />,
      description: '用户设备和地理分布'
    },
    {
      id: 'content' as TabType,
      name: '内容分析',
      icon: <FileText className="w-4 h-4" />,
      description: '文章和项目表现'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'traffic':
        return <Traffic />;
      case 'audience':
        return <Audience />;
      case 'content':
        return <Content />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">数据分析</h1>
        <p className="text-gray-600 dark:text-gray-400">全面了解网站的访问情况和用户行为</p>
      </div>

      {/* 标签导航 */}
      <div className="card mb-6">
        <div className="card-body p-0">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* 标签内容 */}
      <div className="transition-all duration-300 ease-in-out">{renderContent()}</div>
    </div>
  );
};
