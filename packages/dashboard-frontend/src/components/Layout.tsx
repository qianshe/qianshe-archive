import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  BarChart3,
  Folder,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  // 桌面端侧边栏折叠状态（使用localStorage持久化）
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // 持久化侧边栏折叠状态
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // 导航菜单配置
  const navigation: NavigationItem[] = [
    { name: '仪表盘', href: '/dashboard', icon: Home },
    { name: '文章管理', href: '/posts', icon: FileText },
    { name: '项目管理', href: '/projects', icon: FolderOpen },
    { name: '评论管理', href: '/comments', icon: MessageSquare },
    { name: '用户管理', href: '/users', icon: Users, roles: ['admin'] },
    { name: '数据分析', href: '/analytics', icon: BarChart3 },
    { name: '文件管理', href: '/files', icon: Folder },
    { name: '系统设置', href: '/settings', icon: Settings, roles: ['admin'] }
  ];

  // 根据用户角色过滤导航
  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // 获取页面标题
  const getPageTitle = () => {
    const current = navigation.find(item => item.href === location.pathname);
    return current?.name || '仪表盘';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 桌面端侧边栏 - Fixed定位 + 折叠功能 */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? 64 : 256
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex fixed left-0 top-0 h-screen z-40 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">谦</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
                谦舍
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md mx-auto">
              <span className="text-white font-bold text-xl">谦</span>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-2 py-5 space-y-1.5 overflow-y-auto">
          {filteredNavigation.map(item => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`group flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3.5'} py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:translate-x-0.5'
                }`}
              >
                <item.icon
                  className={`${sidebarCollapsed ? '' : 'mr-3.5'} h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 scale-110'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:scale-105'
                  }`}
                />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* 折叠按钮 */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-200" />
            ) : (
              <>
                <ChevronLeft className="mr-2.5 h-5 w-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="whitespace-nowrap">收起侧边栏</span>
              </>
            )}
          </button>

          {/* 退出登录 */}
          <button
            onClick={logout}
            title={sidebarCollapsed ? '退出登录' : undefined}
            className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
          >
            <LogOut className={`${sidebarCollapsed ? '' : 'mr-2.5'} h-5 w-5 group-hover:rotate-12 transition-transform duration-200`} />
            {!sidebarCollapsed && <span className="whitespace-nowrap">退出登录</span>}
          </button>
        </div>
      </motion.aside>

      {/* 移动端侧边栏 */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">谦</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                谦舍
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {filteredNavigation.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3.5 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:translate-x-0.5'
                  }`}
                >
                  <item.icon
                    className={`mr-3.5 h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 scale-110'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:scale-105'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 底部操作 */}
          <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            >
              <LogOut className="mr-2.5 h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
              退出登录
            </button>
          </div>
        </div>
      </motion.aside>

      {/* 主内容区域 - 动态适配侧边栏宽度 */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* 顶部导航栏 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {/* 主题切换 */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                title="切换主题"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* 通知 */}
              <div className="relative">
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="relative p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {/* 未读通知徽章 */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                </button>

                {/* 通知下拉菜单 */}
                {notificationMenuOpen && (
                  <>
                    {/* 点击遮罩关闭菜单 */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20"
                    >
                      {/* 通知标题 */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          通知消息
                        </h3>
                      </div>

                      {/* 通知列表 */}
                      <div className="max-h-96 overflow-y-auto">
                        {/* 示例通知项 */}
                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                新评论通知
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                您的文章收到了新的评论
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                5分钟前
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                系统更新
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                系统已更新到最新版本
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                1小时前
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                项目审核通过
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                您提交的项目已通过审核
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                2小时前
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 底部操作 */}
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setNotificationMenuOpen(false)}
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          查看全部通知
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* 用户菜单 */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.display_name || user?.username}
                  </span>
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <>
                    {/* 点击遮罩关闭菜单 */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20"
                    >
                      {/* 用户信息 */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.display_name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {user?.email}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          {user?.role === 'admin' ? '管理员' : '用户'}
                        </p>
                      </div>

                      {/* 菜单项 */}
                      <div className="py-1">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          个人设置
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          退出登录
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
