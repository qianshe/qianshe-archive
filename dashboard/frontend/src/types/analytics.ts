// Dashboard管理端分析统计类型定义
export interface Analytics {
  id: number;
  path: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  session_id?: string;
  visit_duration?: number;
  created_at: string;
}

// 访问统计查询参数
export interface AnalyticsQuery {
  start_date?: string;
  end_date?: string;
  path?: string;
  device_type?: string;
  country?: string;
  browser?: string;
  group_by?: 'day' | 'week' | 'month' | 'path' | 'country' | 'device';
  page?: number;
  limit?: number;
}

// 访问统计响应
export interface AnalyticsResponse {
  data: Analytics[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 页面访问统计
export interface PageStats {
  path: string;
  visits: number;
  unique_visitors: number;
  avg_duration: number;
  bounce_rate: number;
}

// 访问趋势数据
export interface VisitTrend {
  date: string;
  visits: number;
  unique_visitors: number;
  page_views: number;
  avg_duration: number;
}

// 设备统计
export interface DeviceStats {
  device_type: 'desktop' | 'mobile' | 'tablet';
  count: number;
  percentage: number;
}

// 浏览器统计
export interface BrowserStats {
  browser: string;
  count: number;
  percentage: number;
}

// 地理位置统计
export interface GeoStats {
  country: string;
  city?: string;
  count: number;
  percentage: number;
}

// 概览统计信息
export interface OverviewStats {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
  todayVisits: number;
  thisMonthVisits: number;
  growthRate: number;
}

// Analytics组件Props类型
export interface DeviceData {
  device_type: string;
  visits: number;
  unique_visitors: number;
}

export interface BrowserData {
  browser: string;
  visits: number;
  unique_visitors: number;
}

export interface DeviceStatsProps {
  devices: DeviceData[];
  browsers: BrowserData[];
  loading?: boolean;
}

export interface GeoData {
  country: string;
  city?: string;
  visits: number;
  unique_visitors: number;
}

export interface GeoStatsProps {
  data: GeoData[];
  loading?: boolean;
}

export interface TrendData {
  period: string;
  page_views: number;
  unique_visitors: number;
  sessions: number;
}

export interface TrendChartProps {
  data: TrendData[];
  loading?: boolean;
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
  currentPeriod?: 'day' | 'week' | 'month';
}

export interface TopPagesData {
  path: string;
  title?: string;
  visits: number;
  unique_visitors: number;
  avg_duration: number;
  bounce_rate: number;
}

export interface TopPagesProps {
  data: TopPagesData[];
  loading?: boolean;
}

export interface OverviewCardsData {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
  todayVisits: number;
  thisMonthVisits: number;
  growthRate: number;
}

export interface OverviewCardsProps {
  data: OverviewCardsData;
  loading?: boolean;
  onRefresh?: () => void;
  dateRange?: {
    start_date: string;
    end_date: string;
  };
}