import React from 'react';
import {
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Download,
  ExternalLink,
  User
} from 'lucide-react';
import { PersonalInfo, SocialLink } from '@/types';

interface PersonalProfileProps {
  personalInfo: PersonalInfo;
  socialLinks: SocialLink[];
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({ personalInfo, socialLinks }) => {
  const calculateAge = () => {
    // 假设个人出生年份（可以从个人信息中获取）
    const birthYear = 1995; // 示例年份
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  
  const getExperienceDuration = () => {
    // 假设工作开始时间（可以从工作经验中计算）
    const startDate = new Date('2020-07-01'); // 示例日期
    const currentDate = new Date();
    const years = currentDate.getFullYear() - startDate.getFullYear();
    const months = currentDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      return `${years - 1}年${12 + months}个月`;
    }
    return `${years}年${months}个月`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-xl">
      {/* Cover Section - 增加渐变效果 */}
      <div className="h-40 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700"></div>

      {/* Profile Section */}
      <div className="px-6 pb-6">
        {/* Avatar 和基本信息区域 */}
        <div className="flex flex-col items-center text-center -mt-20 mb-8">
          {/* Avatar - 加大尺寸并添加阴影效果 */}
          <div className="relative mb-5">
            <div className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-xl">
              <img
                src={personalInfo.avatar}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* 在线状态指示器 */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>

          {/* Basic Info - 优化层次 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {personalInfo.name}
            </h1>
            <p className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
              {personalInfo.title}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{personalInfo.location}</span>
            </div>
          </div>

          {/* Action Buttons - 优化样式 */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
            {personalInfo.resume_url && (
              <a
                href={personalInfo.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Download className="w-4 h-4" />
                <span>下载简历</span>
              </a>
            )}
            <a
              href={`mailto:${personalInfo.email}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>联系我</span>
            </a>
          </div>
        </div>

        {/* Bio - 优化排版 */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>个人简介</span>
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{personalInfo.bio}</p>
        </div>

        {/* Quick Stats - 优化卡片样式 */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-5">数据统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg hover:shadow-md transition-all duration-200 border border-emerald-200 dark:border-emerald-800">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{calculateAge()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">年龄</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg hover:shadow-md transition-all duration-200 border border-emerald-200 dark:border-emerald-800">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {getExperienceDuration()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">工作经验</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg hover:shadow-md transition-all duration-200 border border-emerald-200 dark:border-emerald-800">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">50+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">完成项目</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg hover:shadow-md transition-all duration-200 border border-emerald-200 dark:border-emerald-800">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1000+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">代码提交</div>
            </div>
          </div>
        </div>

        {/* Contact Information - 优化交互效果 */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">联系方式</h3>
          <div className="space-y-2.5">
            <a
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all duration-200 group"
            >
              <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-gray-700 dark:text-gray-300 break-all">{personalInfo.email}</span>
            </a>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{personalInfo.location}</span>
            </div>
            {personalInfo.website && (
              <a
                href={personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all duration-200 group"
              >
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline break-all">
                  {personalInfo.website.replace(/^https?:\/\//, '')}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Social Links - 移除顶部边框，优化为最后区块 */}
        {socialLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">社交媒体</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {socialLinks.map(link => {
                const IconComponent = getIconComponent(link.platform);
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 border border-transparent transition-all duration-200 group"
                  >
                    <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium flex-1">{link.platform}</span>
                    <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 图标组件映射
const getIconComponent = (platform: string) => {
  const iconMap: Record<string, React.ElementType> = {
    GitHub: Github,
    LinkedIn: Linkedin,
    Twitter,
    Email: Mail,
    Website: Globe,
    default: User
  };
  return iconMap[platform] || iconMap.default;
};

export default PersonalProfile;
