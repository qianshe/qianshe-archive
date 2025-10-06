import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginFormData {
  username: string;
  password: string;
}

interface AdminLoginFormData {
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login, adminLogin, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);

  // 用户登录表单
  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors }
  } = useForm<LoginFormData>();

  // 管理员登录表单
  const {
    register: registerAdmin,
    handleSubmit: handleAdminSubmit,
    formState: { errors: adminErrors }
  } = useForm<AdminLoginFormData>();

  // 处理用户登录
  const onUserLogin = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.username, data.password);
    } catch (_error) {
      // 错误已在AuthContext中处理
    }
  };

  // 处理管理员登录
  const onAdminLogin = async (data: AdminLoginFormData) => {
    try {
      clearError();
      await adminLogin(data.password);
    } catch (_error) {
      // 错误已在AuthContext中处理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">谦</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">谦舍管理后台</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            管理您的博客内容和系统设置
          </p>
        </div>

        {/* 登录类型切换 */}
        <div className="flex justify-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'user'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            用户登录
          </button>
          <button
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === 'admin'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            管理员登录
          </button>
        </div>

        {/* 登录表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {loginType === 'user' ? (
            <form onSubmit={handleUserSubmit(onUserLogin)} className="space-y-6">
              {/* 用户名 */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  用户名 / 邮箱
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerUser('username', {
                      required: '请输入用户名或邮箱',
                      minLength: { value: 3, message: '用户名至少3个字符' }
                    })}
                    type="text"
                    autoComplete="username"
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入用户名或邮箱"
                  />
                </div>
                {userErrors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {userErrors.username.message}
                  </p>
                )}
              </div>

              {/* 密码 */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerUser('password', {
                      required: '请输入密码',
                      minLength: { value: 6, message: '密码至少6个字符' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {userErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {userErrors.password.message}
                  </p>
                )}
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </div>
                ) : (
                  '登录'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit(onAdminLogin)} className="space-y-6">
              {/* 管理员密码 */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  管理员密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerAdmin('password', {
                      required: '请输入管理员密码'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入管理员密码"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {adminErrors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {adminErrors.password.message}
                  </p>
                )}
              </div>

              {/* 错误信息 */}
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-800 dark:text-red-400">{error}</div>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    验证中...
                  </div>
                ) : (
                  '管理员登录'
                )}
              </button>
            </form>
          )}

          {/* 底部链接 */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← 返回首页
            </Link>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 谦舍博客. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
