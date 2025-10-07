import DOMPurify from 'dompurify';

/**
 * 配置选项接口
 */
interface SanitizeOptions {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  ALLOW_ARIA_ATTR?: boolean;
}

/**
 * 默认配置 - 用于博客文章内容
 */
const DEFAULT_CONFIG: SanitizeOptions = {
  ALLOWED_TAGS: [
    // 文本标签
    'p', 'span', 'br', 'strong', 'em', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
    // 标题标签
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // 列表标签
    'ul', 'ol', 'li',
    // 链接和图片
    'a', 'img',
    // 代码标签
    'code', 'pre',
    // 引用和分隔
    'blockquote', 'hr',
    // 表格标签
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // 其他
    'div', 'section', 'article', 'aside', 'nav', 'header', 'footer'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'width', 'height',
    'colspan', 'rowspan'
  ],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true
};

/**
 * 严格配置 - 只允许基本文本格式
 */
const STRICT_CONFIG: SanitizeOptions = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false
};

/**
 * 清理 HTML 内容，防止 XSS 攻击
 * @param dirty - 未清理的 HTML 字符串
 * @param options - 可选的配置选项
 * @returns 清理后的安全 HTML 字符串
 */
export const sanitizeHtml = (dirty: string, options?: SanitizeOptions): string => {
  const config = {
    ...DEFAULT_CONFIG,
    ...options
  };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * 严格清理 HTML 内容 - 只保留基本文本格式
 * @param dirty - 未清理的 HTML 字符串
 * @returns 清理后的安全 HTML 字符串
 */
export const sanitizeHtmlStrict = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, STRICT_CONFIG);
};

/**
 * 清理用户输入的纯文本
 * @param input - 用户输入的文本
 * @returns 清理后的纯文本（移除所有 HTML 标签）
 */
export const sanitizePlainText = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * 清理 URL
 * @param url - URL 字符串
 * @returns 清理后的安全 URL
 */
export const sanitizeUrl = (url: string): string => {
  // 只允许 http、https 和 mailto 协议
  const allowedProtocols = ['http:', 'https:', 'mailto:'];

  try {
    const parsedUrl = new URL(url, window.location.origin);
    if (allowedProtocols.includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
  } catch (e) {
    console.warn('Invalid URL:', url);
  }

  return '';
};

/**
 * 清理并转义用户输入（用于显示在 HTML 中）
 * @param input - 用户输入的文本
 * @returns 转义后的安全文本
 */
export const escapeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * 配置 DOMPurify 的钩子函数
 */
export const configureDOMPurify = (): void => {
  // 添加钩子：在清理后添加 target="_blank" 和 rel="noopener noreferrer"
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // 为外部链接添加安全属性
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href && !href.startsWith('/') && !href.startsWith('#')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }

    // 为图片添加 loading="lazy"
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
    }
  });
};

// 初始化配置
if (typeof window !== 'undefined') {
  configureDOMPurify();
}

export default {
  sanitizeHtml,
  sanitizeHtmlStrict,
  sanitizePlainText,
  sanitizeUrl,
  escapeHtml,
  configureDOMPurify
};
