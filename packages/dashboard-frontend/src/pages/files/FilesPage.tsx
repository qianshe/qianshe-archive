import React from 'react';
import EmptyState from '../../components/EmptyState';

export const FilesPage: React.FC = () => {
  return (
    <div className="container-responsive py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">文件管理</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <EmptyState
            type="no-data"
            title="文件管理功能正在开发中"
            description="我们正在努力开发文件管理功能，敬请期待。"
          />
        </div>
      </div>
    </div>
  );
};
