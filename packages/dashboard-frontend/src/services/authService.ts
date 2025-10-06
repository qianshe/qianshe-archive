import { api } from './api';
import { User, LoginResponse, ApiResponse } from '../types';

export const authService = {
  // 用户登录
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // 管理员登录
  async adminLogin(password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post('/auth/admin-login', { password });
    return response.data;
  },

  // 登出
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 刷新token
  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // 验证token
  async verifyToken(): Promise<User | null> {
    try {
      const response = await api.get('/auth/verify');
      return response.data.data?.user || null;
    } catch (_error) {
      return null;
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/verify');
    return response.data.data.user;
  }
};
