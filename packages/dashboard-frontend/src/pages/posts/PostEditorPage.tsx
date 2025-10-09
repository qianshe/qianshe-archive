import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  X,
  Tag,
  Settings as SettingsIcon,
  Clock,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { postsApi } from '../../services/api';

export const PostEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // 表单状态（内部使用数组形式管理标签）
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'blog' as 'blog' | 'project' | 'announcement',
    tags: [] as string[],
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false,
    is_top: false,
    meta_title: '',
    meta_description: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(isEditMode);

  // 加载现有文章数据
  useEffect(() => {
    if (isEditMode && id) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const post = await postsApi.getPost(parseInt(id));
          setFormData({
            title: post.title,
            slug: post.slug,
            category: post.category.slug as 'blog' | 'project' | 'announcement',
            tags: post.tags,
            content: post.content,
            excerpt: post.excerpt ?? '',
            featured_image: post.featured_image ?? post.cover_image ?? '',
            status: post.status,
            is_featured: post.is_featured,
            is_top: post.is_top,
            meta_title: post.meta_title ?? '',
            meta_description: post.meta_description ?? ''
          });
        } catch (error) {
          console.error('Failed to load post:', error);
          toast.error('加载文章失败');
          navigate('/posts');
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditMode, navigate]);

  // 自动保存到 localStorage
  useEffect(() => {
    if (!isEditMode && formData.title) {
      const autoSaveKey = 'post-draft-autosave';
      localStorage.setItem(autoSaveKey, JSON.stringify(formData));
      setLastSaved(new Date());
    }
  }, [formData, isEditMode]);

  // 从 localStorage 恢复草稿
  useEffect(() => {
    if (!isEditMode) {
      const autoSaveKey = 'post-draft-autosave';
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          const savedData = JSON.parse(saved);
          if (confirm('检测到未保存的草稿，是否恢复？')) {
            setFormData(savedData);
          } else {
            localStorage.removeItem(autoSaveKey);
          }
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [isEditMode]);

  // 自动生成 slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 处理标题变化
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  // 添加标签
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        status: 'draft' as const
      };

      if (isEditMode && id) {
        await postsApi.updatePost(parseInt(id), postData);
        toast.success('草稿已保存');
      } else {
        const newPost = await postsApi.createPost(postData);
        toast.success('草稿已保存');
        // 创建成功后跳转到编辑模式
        navigate(`/posts/edit/${newPost.id}`, { replace: true });
      }

      setLastSaved(new Date());
      // 清除 localStorage 自动保存
      if (!isEditMode) {
        localStorage.removeItem('post-draft-autosave');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 发布文章
  const handlePublish = async () => {
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        status: 'published' as const
      };

      if (isEditMode && id) {
        await postsApi.updatePost(parseInt(id), postData);
        toast.success('文章已发布');
      } else {
        await postsApi.createPost(postData);
        toast.success('文章已发布');
        // 清除 localStorage 自动保存
        localStorage.removeItem('post-draft-autosave');
      }

      navigate('/posts');
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast.error('发布失败');
    } finally {
      setSaving(false);
    }
  };

  // 预览
  const handlePreview = () => {
    // 保存当前内容到 sessionStorage 用于预览
    sessionStorage.setItem('preview-post', JSON.stringify(formData));
    window.open('/preview', '_blank');
  };

  // 上传封面图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    try {
      toast.loading('上传中...', { id: 'upload-image' });
      const result = await postsApi.uploadCoverImage(file);
      setFormData(prev => ({
        ...prev,
        featured_image: result.url
      }));
      toast.success('图片上传成功', { id: 'upload-image' });
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('图片上传失败', { id: 'upload-image' });
    }
  };

  if (loading) {
    return (
      <div className="container-responsive py-6">
        <div className="card">
          <div className="card-body p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/posts')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEditMode ? '编辑文章' : '新建文章'}
                </h1>
                {lastSaved && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    上次保存: {lastSaved.toLocaleTimeString('zh-CN')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                预览
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存草稿'}
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {saving ? '发布中...' : '发布文章'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑器主体 */}
      <div className="container-responsive py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧编辑区 - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题输入 */}
            <div className="card">
              <div className="card-body p-6">
                <input
                  type="text"
                  placeholder="输入文章标题..."
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* 内容编辑器 */}
            <div className="card">
              <div className="card-body p-6">
                <textarea
                  placeholder="开始写作... (支持 Markdown 语法)"
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full min-h-[500px] text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-400 resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 右侧设置面板 - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 发布设置 */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  发布设置
                </h3>
              </div>
              <div className="card-body p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_top"
                    checked={formData.is_top}
                    onChange={e => setFormData(prev => ({ ...prev, is_top: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_top" className="text-sm text-gray-700 dark:text-gray-300">
                    置顶文章
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">
                    推荐文章
                  </label>
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">基本信息</h3>
              </div>
              <div className="card-body p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blog">博客</option>
                    <option value="project">项目</option>
                    <option value="announcement">公告</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="article-url-slug"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    标签
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="添加标签"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    摘要
                  </label>
                  <textarea
                    value={formData.excerpt || ''}
                    onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="文章摘要（可选）"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 封面图片 */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">封面图片</h3>
              </div>
              <div className="card-body p-4">
                {formData.featured_image ? (
                  <div className="relative">
                    <img
                      src={formData.featured_image}
                      alt="Cover"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">点击上传封面图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* SEO 设置 */}
            <div className="card">
              <div className="card-header bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SEO 设置</h3>
              </div>
              <div className="card-body p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO 标题
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO 标题（可选）"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO 描述
                  </label>
                  <textarea
                    value={formData.meta_description || ''}
                    onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO 描述（可选）"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
