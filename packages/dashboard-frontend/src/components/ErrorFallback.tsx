import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          糟糕！出现了一些问题
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          应用程序遇到了一个错误，我们正在努力解决。您可以尝试刷新页面或返回首页。
        </p>

        {/* Error Details (only in development) */}
        {import.meta.env.DEV && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              错误详情：
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                  查看堆栈跟踪
                </summary>
                <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新加载</span>
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
