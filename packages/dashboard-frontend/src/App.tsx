import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './styles/globals.css';

// 核心页面 - 直接导入
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// 重量级页面 - 懒加载
const PostsPage = lazy(() => import('./pages/posts/PostsPage').then(m => ({ default: m.PostsPage })));
const PostEditorPage = lazy(() => import('./pages/posts/PostEditorPage').then(m => ({ default: m.PostEditorPage })));
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectEditorPage = lazy(() => import('./pages/projects/ProjectEditorPage').then(m => ({ default: m.ProjectEditorPage })));
const CommentsPage = lazy(() => import('./pages/comments/CommentsPage').then(m => ({ default: m.CommentsPage })));
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(m => ({ default: m.UsersPage })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FilesPage = lazy(() => import('./pages/files/FilesPage').then(m => ({ default: m.FilesPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// 加载组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-300">加载中...</span>
  </div>
);

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Routes>
                {/* 公开路由 */}
                <Route path="/login" element={<LoginPage />} />

                {/* 受保护的路由 */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* 文章管理 */}
                  <Route 
                    path="posts" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PostsPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="posts/new" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PostEditorPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="posts/:id/edit" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PostEditorPage />
                      </Suspense>
                    } 
                  />

                  {/* 项目管理 */}
                  <Route 
                    path="projects" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProjectsPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="projects/new" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProjectEditorPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="projects/:id/edit" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProjectEditorPage />
                      </Suspense>
                    } 
                  />

                  {/* 评论管理 */}
                  <Route 
                    path="comments" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CommentsPage />
                      </Suspense>
                    } 
                  />

                  {/* 用户管理 */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Suspense fallback={<LoadingSpinner />}>
                          <UsersPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* 数据分析 */}
                  <Route 
                    path="analytics" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AnalyticsPage />
                      </Suspense>
                    } 
                  />

                  {/* 文件管理 */}
                  <Route 
                    path="files" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <FilesPage />
                      </Suspense>
                    } 
                  />

                  {/* 系统设置 */}
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Suspense fallback={<LoadingSpinner />}>
                          <SettingsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404页面 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* 全局通知 */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)'
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff'
                    }
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff'
                    }
                  }
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>

      {/* 开发环境显示React Query Devtools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
