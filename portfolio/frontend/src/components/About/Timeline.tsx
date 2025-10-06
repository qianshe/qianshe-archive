import React from 'react';
import {
  Briefcase,
  GraduationCap,
  Trophy,
  Code,
  Calendar,
  ExternalLink,
  User
} from 'lucide-react';
import { TimelineItem } from '@/types';

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  const getTypeIcon = (type: TimelineItem['type']) => {
    const iconMap = {
      work: Briefcase,
      education: GraduationCap,
      project: Code,
      achievement: Trophy,
      other: User
    };
    return iconMap[type] || iconMap.other;
  };

  const getTypeName = (type: TimelineItem['type']) => {
    const nameMap = {
      work: '工作经历',
      education: '教育经历',
      project: '项目经历',
      achievement: '成就奖项',
      other: '其他'
    };
    return nameMap[type] || '其他';
  };

  const getTypeColor = (type: TimelineItem['type']) => {
    const colorMap = {
      work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      education: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      project: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colorMap[type] || colorMap.other;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    });
  };

  // 按日期排序（最新的在前）
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人时间线</h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">暂无时间线内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人时间线</h2>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

        {/* Timeline Items */}
        <div className="space-y-6">
          {sortedItems.map((item) => {
            const IconComponent = getTypeIcon(item.type);

            return (
              <div key={item.id} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border-2 border-emerald-500 rounded-full z-10">
                  <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Content */}
                <div className="ml-6 flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}
                        >
                          {getTypeName(item.type)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                          >
                            {item.title}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.filter(item => item.type === 'work').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">工作经历</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.filter(item => item.type === 'project').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">项目经历</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.filter(item => item.type === 'education').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">教育经历</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.filter(item => item.type === 'achievement').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">成就奖项</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
