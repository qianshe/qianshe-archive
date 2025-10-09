import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ExternalLink, Loader2, Tag } from 'lucide-react';
import { postsApi } from '../../services/api';
import type { BlogPost } from '../../types/blog';

export const PostPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('缺少文章ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await postsApi.getPost(parseInt(id, 10));
        setPost(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : '加载文章失败';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const statusInfo = useMemo(() => {
    if (!post) {
      return null;
    }
    const map = {
      published: { label: '已发布', className: 'bg-emerald-500/10 text-emerald-500' },
      draft: { label: '草稿', className: 'bg-yellow-500/10 text-yellow-500' },
      archived: { label: '已归档', className: 'bg-slate-500/10 text-slate-400' }
    } as const;
    return map[post.status as keyof typeof map] ?? map.draft;
  }, [post]);

  const contentNode = useMemo(() => {
    if (!post) return null;
    const rawContent = post.content || '';
    const isHtmlContent = /<\/[a-z][\s\S]*>/i.test(rawContent);

    if (isHtmlContent) {
      return (
        <div
          className="space-y-4 text-base leading-relaxed text-gray-800 dark:text-gray-100 [&_*]:max-w-full [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-800 dark:text-gray-100 space-y-4">
        {rawContent || '暂无正文内容'}
      </div>
    );
  }, [post]);

  const formattedDate = (value?: string) => {
    if (!value) return '未知时间';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString();
  };

  return (
    <div className="container-responsive py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回上一页
        </button>
        {post && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full font-medium ${statusInfo?.className ?? ''}`}>
              {statusInfo?.label ?? '草稿'}
            </span>
            <span>更新：{formattedDate(post.updated_at)}</span>
            {post.published_at && <span>发布时间：{formattedDate(post.published_at)}</span>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500 dark:text-gray-400 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>文章加载中，请稍候喵…</span>
        </div>
      ) : error ? (
        <div className="card border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10">
          <div className="card-body p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">文章加载失败</h2>
              <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>
              <button
                onClick={() => navigate('/posts')}
                className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                返回文章列表
              </button>
            </div>
          </div>
        </div>
      ) : post ? (
        <div className="space-y-6">
          <div className="card overflow-hidden">
            {post.cover_image && (
              <div className="relative bg-gray-900">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full max-h-[360px] object-cover"
                />
                <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-black/60 text-white">
                  预览模式
                </span>
              </div>
            )}
            <div className="card-body p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                    {post.category?.name ?? '未分类'}
                  </span>
                  <span>作者：{post.author_name ?? '未知'}</span>
                  <span>ID：{post.id}</span>
                </div>
                <span className="text-sm text-gray-400">创建：{formattedDate(post.created_at)}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-base text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {post.excerpt}
                </p>
              )}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500 rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/40 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">正文预览</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                当前内容仅对后台用户可见，未发布文章不会对外展示。
              </p>
            </div>
            <div className="card-body p-6">{contentNode}</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-6 text-center text-gray-500 dark:text-gray-400">
            暂无文章内容可预览。
          </div>
        </div>
      )}
    </div>
  );
};
