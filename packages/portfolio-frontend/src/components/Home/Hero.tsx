import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: '技术博客',
      description: '分享编程学习心得和技术实践经验',
      href: '/blog'
    },
    {
      icon: Code,
      title: '项目作品',
      description: '展示个人开发的创意项目和应用',
      href: '/projects'
    },
    {
      icon: Sparkles,
      title: '思考感悟',
      description: '记录生活中的灵感和深度思考',
      href: '/blog?category=announcement'
    }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 dark:bg-emerald-800 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-800 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              千舍
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            谦者，德之柄也；舍者，义之本也
          </p>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            一个记录技术学习、项目作品和思考感悟的个人空间
            <br />
            在这里分享成长，交流思想，共同进步
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              开始阅读
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              查看项目
              <Code className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.href}
                className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  探索更多 →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
