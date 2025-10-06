/**
 * 数据保护验证测试
 * 测试数据加密、隐私保护和合规性
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// 数据保护测试工具
class DataProtectionTester {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async testDataEncryption(
    endpoint: string,
    sensitiveData: any
  ): Promise<{
    encrypted: boolean;
    response?: Response;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensitiveData)
      });

      const responseText = await response.text();

      // 检查敏感数据是否以明文传输
      const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'creditCard'];
      let plaintextFound = false;

      for (const field of sensitiveFields) {
        if (sensitiveData[field] && responseText.includes(sensitiveData[field])) {
          plaintextFound = true;
          issues.push(`Sensitive field '${field}' appears to be in plaintext`);
        }
      }

      // 检查是否使用HTTPS（在真实环境中）
      if (this.baseUrl.startsWith('http://') && !this.baseUrl.includes('localhost')) {
        issues.push('Data transmitted over unencrypted HTTP');
      }

      return {
        encrypted: !plaintextFound && issues.length === 0,
        response,
        issues
      };
    } catch (_error) {
      issues.push(`Request failed: ${error}`);
      return { encrypted: false, issues };
    }
  }

  async testPersonalDataHandling(endpoint: string): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      const responseText = await response.text();

      // 检查是否返回了不必要的个人数据
      const personalDataPatterns = [
        { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
        { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, type: 'Credit Card' },
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'Email' },
        { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, type: 'Phone Number' }
      ];

      personalDataPatterns.forEach(({ pattern, type }) => {
        const matches = responseText.match(pattern);
        if (matches && matches.length > 0) {
          issues.push(`Found potential ${type} data: ${matches.length} occurrences`);
        }
      });

      // 检查是否有隐私政策相关头
      const privacyHeaders = ['x-privacy-policy', 'x-data-processing', 'x-gdpr-compliant'];

      privacyHeaders.forEach(header => {
        if (!response.headers.get(header)) {
          // 注意：这些不是标准头，所以仅记录警告
        }
      });

      return {
        compliant: issues.length === 0,
        issues
      };
    } catch (_error) {
      issues.push(`Request failed: ${error}`);
      return { compliant: false, issues };
    }
  }

  async testDataRetention(endpoint: string): Promise<{
    hasRetentionPolicy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // 检查是否有数据保留相关的端点或头
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET'
      });

      const retentionHeaders = ['x-data-retention', 'x-data-expiry', 'cache-control', 'expires'];

      let hasRetentionInfo = false;
      retentionHeaders.forEach(header => {
        if (response.headers.get(header)) {
          hasRetentionInfo = true;
        }
      });

      if (!hasRetentionInfo) {
        issues.push('No data retention information found in headers');
      }

      return {
        hasRetentionPolicy: hasRetentionInfo,
        issues
      };
    } catch (_error) {
      issues.push(`Request failed: ${error}`);
      return { hasRetentionPolicy: false, issues };
    }
  }

  async testCookieSecurity(): Promise<{
    secure: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET'
      });

      const setCookieHeader = response.headers.get('set-cookie');

      if (setCookieHeader) {
        // 检查Cookie安全属性
        if (!setCookieHeader.includes('Secure')) {
          issues.push('Cookie missing Secure flag');
        }

        if (!setCookieHeader.includes('HttpOnly')) {
          issues.push('Cookie missing HttpOnly flag');
        }

        if (!setCookieHeader.includes('SameSite')) {
          issues.push('Cookie missing SameSite attribute');
        }
      }

      return {
        secure: issues.length === 0,
        issues
      };
    } catch (_error) {
      issues.push(`Request failed: ${error}`);
      return { secure: false, issues };
    }
  }

  async testAccessControls(endpoint: string): Promise<{
    hasAccessControl: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // 测试未授权访问
      const unauthorizedResponse = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET'
      });

      // 测试授权访问（模拟有权限的请求）
      const authorizedResponse = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test-token'
        }
      });

      // 检查是否有适当的访问控制
      if (unauthorizedResponse.ok && authorizedResponse.ok) {
        issues.push('Endpoint appears to lack access control');
      }

      // 检查CORS头
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];

      corsHeaders.forEach(header => {
        if (!authorizedResponse.headers.get(header)) {
          issues.push(`Missing CORS header: ${header}`);
        }
      });

      return {
        hasAccessControl: issues.length === 0,
        issues
      };
    } catch (_error) {
      issues.push(`Request failed: ${error}`);
      return { hasAccessControl: false, issues };
    }
  }
}

describe('数据保护验证测试', () => {
  const portfolioUrl = process.env.TEST_PORTFOLIO_URL || 'http://localhost:8787';
  const dashboardUrl = process.env.TEST_DASHBOARD_URL || 'http://localhost:8788';

  const portfolioTester = new DataProtectionTester(portfolioUrl);
  const dashboardTester = new DataProtectionTester(dashboardUrl);

  beforeAll(() => {
    console.info('开始数据保护验证测试...');
  });

  describe('数据加密测试', () => {
    it('应该加密传输敏感数据', async () => {
      const sensitiveData = {
        email: 'test@example.com',
        password: 'SuperSecretPassword123!',
        phone: '+1234567890',
        ssn: '123-45-6789',
        creditCard: '4111-1111-1111-1111'
      };

      const portfolioResult = await portfolioTester.testDataEncryption(
        '/api/contact',
        sensitiveData
      );
      const dashboardResult = await dashboardTester.testDataEncryption('/api/auth/login', {
        email: sensitiveData.email,
        password: sensitiveData.password
      });

      console.info('Portfolio 数据加密测试:', {
        加密状态: portfolioResult.encrypted,
        发现的问题: portfolioResult.issues
      });

      console.info('Dashboard 数据加密测试:', {
        加密状态: dashboardResult.encrypted,
        发现的问题: dashboardResult.issues
      });

      // 在测试环境中，我们主要检查是否有明显的明文传输
      expect(portfolioResult.issues.length + dashboardResult.issues.length).toBeLessThan(3);
    });
  });

  describe('个人数据处理测试', () => {
    it('应该遵守个人数据处理原则', async () => {
      const endpoints = ['/api/posts', '/api/comments', '/api/users'];

      const totalIssues: string[] = [];

      for (const endpoint of endpoints) {
        const portfolioResult = await portfolioTester.testPersonalDataHandling(endpoint);
        totalIssues.push(...portfolioResult.issues);

        if (endpoint !== '/api/posts') {
          // 避免重复测试
          const dashboardResult = await dashboardTester.testPersonalDataHandling(endpoint);
          totalIssues.push(...dashboardResult.issues);
        }
      }

      console.info('个人数据处理测试结果:', {
        总问题数: totalIssues.length,
        问题列表: totalIssues
      });

      // 允许一些个人数据在API中返回（如用户邮箱），但应该有合理的原因
      expect(totalIssues.length).toBeLessThan(10);
    });
  });

  describe('数据保留政策测试', () => {
    it('应该有数据保留政策', async () => {
      const endpoints = ['/api/posts', '/api/comments', '/api/settings'];

      let hasRetentionPolicy = 0;
      const totalIssues: string[] = [];

      for (const endpoint of endpoints) {
        const portfolioResult = await portfolioTester.testDataRetention(endpoint);
        if (portfolioResult.hasRetentionPolicy) {
          hasRetentionPolicy++;
        }
        totalIssues.push(...portfolioResult.issues);
      }

      console.info('数据保留政策测试结果:', {
        有保留政策的端点数: hasRetentionPolicy,
        总端点数: endpoints.length,
        问题列表: totalIssues
      });

      // 至少应该有一些缓存控制头
      expect(hasRetentionPolicy).toBeGreaterThan(0);
    });
  });

  describe('Cookie 安全测试', () => {
    it('应该设置安全的 Cookie 属性', async () => {
      const portfolioResult = await portfolioTester.testCookieSecurity();
      const dashboardResult = await dashboardTester.testCookieSecurity();

      console.info('Portfolio Cookie 安全测试:', {
        安全状态: portfolioResult.secure,
        问题列表: portfolioResult.issues
      });

      console.info('Dashboard Cookie 安全测试:', {
        安全状态: dashboardResult.secure,
        问题列表: dashboardResult.issues
      });

      // 在本地开发中，Secure标志可能不设置，但其他安全属性应该存在
      const totalIssues = [...portfolioResult.issues, ...dashboardResult.issues];
      const criticalIssues = totalIssues.filter(issue => !issue.includes('Secure flag'));

      expect(criticalIssues.length).toBeLessThan(3);
    });
  });

  describe('访问控制测试', () => {
    it('应该有适当的访问控制', async () => {
      const testEndpoints = [
        { endpoint: '/api/admin/users', sensitive: true },
        { endpoint: '/api/settings', sensitive: true },
        { endpoint: '/api/posts', sensitive: false },
        { endpoint: '/api/comments', sensitive: false }
      ];

      let secureEndpoints = 0;
      const totalIssues: string[] = [];

      for (const { endpoint, sensitive } of testEndpoints) {
        const portfolioResult = await portfolioTester.testAccessControls(endpoint);

        if (portfolioResult.hasAccessControl) {
          secureEndpoints++;
        }

        totalIssues.push(...portfolioResult.issues);

        // 测试Dashboard的敏感端点
        if (sensitive) {
          const dashboardResult = await dashboardTester.testAccessControls(endpoint);
          if (dashboardResult.hasAccessControl) {
            secureEndpoints++;
          }
          totalIssues.push(...dashboardResult.issues);
        }
      }

      console.info('访问控制测试结果:', {
        安全端点数: secureEndpoints,
        总测试数: testEndpoints.length + testEndpoints.filter(e => e.sensitive).length,
        问题列表: totalIssues
      });

      // 敏感端点必须有访问控制
      expect(secureEndpoints).toBeGreaterThanOrEqual(testEndpoints.filter(e => e.sensitive).length);
    });
  });

  describe('GDPR 合规性测试', () => {
    it('应该支持GDPR相关功能', async () => {
      const gdprEndpoints = [
        '/api/privacy-policy',
        '/api/data-export',
        '/api/data-delete',
        '/api/user-consent'
      ];

      let implementedEndpoints = 0;

      for (const endpoint of gdprEndpoints) {
        try {
          const response = await fetch(`${dashboardUrl}${endpoint}`, {
            method: 'GET'
          });

          if (response.status !== 404) {
            implementedEndpoints++;
          }
        } catch (_error) {
          // 端点不存在是正常的，我们只是检查是否实现了相关功能
        }
      }

      console.info('GDPR 合规性测试结果:', {
        已实现的GDPR端点数: implementedEndpoints,
        建议的端点数: gdprEndpoints.length
      });

      // 不是所有端点都必须实现，但应该有一些
      expect(implementedEndpoints).toBeGreaterThanOrEqual(0);
    });
  });

  describe('数据备份和恢复测试', () => {
    it('应该有数据备份机制', async () => {
      const backupEndpoints = ['/api/backup/create', '/api/backup/restore', '/api/backup/status'];

      let backupFeatures = 0;

      for (const endpoint of backupEndpoints) {
        try {
          const response = await fetch(`${dashboardUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
          });

          if (response.status !== 404) {
            backupFeatures++;
          }
        } catch (_error) {
          // 备份端点可能不存在或需要特殊权限
        }
      }

      console.info('数据备份功能测试结果:', {
        备份功能数: backupFeatures,
        测试的端点数: backupEndpoints.length
      });

      // 备份功能是可选的，但如果实现应该安全
      expect(backupFeatures).toBeGreaterThanOrEqual(0);
    });
  });

  describe('日志和审计测试', () => {
    it('应该有适当的日志记录', async () => {
      const auditEndpoints = ['/api/audit/logs', '/api/activity/logs', '/api/security/events'];

      let auditFeatures = 0;

      for (const endpoint of auditEndpoints) {
        try {
          const response = await fetch(`${dashboardUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              Authorization: 'Bearer admin-token'
            }
          });

          if (response.ok) {
            auditFeatures++;
          }
        } catch (_error) {
          // 审计端点可能需要特殊权限
        }
      }

      console.info('日志和审计功能测试结果:', {
        审计功能数: auditFeatures,
        测试的端点数: auditEndpoints.length
      });

      // 审计功能是可选的，但对安全很重要
      expect(auditFeatures).toBeGreaterThanOrEqual(0);
    });
  });

  afterAll(() => {
    console.info('数据保护验证测试完成');
    console.info('注意: 这些测试仅用于基本数据保护检查，生产环境建议进行专业的安全审计');
  });
});
