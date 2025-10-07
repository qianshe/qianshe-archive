import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  url?: string;
  publishedTime?: string;
  modifiedTime?: string;
  article?: {
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  author = 'qainshe',
  type = 'website',
  image,
  url,
  publishedTime,
  modifiedTime,
  article
}) => {
  const siteTitle = '千舍 - 个人作品集';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const siteDescription =
    description ||
    '千舍的个人作品集网站，展示技术博客、开源项目和个人经历。专注于全栈开发、云原生技术和开源贡献。';
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteImage =
    image || `${typeof window !== 'undefined' ? window.location.origin : ''}/og-image.png`;

  return (
    <Helmet>
      {/* 基础 Meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author} />

      {/* Open Graph (Facebook, LinkedIn, etc.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="zh_CN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
      <meta name="twitter:creator" content="@qainshe" />

      {/* 文章特定的 Meta 标签 */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {article?.author && <meta property="article:author" content={article.author} />}
          {article?.section && <meta property="article:section" content={article.section} />}
          {article?.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* 其他 SEO Meta 标签 */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="format-detection" content="telephone=no" />
      <link rel="canonical" href={siteUrl} />

      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#10b981" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
          headline: fullTitle,
          description: siteDescription,
          image: siteImage,
          author: {
            '@type': 'Person',
            name: author
          },
          ...(publishedTime && { datePublished: publishedTime }),
          ...(modifiedTime && { dateModified: modifiedTime }),
          ...(type === 'website' && {
            url: siteUrl,
            name: siteTitle,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
