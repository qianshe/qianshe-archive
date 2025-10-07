import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Heart, ExternalLink, ChevronDown } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const sections: FooterSection[] = [
    {
      title: '内容',
      links: [
        { label: '博客', href: '/blog' },
        { label: '项目', href: '/projects' },
        { label: '关于', href: '/about' }
      ]
    },
    {
      title: '技术',
      links: [
        { label: 'React', href: 'https://react.dev', external: true },
        { label: 'TypeScript', href: 'https://www.typescriptlang.org', external: true },
        { label: 'Tailwind CSS', href: 'https://tailwindcss.com', external: true },
        { label: 'Cloudflare Workers', href: 'https://workers.cloudflare.com', external: true }
      ]
    },
    {
      title: '资源',
      links: [
        { label: 'GitHub', href: 'https://github.com', external: true },
        { label: 'MDN', href: 'https://developer.mozilla.org', external: true },
        { label: 'Stack Overflow', href: 'https://stackoverflow.com', external: true }
      ]
    }
  ];

  // 监听窗口大小变化以判断是否为移动端
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  舍
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">千舍</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                记录技术与作品
              </p>
            </div>

            {/* Links Sections - Desktop: Hover to expand / Mobile: Traditional layout */}
            {isMobile ? (
              // 移动端：传统布局
              <>
                {sections.map(section => (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.links.map(link => (
                        <li key={link.label}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center space-x-1"
                            >
                              <span>{link.label}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <Link
                              to={link.href}
                              className="text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            ) : (
              // 桌面端：悬停展开
              <div className="lg:col-span-3 flex justify-center md:justify-end items-start gap-6">
                {sections.map(section => (
                  <div
                    key={section.title}
                    className="relative"
                    onMouseEnter={() => setHoveredSection(section.title)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {/* 标题按钮 */}
                    <button
                      className={`
                        flex items-center space-x-1 text-sm font-semibold uppercase tracking-wider
                        transition-all duration-200 py-2 px-3 rounded-lg
                        ${hoveredSection === section.title
                          ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'text-gray-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400'
                        }
                      `}
                      aria-expanded={hoveredSection === section.title}
                      aria-haspopup="true"
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`
                          w-4 h-4 transition-transform duration-200
                          ${hoveredSection === section.title ? 'rotate-180' : ''}
                        `}
                      />
                    </button>

                    {/* 悬停弹出菜单 */}
                    <div
                      className={`
                        absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56
                        transition-all duration-200 origin-bottom
                        ${hoveredSection === section.title
                          ? 'opacity-100 scale-100 pointer-events-auto'
                          : 'opacity-0 scale-95 pointer-events-none'
                        }
                      `}
                      style={{ zIndex: 50 }}
                    >
                      {/* 箭头指示器 */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />

                      {/* 菜单内容 */}
                      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <ul className="py-2">
                          {section.links.map(link => (
                            <li key={link.label}>
                              {link.external ? (
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                >
                                  <span>{link.label}</span>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                </a>
                              ) : (
                                <Link
                                  to={link.href}
                                  className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                >
                                  {link.label}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>© {currentYear} 千舍</span>
            </div>

            {/* Built With */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@qianshe.top"
                className="text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
