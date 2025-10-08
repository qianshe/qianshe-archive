import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays, subWeeks, subMonths } from 'date-fns';
import { apiRequest } from '../services/api';

// API 获取函数 - 使用统一的 api 服务
const fetchAnalytics = async (endpoint: string, params?: Record<string, any>) => {
  const url = `/analytics/${endpoint}`;
  const response = await apiRequest.get<{ data: any }>(url, { params });
  return response.data;
};

// 获取概览统计
export const useOverviewStats = () => {
  return useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => fetchAnalytics('overview'),
    staleTime: 5 * 60 * 1000, // 5分钟
    refetchInterval: 5 * 60 * 1000, // 5分钟自动刷新
    retry: 3
  });
};

// 获取访问趋势
export const useTrends = (period: 'day' | 'week' | 'month' = 'day', days?: number) => {
  const getEndDate = () => new Date();
  const getStartDate = () => {
    const now = new Date();
    switch (period) {
      case 'day':
        return days ? subDays(now, days) : subDays(now, 30);
      case 'week':
        return subWeeks(now, 12);
      case 'month':
        return subMonths(now, 12);
      default:
        return subDays(now, 30);
    }
  };

  const params = {
    start_date: getStartDate().toISOString(),
    end_date: getEndDate().toISOString(),
    period
  };

  return useQuery({
    queryKey: ['analytics-trends', period],
    queryFn: () => fetchAnalytics('trends', params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    enabled: !!period
  });
};

// 获取热门页面
export const usePopularPages = (limit: number = 10, startDate?: Date, endDate?: Date) => {
  const params: Record<string, any> = {
    limit: limit.toString()
  };

  if (startDate) {
    params.start_date = startDate.toISOString();
  } else {
    params.start_date = subDays(new Date(), 30).toISOString();
  }

  if (endDate) {
    params.end_date = endDate.toISOString();
  } else {
    params.end_date = new Date().toISOString();
  }

  return useQuery({
    queryKey: ['analytics-popular-pages', limit, startDate, endDate],
    queryFn: () => fetchAnalytics('popular-pages', params),
    staleTime: 10 * 60 * 1000, // 10分钟
    refetchInterval: 10 * 60 * 1000,
    retry: 3
  });
};

// 获取流量来源
export const useReferrers = (limit: number = 10, startDate?: Date, endDate?: Date) => {
  const params: Record<string, any> = {
    limit: limit.toString()
  };

  if (startDate) {
    params.start_date = startDate.toISOString();
  } else {
    params.start_date = subDays(new Date(), 30).toISOString();
  }

  if (endDate) {
    params.end_date = endDate.toISOString();
  } else {
    params.end_date = new Date().toISOString();
  }

  return useQuery({
    queryKey: ['analytics-referrers', limit, startDate, endDate],
    queryFn: () => fetchAnalytics('referrers', params),
    staleTime: 15 * 60 * 1000, // 15分钟
    refetchInterval: 15 * 60 * 1000,
    retry: 3
  });
};

// 获取设备统计
export const useDeviceStats = (startDate?: Date, endDate?: Date) => {
  const params: Record<string, any> = {};

  if (startDate) {
    params.start_date = startDate.toISOString();
  } else {
    params.start_date = subDays(new Date(), 30).toISOString();
  }

  if (endDate) {
    params.end_date = endDate.toISOString();
  } else {
    params.end_date = new Date().toISOString();
  }

  return useQuery({
    queryKey: ['analytics-devices', startDate, endDate],
    queryFn: () => fetchAnalytics('devices', params),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3
  });
};

// 获取地理分布
export const useGeoStats = (limit: number = 20, startDate?: Date, endDate?: Date) => {
  const params: Record<string, any> = {
    limit: limit.toString()
  };

  if (startDate) {
    params.start_date = startDate.toISOString();
  } else {
    params.start_date = subDays(new Date(), 30).toISOString();
  }

  if (endDate) {
    params.end_date = endDate.toISOString();
  } else {
    params.end_date = new Date().toISOString();
  }

  return useQuery({
    queryKey: ['analytics-geography', limit, startDate, endDate],
    queryFn: () => fetchAnalytics('geography', params),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 3
  });
};

// 获取内容表现
export const useContentPerformance = (
  contentType: 'posts' | 'projects' = 'posts',
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) => {
  const params: Record<string, any> = {
    content_type: contentType,
    limit: limit.toString()
  };

  if (startDate) {
    params.start_date = startDate.toISOString();
  } else {
    params.start_date = subDays(new Date(), 30).toISOString();
  }

  if (endDate) {
    params.end_date = endDate.toISOString();
  } else {
    params.end_date = new Date().toISOString();
  }

  return useQuery({
    queryKey: ['analytics-content-performance', contentType, limit, startDate, endDate],
    queryFn: () => fetchAnalytics('content-performance', params),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3
  });
};

// 实时统计 Hook
export const useRealtimeStats = () => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const overview = useOverviewStats();
  const trends = useTrends('day', 7);

  // 模拟实时更新（在实际应用中，这里应该使用WebSocket）
  React.useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      overview.refetch();
      trends.refetch();
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [isOnline, overview.refetch, trends.refetch]);

  return {
    overview,
    trends,
    isOnline
  };
};

// 日期范围 Hook
export const useDateRange = (defaultDays: number = 30) => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(() =>
    subDays(new Date(), defaultDays)
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(() => new Date());
  const [preset, setPreset] = React.useState<string>('custom');

  const setDateRange = React.useCallback((start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    setPreset('custom');
  }, []);

  const setPresetRange = React.useCallback((presetName: string) => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined = now;

    switch (presetName) {
      case 'today':
        start = now;
        break;
      case 'yesterday':
        start = subDays(now, 1);
        end = subDays(now, 1);
        break;
      case 'last-7-days':
        start = subDays(now, 7);
        break;
      case 'last-30-days':
        start = subDays(now, 30);
        break;
      case 'last-90-days':
        start = subDays(now, 90);
        break;
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    setPreset(presetName);
  }, []);

  return {
    startDate,
    endDate,
    preset,
    setDateRange,
    setPresetRange
  };
};

// 预设日期范围选项
export const DATE_PRESETS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: 'last-7-days', label: '最近7天' },
  { value: 'last-30-days', label: '最近30天' },
  { value: 'last-90-days', label: '最近90天' },
  { value: 'this-month', label: '本月' },
  { value: 'last-month', label: '上月' }
];
