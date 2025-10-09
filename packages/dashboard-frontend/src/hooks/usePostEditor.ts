import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost, BlogPostRequest } from '../types/blog';
import { postsApi } from '../services/api';

interface UsePostEditorOptions {
  postId?: number;
  onSuccess?: (post: BlogPost) => void;
  onError?: (error: Error) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UsePostEditorReturn {
  // 表单数据
  formData: BlogPostRequest;
  setFormData: React.Dispatch<React.SetStateAction<BlogPostRequest>>;

  // 状态
  loading: boolean;
  saving: boolean;
  error: Error | null;
  lastSaved: Date | null;

  // 表单操作
  handleTitleChange: (title: string) => void;
  handleContentChange: (content: string) => void;
  handleAddTag: (tag: string) => void;
  handleRemoveTag: (tag: string) => void;
  handleImageUpload: (file: File) => Promise<void>;
  handleRemoveCoverImage: () => void;

  // 保存操作
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  update: () => Promise<void>;

  // 工具方法
  resetForm: () => void;
  isDirty: boolean;
}

const initialFormData: BlogPostRequest = {
  title: '',
  slug: '',
  category: 'blog',
  tags: [],
  content: '',
  excerpt: '',
  featured_image: '',
  status: 'draft',
  is_featured: false,
  is_top: false,
  meta_title: '',
  meta_description: ''
};

/**
 * 文章编辑器 Hook
 * 提供完整的文章编辑功能，包括表单管理、自动保存、发布等
 */
export const usePostEditor = (options: UsePostEditorOptions = {}): UsePostEditorReturn => {
  const { postId, onSuccess, onError, autoSave = true, autoSaveDelay = 3000 } = options;
  const navigate = useNavigate();

  // 表单状态
  const [formData, setFormData] = useState<BlogPostRequest>(initialFormData);
  const [originalData, setOriginalData] = useState<BlogPostRequest>(initialFormData);

  // UI 状态
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 是否有未保存的修改
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

  // 加载现有文章数据
  useEffect(() => {
    if (postId) {
      const loadPost = async () => {
        try {
          setLoading(true);
          setError(null);
          const post = await postsApi.getPost(postId);

          const loadedData: BlogPostRequest = {
            title: post.title,
            slug: post.slug,
            category: post.category.slug as 'blog' | 'project' | 'announcement',
            tags: post.tags,
            content: post.content,
            excerpt: post.excerpt,
            featured_image: post.featured_image,
            status: post.status,
            is_featured: post.is_featured,
            is_top: post.is_top,
            meta_title: post.meta_title,
            meta_description: post.meta_description
          };

          setFormData(loadedData);
          setOriginalData(loadedData);
        } catch (err) {
          const error = err as Error;
          setError(error);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      };

      loadPost();
    }
  }, [postId, onError]);

  // 自动保存到 localStorage
  useEffect(() => {
    if (!postId && autoSave && formData.title && isDirty) {
      const autoSaveKey = 'post-draft-autosave';
      const timeoutId = setTimeout(() => {
        localStorage.setItem(autoSaveKey, JSON.stringify(formData));
        setLastSaved(new Date());
      }, autoSaveDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, postId, autoSave, autoSaveDelay, isDirty]);

  // 从 localStorage 恢复草稿
  useEffect(() => {
    if (!postId) {
      const autoSaveKey = 'post-draft-autosave';
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          const savedData = JSON.parse(saved);
          if (window.confirm('检测到未保存的草稿，是否恢复？')) {
            setFormData(savedData);
            setOriginalData(savedData);
          } else {
            localStorage.removeItem(autoSaveKey);
          }
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [postId]);

  // 自动生成 slug
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  // 处理标题变化
  const handleTitleChange = useCallback(
    (title: string) => {
      setFormData(prev => ({
        ...prev,
        title,
        slug: prev.slug || generateSlug(title)
      }));
    },
    [generateSlug]
  );

  // 处理内容变化
  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  // 添加标签
  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      setFormData(prev => {
        const currentTags = prev.tags ?? [];
        return {
          ...prev,
          tags: currentTags.includes(trimmedTag) ? currentTags : [...currentTags, trimmedTag]
        };
      });
    }
  }, []);

  // 删除标签
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags ?? []).filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 上传封面图片
  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        const result = await postsApi.uploadCoverImage(file);
        setFormData(prev => ({
          ...prev,
          featured_image: result.url
        }));
      } catch (err) {
        console.error('Failed to upload image:', err);
        throw err;
      }
    },
    []
  );

  // 删除封面图片
  const handleRemoveCoverImage = useCallback(() => {
    setFormData(prev => ({ ...prev, featured_image: '' }));
  }, []);

  // 验证表单
  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      alert('请填写文章标题');
      return false;
    }

    if (!formData.content.trim()) {
      alert('请填写文章内容');
      return false;
    }

    return true;
  }, [formData]);

  // 保存草稿
  const saveDraft = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const draftData = { ...formData, status: 'draft' as const };

      let result: BlogPost;
      if (postId) {
        result = await postsApi.updatePost(postId, draftData);
      } else {
        result = await postsApi.createPost(draftData);
      }

      setFormData(draftData);
      setOriginalData(draftData);
      setLastSaved(new Date());

      // 清除自动保存的草稿
      localStorage.removeItem('post-draft-autosave');

      onSuccess?.(result);
      alert('草稿已保存');
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setSaving(false);
    }
  }, [formData, postId, validateForm, onSuccess, onError]);

  // 发布文章
  const publish = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const publishData = { ...formData, status: 'published' as const };

      let result: BlogPost;
      if (postId) {
        result = await postsApi.updatePost(postId, publishData);
      } else {
        result = await postsApi.createPost(publishData);
      }

      setFormData(publishData);
      setOriginalData(publishData);
      setLastSaved(new Date());

      // 清除自动保存的草稿
      localStorage.removeItem('post-draft-autosave');

      onSuccess?.(result);
      alert('文章已发布');

      // 发布后跳转到文章列表
      setTimeout(() => {
        navigate('/posts');
      }, 500);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setSaving(false);
    }
  }, [formData, postId, validateForm, onSuccess, onError, navigate]);

  // 更新文章
  const update = useCallback(async () => {
    if (!postId || !validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const result = await postsApi.updatePost(postId, formData);

      setOriginalData(formData);
      setLastSaved(new Date());

      onSuccess?.(result);
      alert('文章已更新');
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setSaving(false);
    }
  }, [formData, postId, validateForm, onSuccess, onError]);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setOriginalData(initialFormData);
    setError(null);
    setLastSaved(null);
    localStorage.removeItem('post-draft-autosave');
  }, []);

  return {
    // 表单数据
    formData,
    setFormData,

    // 状态
    loading,
    saving,
    error,
    lastSaved,

    // 表单操作
    handleTitleChange,
    handleContentChange,
    handleAddTag,
    handleRemoveTag,
    handleImageUpload,
    handleRemoveCoverImage,

    // 保存操作
    saveDraft,
    publish,
    update,

    // 工具方法
    resetForm,
    isDirty
  };
};
