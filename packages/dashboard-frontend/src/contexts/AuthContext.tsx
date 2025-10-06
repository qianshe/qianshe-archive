import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthContextType, AuthAction, AuthProviderProps } from '../types/react';
import type { LoginResponse, RefreshTokenResponse } from '../types/services';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化时检查本地存储的token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        try {
          // 验证token有效性
          const user = await authService.verifyToken();
          if (user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          } else {
            // token无效，尝试刷新
            await refreshAccessToken();
          }
        } catch (error: unknown) {
          // TODO: Replace with proper logging service
          // logger.error('Auth initialization error:', { error });
          logout();
        }
      } else {
        dispatch({ type: 'AUTH_SUCCESS', payload: null });
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const apiResponse = await authService.login(username, password);
      const responseData = (apiResponse as unknown as { data?: LoginResponse }).data || apiResponse;
      const { user, tokens } = responseData as LoginResponse;

      // 存储tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast.success('登录成功');
    } catch (error: unknown) {
      let message = '登录失败';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        message = axiosError.response?.data?.error || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const adminLogin = async (password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const apiResponse = await authService.adminLogin(password);
      const responseData = (apiResponse as unknown as { data?: LoginResponse }).data || apiResponse;
      const { user, tokens } = responseData as LoginResponse;

      // 存储tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast.success('管理员登录成功');
    } catch (error: unknown) {
      let message = '登录失败';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        message = axiosError.response?.data?.error || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 调用登出API（不等待结果）
    authService.logout().catch(() => {
      // TODO: Replace with proper logging service
      // logger.error('Logout API error');
    });

    dispatch({ type: 'LOGOUT' });
    toast.success('已退出登录');
  };

  const refreshAccessToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const apiResponse = await authService.refreshToken(refreshToken);
      const responseData = (apiResponse as unknown as { data?: RefreshTokenResponse }).data || apiResponse;
      const { tokens } = responseData as RefreshTokenResponse;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // 获取用户信息
      const user = await authService.verifyToken();
      if (user) {
        dispatch({ type: 'REFRESH_TOKEN', payload: user });
      }
    } catch (error: unknown) {
      // TODO: Replace with proper logging service
      // logger.error('Token refresh failed:', { error });
      logout();
    }
  };

  const refreshToken = async (): Promise<void> => {
    await refreshAccessToken();
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    adminLogin,
    logout,
    refreshToken,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
