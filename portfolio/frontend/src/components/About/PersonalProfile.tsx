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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover Section */}
      <div className="h-32 bg-gradient-to-r from-emerald-500 to-blue-600"></div>

      {/* Profile Section */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4 sm:mb-0 sm:mr-6">
            <img
              src={personalInfo.avatar}
              alt={personalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {personalInfo.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-1">{personalInfo.title}</p>
            <p className="text-gray-500 dark:text-gray-400">{personalInfo.location}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            {personalInfo.resume_url && (
              <a
                href={personalInfo.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载简历
              </a>
            )}
            <a
              href={`mailto:${personalInfo.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Mail className="w-4 h-4" />
              联系我
            </a>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{personalInfo.bio}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{calculateAge()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">年龄</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {getExperienceDuration()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">工作经验</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">完成项目</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">代码提交</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{personalInfo.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{personalInfo.location}</span>
          </div>
          {personalInfo.website && (
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <a
                href={personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {personalInfo.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">社交媒体</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(link => {
                const IconComponent = getIconComponent(link.platform);
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm">{link.platform}</span>
                    <ExternalLink className="w-3 h-3" />
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
