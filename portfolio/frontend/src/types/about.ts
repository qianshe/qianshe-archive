// 关于页面相关类型定义

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  email: string;
  phone?: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  resume_url?: string;
}

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'design' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'work' | 'education' | 'project' | 'achievement' | 'other';
  icon?: string;
  link?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  color?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}
