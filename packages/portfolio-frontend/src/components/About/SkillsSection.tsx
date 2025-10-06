import React from 'react';
import { Code, Database, Smartphone, Server, Palette, MoreHorizontal } from 'lucide-react';
import { Skill } from '@/types';

interface SkillsSectionProps {
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const getCategoryIcon = (category: Skill['category']) => {
    const iconMap = {
      frontend: Code,
      backend: Server,
      mobile: Smartphone,
      devops: Database,
      design: Palette,
      other: MoreHorizontal
    };
    return iconMap[category] || iconMap.other;
  };

  const getCategoryName = (category: Skill['category']) => {
    const nameMap = {
      frontend: '前端开发',
      backend: '后端开发',
      mobile: '移动开发',
      devops: '运维部署',
      design: '设计',
      other: '其他'
    };
    return nameMap[category] || '其他';
  };

  const getLevelColor = (level: Skill['level']) => {
    const colorMap = {
      beginner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      expert: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colorMap[level] || colorMap.beginner;
  };

  const getLevelName = (level: Skill['level']) => {
    const nameMap = {
      beginner: '初级',
      intermediate: '中级',
      advanced: '高级',
      expert: '专家'
    };
    return nameMap[level] || '初级';
  };

  const getLevelPercentage = (level: Skill['level']) => {
    const percentageMap = {
      beginner: 25,
      intermediate: 50,
      advanced: 75,
      expert: 100
    };
    return percentageMap[level] || 25;
  };

  // 按类别分组技能
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<Skill['category'], Skill[]>
  );

  const categories: Skill['category'][] = [
    'frontend',
    'backend',
    'mobile',
    'devops',
    'design',
    'other'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">技术栈</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map(category => {
          const categorySkills = skillsByCategory[category] || [];
          if (categorySkills.length === 0) return null;

          const IconComponent = getCategoryIcon(category);

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getCategoryName(category)}
                </h3>
              </div>

              <div className="space-y-3">
                {categorySkills.map(skill => (
                  <div key={skill.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                        {skill.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {skill.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLevelColor(skill.level)}`}
                        >
                          {getLevelName(skill.level)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {skill.years_of_experience}年
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getLevelPercentage(skill.level)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{skills.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">技术总数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {skills.filter(s => s.level === 'expert' || s.level === 'advanced').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">精通技能</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.max(...skills.map(s => s.years_of_experience))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">最长经验</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {categories.filter(cat => skillsByCategory[cat]?.length > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">技术领域</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
