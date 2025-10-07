import React, { ReactNode } from 'react';
import { FileQuestion, SearchX, Inbox, AlertCircle } from 'lucide-react';

export type EmptyStateType = 'default' | 'search' | 'error' | 'no-data';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  // 默认配置
  const getDefaultConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: <SearchX className="w-16 h-16 text-gray-400 dark:text-gray-500" />,
          title: '未找到搜索结果',
          description: '尝试使用不同的关键词或筛选条件'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500" />,
          title: '出现了一些问题',
          description: '抱歉，无法加载内容。请稍后重试。'
        };
      case 'no-data':
        return {
          icon: <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-500" />,
          title: '暂无内容',
          description: '这里还没有任何内容'
        };
      default:
        return {
          icon: <FileQuestion className="w-16 h-16 text-gray-400 dark:text-gray-500" />,
          title: '空空如也',
          description: '这里什么也没有'
        };
    }
  };

  const defaultConfig = getDefaultConfig();
  const displayIcon = icon || defaultConfig.icon;
  const displayTitle = title || defaultConfig.title;
  const displayDescription = description || defaultConfig.description;

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div className="mb-6">{displayIcon}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">{displayDescription}</p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
