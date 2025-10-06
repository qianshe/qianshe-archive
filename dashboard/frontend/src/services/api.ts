import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { RequestConfig, ApiMethods } from '../types/services';

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

// 创建axios实例
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求ID用于追踪
    if (config.headers) {
      config.headers['X-Request-ID'] = generateRequestId();
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 处理网络错误
    if (!error.response) {
      toast.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 处理认证错误
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { tokens } = response.data.data;
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          // 重新发送原始请求
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除tokens并重定向到登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 处理权限错误
    if (status === 403) {
      toast.error('权限不足，无法执行此操作');
      return Promise.reject(error);
    }

    // 处理404错误
    if (status === 404) {
      toast.error('请求的资源不存在');
      return Promise.reject(error);
    }

    // 处理422验证错误
    if (status === 422 && data.errors) {
      const errorMessages = Object.values(data.errors).flat();
      toast.error(errorMessages.join(', '));
      return Promise.reject(error);
    }

    // 处理5xx服务器错误
    if (status >= 500) {
      toast.error('服务器内部错误，请稍后重试');
      return Promise.reject(error);
    }

    // 处理其他错误
    const errorMessage = data?.error || data?.message || '请求失败';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

// 生成请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 通用API方法
export const apiRequest: ApiMethods = {
  // GET请求
  get: async <T = any>(url: string, config?: RequestConfig): Promise<T> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST请求
  post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT请求
  put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // DELETE请求
  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // PATCH请求
  patch: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // 文件上传
  upload: async <T = unknown>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// 导出默认实例
export default api;
