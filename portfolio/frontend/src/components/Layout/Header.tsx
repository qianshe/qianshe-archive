import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Search } from 'lucide-react';

const Header: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/blog', label: '博客' },
    { path: '/projects', label: '项目' },
    { path: '/about', label: '关于' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                谦
              </div>
              <span>谦舍</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="搜索"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="切换主题"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="菜单"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col space-y-3">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors px-2 py-1 rounded-md ${
                      location.pathname === item.path
                        ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">搜索</h3>
                <button
                  onClick={toggleSearch}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="关闭搜索"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文章、项目..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                按{' '}
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>{' '}
                搜索，
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs ml-1">
                  Esc
                </kbd>{' '}
                关闭
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
