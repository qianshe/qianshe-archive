import React from 'react';
import Layout from '@/components/Layout/Layout';
import PersonalProfile from '@/components/About/PersonalProfile';
import SkillsSection from '@/components/About/SkillsSection';
import Timeline from '@/components/About/Timeline';
import ContactForm from '@/components/About/ContactForm';
import {
  PersonalInfo,
  Skill,
  TimelineItem,
  SocialLink,
  ContactForm as ContactFormType
} from '@/types';

const AboutPage: React.FC = () => {
  // Mock data - 在实际项目中应该从API获取
  const personalInfo: PersonalInfo = {
    name: '张三',
    title: '全栈开发工程师',
    bio: '我是一名充满热情的全栈开发工程师，专注于构建高质量的Web应用。拥有5年以上的开发经验，擅长前端开发、后端架构设计和DevOps。热爱开源技术，积极参与社区贡献，致力于通过技术创新解决实际问题。',
    avatar: '/api/placeholder/150/150',
    email: 'zhangsan@example.com',
    phone: '+86 138-0000-0000',
    location: '北京市朝阳区',
    website: 'https://example.com',
    github: 'https://github.com/zhangsan',
    linkedin: 'https://linkedin.com/in/zhangsan',
    twitter: 'https://twitter.com/zhangsan',
    resume_url: '/resume.pdf'
  };

  const socialLinks: SocialLink[] = [
    {
      platform: 'GitHub',
      url: 'https://github.com/zhangsan',
      icon: 'github'
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/zhangsan',
      icon: 'linkedin'
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/zhangsan',
      icon: 'twitter'
    },
    {
      platform: 'Email',
      url: 'mailto:zhangsan@example.com',
      icon: 'email'
    }
  ];

  const skills: Skill[] = [
    {
      name: 'React',
      category: 'frontend',
      level: 'expert',
      years_of_experience: 4,
      description: '熟练使用React生态系统，包括Redux、React Router等'
    },
    {
      name: 'TypeScript',
      category: 'frontend',
      level: 'advanced',
      years_of_experience: 3,
      description: '深入理解TypeScript类型系统和高级特性'
    },
    {
      name: 'Vue.js',
      category: 'frontend',
      level: 'intermediate',
      years_of_experience: 2,
      description: '了解Vue.js生态系统的核心概念'
    },
    {
      name: 'Node.js',
      category: 'backend',
      level: 'advanced',
      years_of_experience: 4,
      description: '使用Node.js构建高性能的后端服务'
    },
    {
      name: 'Python',
      category: 'backend',
      level: 'intermediate',
      years_of_experience: 2,
      description: '使用Python进行后端开发和数据分析'
    },
    {
      name: 'PostgreSQL',
      category: 'backend',
      level: 'intermediate',
      years_of_experience: 3,
      description: '熟悉关系型数据库设计和优化'
    },
    {
      name: 'Docker',
      category: 'devops',
      level: 'advanced',
      years_of_experience: 3,
      description: '使用Docker进行应用容器化和部署'
    },
    {
      name: 'AWS',
      category: 'devops',
      level: 'intermediate',
      years_of_experience: 2,
      description: '使用AWS云服务进行应用部署'
    },
    {
      name: 'React Native',
      category: 'mobile',
      level: 'beginner',
      years_of_experience: 1,
      description: '学习移动应用开发'
    },
    {
      name: 'UI/UX设计',
      category: 'design',
      level: 'beginner',
      years_of_experience: 1,
      description: '了解基本的设计原则和工具'
    }
  ];

  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      title: '加入ABC科技公司',
      description: '担任高级前端工程师，负责公司核心产品的前端架构设计和开发。',
      date: '2022-03-15',
      type: 'work',
      link: 'https://example.com/company'
    },
    {
      id: '2',
      title: '开源项目Starred',
      description: '个人开源项目获得1000+Star，被多个知名项目使用。',
      date: '2021-11-20',
      type: 'achievement'
    },
    {
      id: '3',
      title: '全栈电商项目',
      description: '独立完成一个全栈电商平台，支持用户管理、商品展示、订单处理等功能。',
      date: '2021-06-01',
      type: 'project',
      link: 'https://github.com/example/ecommerce'
    },
    {
      id: '4',
      title: '获得计算机科学学位',
      description: '以优异成绩毕业于北京大学计算机科学与技术专业。',
      date: '2020-07-01',
      type: 'education'
    },
    {
      id: '5',
      title: '首次工作经历',
      description: '加入DEF创业公司，担任前端开发工程师，参与多个项目的开发。',
      date: '2020-03-01',
      type: 'work'
    },
    {
      id: '6',
      title: '技术分享讲师',
      description: '在公司内部进行React技术分享，获得同事好评。',
      date: '2019-12-15',
      type: 'achievement'
    }
  ];

  const handleContactSubmit = async (_formData: ContactFormType) => {
    // 这里应该调用实际的API
    // TODO: Replace with proper logging service
    // logger.info('Contact form submitted:', formData);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 模拟成功/失败
    if (Math.random() > 0.1) {
      // 90%成功率
      return Promise.resolve();
    } else {
      throw new Error('服务器错误，请稍后重试');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">关于我</h1>
              <p className="text-xl opacity-90">了解我的技能、经验和项目故事</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-8">
              <PersonalProfile personalInfo={personalInfo} socialLinks={socialLinks} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-8">
              <SkillsSection skills={skills} />
              <Timeline items={timelineItems} />
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-12">
            <div className="max-w-3xl mx-auto">
              <ContactForm onSubmit={handleContactSubmit} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
