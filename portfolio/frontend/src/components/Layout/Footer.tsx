import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Heart, ExternalLink } from 'lucide-react';

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

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  谦
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">谦舍</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                谦者，德之柄也；舍者，义之本也。
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                记录技术学习、生活感悟和项目作品的个人空间。
              </p>
            </div>

            {/* Links Sections */}
            {sections.map(section => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>© {currentYear} 谦舍. All rights reserved.</span>
            </div>

            {/* Built With */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>using modern web technologies</span>
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
