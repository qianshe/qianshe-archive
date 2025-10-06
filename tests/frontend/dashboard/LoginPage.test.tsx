/**
 * Dashboard 登录页面测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../../dashboard/src/components/LoginPage';
import { mockFetchResponse } from '../setup';

// Mock组件
vi.mock('../../../dashboard/src/components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderLoginPage = () => {
  const queryClient = createTestQueryClient();

  return {
    ...vi.requireActual('@testing-library/react').render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    ),
    queryClient
  };
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    expect(screen.getByText(/管理后台/i)).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('admin@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should validate required fields', async () => {
    renderLoginPage();

    const loginButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱是必填项/i)).toBeInTheDocument();
      expect(screen.getByText(/密码是必填项/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument();
    });
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 1,
          name: '管理员',
          email: 'admin@example.com',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    };

    global.fetch = vi.fn().mockResolvedValue(mockFetchResponse(mockResponse));

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@example.com',
            password: 'password123'
          })
        })
      );
    });

    // 验证token被保存到localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-jwt-token');
  });

  it('should handle login failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          success: false,
          error: '邮箱或密码错误'
        })
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/网络错误，请稍后重试/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve(
                mockFetchResponse({
                  success: true,
                  data: { user: { id: 1 }, token: 'token' }
                })
              ),
            100
          )
        )
    );

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // 检查加载状态
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(loginButton).not.toBeDisabled();
    });
  });

  it('should handle Enter key submission', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: { user: { id: 1 }, token: 'token' }
      })
    );

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 在密码输入框按Enter键
    fireEvent.keyDown(passwordInput, { key: 'Enter' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.any(Object)
      );
    });
  });

  it('should be accessible', () => {
    renderLoginPage();

    // 检查ARIA标签
    expect(screen.getByLabelText(/邮箱/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/密码/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /登录/i })).toHaveAttribute('type', 'submit');

    // 检查键盘导航
    const emailInput = screen.getByLabelText(/邮箱/i);
    emailInput.focus();
    expect(emailInput).toHaveFocus();

    // Tab键导航测试
    fireEvent.keyDown(emailInput, { key: 'Tab' });
    const passwordInput = screen.getByLabelText(/密码/i);
    expect(passwordInput).toHaveFocus();
  });

  it('should remember login state', async () => {
    // 模拟已有token的情况
    localStorage.setItem('auth_token', 'existing-token');

    renderLoginPage();

    // 如果已有token，应该重定向到dashboard
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('should clear errors on input change', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          success: false,
          error: '邮箱或密码错误'
        })
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const loginButton = screen.getByRole('button', { name: /登录/i });

    // 先触发错误
    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });

    // 输入新内容时清除错误
    fireEvent.change(emailInput, { target: { value: 'new-email@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText(/邮箱或密码错误/i)).not.toBeInTheDocument();
    });
  });

  it('should handle form reset', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 触发表单重置（如果有的话）
    fireEvent.reset(emailInput);

    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('password123');
  });
});
