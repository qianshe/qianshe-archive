import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Home from '@/pages/Home';
import Blog from '@/pages/Blog';
import Projects from '@/pages/Projects';
import About from '@/pages/About';
import ProjectDetail from '@/pages/ProjectDetail';
import BlogPostDetail from '@/pages/BlogPost';
import './styles/globals.css';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟 (garbage collection time)
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-6-2.709M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                        />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      404 - 页面未找到
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      抱歉，您访问的页面不存在或已被移动。
                    </p>
                    <a
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      返回首页
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>

      {/* 开发环境显示React Query Devtools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
