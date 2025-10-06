import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github,
  ExternalLink,
  Calendar,
  Star,
  Eye,
  Code,
  Clock,
  Users,
  Package,
  ChevronLeft,
  Heart
} from 'lucide-react';
import { Project } from '@/types';

interface ProjectDetailProps {
  project: Project;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      case 'planning':
        return '规划中';
      case 'on-hold':
        return '暂停';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  };

  const calculateDuration = () => {
    if (!project.start_date) return null;
    const startDate = new Date(project.start_date);
    const endDate = project.end_date ? new Date(project.end_date) : new Date();
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const duration = calculateDuration();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      {project.cover_image && (
        <div className="relative h-64 md:h-96 bg-gray-900">
          <img
            src={project.cover_image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link
              to="/projects"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回项目列表
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </span>
                {project.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    精选项目
                  </span>
                )}
                {project.is_open_source && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    开源
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {project.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-6">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  在线演示
                </a>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">创建时间</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(project.created_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">项目时长</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {duration ? `${duration}天` : '未知'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">星标数</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.star_count}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">浏览量</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.view_count}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Fork数</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.fork_count}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Watch数</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.watch_count}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">点赞数</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.like_count}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">主要语言</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.language || '未知'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack & Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tech Stack */}
          {project.tech_stack.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">项目介绍</h3>
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        </div>

        {/* Date Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">时间信息</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">创建时间</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(project.created_at)}
              </span>
            </div>
            {project.start_date && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">开始时间</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(project.start_date)}
                </span>
              </div>
            )}
            {project.end_date && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">结束时间</span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(project.end_date)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">最后更新</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(project.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
