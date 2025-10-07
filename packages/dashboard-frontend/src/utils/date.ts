/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期为完整日期格式
 * @param dateString - 日期字符串
 * @returns 格式化后的日期字符串 (例如: 2024年1月15日)
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * 格式化日期时间为完整日期时间格式
 * @param dateString - 日期字符串
 * @returns 格式化后的日期时间字符串 (例如: 2024年1月15日 14:30)
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 格式化为简短日期格式
 * @param dateString - 日期字符串
 * @returns 格式化后的日期字符串 (例如: 2024/1/15)
 */
export const formatShortDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
};

/**
 * 获取相对时间描述
 * @param dateString - 日期字符串
 * @returns 相对时间描述 (例如: 刚刚、3分钟前、2小时前、3天前、2024年1月15日)
 */
export const getRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}周前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else if (years < 2) {
    return '1年前';
  } else {
    return formatDate(dateString);
  }
};

/**
 * 计算阅读时间
 * @param content - 文章内容
 * @param wordsPerMinute - 每分钟阅读字数 (默认: 200)
 * @returns 阅读时间（分钟）
 */
export const calculateReadTime = (content: string, wordsPerMinute: number = 200): number => {
  const wordCount = content.length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // 最少1分钟
};

/**
 * 计算日期范围的天数
 * @param startDate - 开始日期
 * @param endDate - 结束日期（可选，默认为当前日期）
 * @returns 天数
 */
export const calculateDaysBetween = (startDate: string | Date, endDate?: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * 格式化日期范围
 * @param startDate - 开始日期
 * @param endDate - 结束日期（可选）
 * @returns 格式化后的日期范围字符串
 */
export const formatDateRange = (startDate: string | Date, endDate?: string | Date): string => {
  const start = formatDate(startDate);
  if (!endDate) {
    return `${start} - 至今`;
  }
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * 检查日期是否为今天
 * @param dateString - 日期字符串
 * @returns 是否为今天
 */
export const isToday = (dateString: string | Date): boolean => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * 检查日期是否为本周
 * @param dateString - 日期字符串
 * @returns 是否为本周
 */
export const isThisWeek = (dateString: string | Date): boolean => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= today;
};
