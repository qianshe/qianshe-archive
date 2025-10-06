import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PostsPage } from './pages/posts/PostsPage';
import { PostEditorPage } from './pages/posts/PostEditorPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectEditorPage } from './pages/projects/ProjectEditorPage';
import { CommentsPage } from './pages/comments/CommentsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { FilesPage } from './pages/files/FilesPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
                  <Route path="posts" element={<PostsPage />} />
                  <Route path="posts/new" element={<PostEditorPage />} />
                  <Route path="posts/:id/edit" element={<PostEditorPage />} />

                  {/* 项目管理 */}
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/new" element={<ProjectEditorPage />} />
                  <Route path="projects/:id/edit" element={<ProjectEditorPage />} />

                  {/* 评论管理 */}
                  <Route path="comments" element={<CommentsPage />} />

                  {/* 用户管理 */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 数据分析 */}
                  <Route path="analytics" element={<AnalyticsPage />} />

                  {/* 文件管理 */}
                  <Route path="files" element={<FilesPage />} />

                  {/* 系统设置 */}
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <SettingsPage />
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
