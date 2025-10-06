/**
 * 负载测试
 * 测试系统在高并发情况下的性能表现
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// 模拟并发请求的工具函数
const concurrentRequests = async (
  url: string,
  concurrency: number,
  requests: number
): Promise<{
  totalTime: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  responses: Array<{ status: number; responseTime: number; success: boolean }>;
}> => {
  const startTime = Date.now();
  const results: Array<{ status: number; responseTime: number; success: boolean }> = [];

  // 分批执行请求以控制并发数
  for (let i = 0; i < requests; i += concurrency) {
    const batch = Math.min(concurrency, requests - i);
    const batchPromises = Array.from({ length: batch }, async () => {
      const requestStart = Date.now();
      try {
        const response = await fetch(url);
        const responseTime = Date.now() - requestStart;
        return {
          status: response.status,
          responseTime,
          success: response.ok
        };
      } catch (_error) {
        const responseTime = Date.now() - requestStart;
        return {
          status: 0,
          responseTime,
          success: false
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // 批次间短暂休息以避免过载
    if (i + batch < requests) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const totalTime = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;
  const responseTimes = results.map(r => r.responseTime);
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);
  const minResponseTime = Math.min(...responseTimes);

  return {
    totalTime,
    successCount,
    errorCount,
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    responses: results
  };
};

describe('负载测试', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8787';

  beforeAll(async () => {
    // 确保测试环境准备就绪
    console.info('开始负载测试...');
    console.info(`测试目标: ${baseUrl}`);
  });

  describe('Portfolio API 负载测试', () => {
    it('应该能处理中等并发的首页请求', async () => {
      const result = await concurrentRequests(`${baseUrl}/`, 20, 100);

      console.info('首页负载测试结果:', {
        总请求数: 100,
        并发数: 20,
        成功数: result.successCount,
        失败数: result.errorCount,
        总耗时: `${result.totalTime}ms`,
        平均响应时间: `${result.averageResponseTime.toFixed(2)}ms`,
        最大响应时间: `${result.maxResponseTime}ms`,
        最小响应时间: `${result.minResponseTime}ms`
      });

      // 性能断言
      expect(result.successCount).toBeGreaterThan(95); // 95%成功率
      expect(result.averageResponseTime).toBeLessThan(2000); // 平均响应时间小于2秒
      expect(result.maxResponseTime).toBeLessThan(5000); // 最大响应时间小于5秒
    });

    it('应该能处理文章列表API的并发请求', async () => {
      const result = await concurrentRequests(`${baseUrl}/api/posts?page=1&limit=10`, 30, 150);

      console.info('文章列表API负载测试结果:', {
        总请求数: 150,
        并发数: 30,
        成功率: `${((result.successCount / 150) * 100).toFixed(2)}%`,
        平均响应时间: `${result.averageResponseTime.toFixed(2)}ms`
      });

      expect(result.successCount).toBeGreaterThan(140); // 93%成功率
      expect(result.averageResponseTime).toBeLessThan(3000); // API响应时间要求更严格
    });

    it('应该能处理项目列表API的并发请求', async () => {
      const result = await concurrentRequests(`${baseUrl}/api/projects?page=1&limit=10`, 25, 125);

      console.info('项目列表API负载测试结果:', {
        总请求数: 125,
        并发数: 25,
        成功率: `${((result.successCount / 125) * 100).toFixed(2)}%`,
        平均响应时间: `${result.averageResponseTime.toFixed(2)}ms`
      });

      expect(result.successCount).toBeGreaterThan(115); // 92%成功率
      expect(result.averageResponseTime).toBeLessThan(2500);
    });
  });

  describe('Dashboard API 负载测试', () => {
    const dashboardUrl = process.env.TEST_DASHBOARD_URL || 'http://localhost:8788';

    it('应该能处理登录API的并发请求', async () => {
      const loginPromises = Array.from({ length: 20 }, async () => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${dashboardUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'admin@test.com',
              password: 'testpassword'
            })
          });
          const responseTime = Date.now() - startTime;
          return {
            status: response.status,
            responseTime,
            success: response.ok
          };
        } catch (_error) {
          const responseTime = Date.now() - startTime;
          return {
            status: 0,
            responseTime,
            success: false
          };
        }
      });

      const results = await Promise.all(loginPromises);
      const successCount = results.filter(r => r.success).length;
      const averageResponseTime =
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      console.info('登录API负载测试结果:', {
        总请求数: 20,
        成功数: successCount,
        平均响应时间: `${averageResponseTime.toFixed(2)}ms`
      });

      expect(successCount).toBeGreaterThan(15); // 75%成功率（考虑到可能的认证失败）
      expect(averageResponseTime).toBeLessThan(5000); // 认证API允许更长响应时间
    });
  });

  describe('压力测试', () => {
    it('应该能在高并发下保持稳定运行', async () => {
      // 模拟更高的并发压力
      const result = await concurrentRequests(`${baseUrl}/api/posts`, 50, 200);

      console.info('压力测试结果:', {
        总请求数: 200,
        并发数: 50,
        成功率: `${((result.successCount / 200) * 100).toFixed(2)}%`,
        平均响应时间: `${result.averageResponseTime.toFixed(2)}ms`,
        最大响应时间: `${result.maxResponseTime}ms`
      });

      // 在高压力下适当降低期望
      expect(result.successCount).toBeGreaterThan(180); // 90%成功率
      expect(result.averageResponseTime).toBeLessThan(5000); // 高压力下允许更长响应时间
    });

    it('应该能处理混合类型的并发请求', async () => {
      const endpoints = [
        `${baseUrl}/`,
        `${baseUrl}/api/posts`,
        `${baseUrl}/api/projects`,
        `${baseUrl}/api/posts/1`,
        `${baseUrl}/api/projects/1`
      ];

      const mixedRequests = await Promise.all(
        endpoints.map(endpoint => concurrentRequests(endpoint, 15, 75))
      );

      const totalSuccess = mixedRequests.reduce((sum, result) => sum + result.successCount, 0);
      const totalRequests = mixedRequests.reduce((sum, result) => sum + result.responses.length, 0);
      const overallSuccessRate = (totalSuccess / totalRequests) * 100;

      console.info('混合负载测试结果:', {
        总请求数: totalRequests,
        总成功数: totalSuccess,
        整体成功率: `${overallSuccessRate.toFixed(2)}%`
      });

      expect(overallSuccessRate).toBeGreaterThan(85); // 混合请求85%成功率
    });
  });

  describe('缓存性能测试', () => {
    it('应该能利用缓存提高响应速度', async () => {
      // 第一次请求（缓存未命中）
      const firstRequest = await concurrentRequests(`${baseUrl}/api/posts`, 10, 10);

      // 等待短暂时间让缓存生效
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 第二次请求（应该命中缓存）
      const secondRequest = await concurrentRequests(`${baseUrl}/api/posts`, 10, 10);

      console.info('缓存性能测试结果:', {
        首次请求平均响应时间: `${firstRequest.averageResponseTime.toFixed(2)}ms`,
        缓存请求平均响应时间: `${secondRequest.averageResponseTime.toFixed(2)}ms`,
        性能提升: `${(((firstRequest.averageResponseTime - secondRequest.averageResponseTime) / firstRequest.averageResponseTime) * 100).toFixed(2)}%`
      });

      // 缓存命中后响应时间应该显著降低
      expect(secondRequest.averageResponseTime).toBeLessThan(
        firstRequest.averageResponseTime * 0.7
      );
    });
  });

  describe('错误恢复测试', () => {
    it('应该能优雅处理请求失败并快速恢复', async () => {
      // 向不存在的端点发送请求
      const errorRequests = await concurrentRequests(`${baseUrl}/api/nonexistent`, 20, 40);

      // 然后恢复正常请求
      const recoveryRequests = await concurrentRequests(`${baseUrl}/api/posts`, 20, 40);

      console.info('错误恢复测试结果:', {
        错误请求失败数: errorRequests.errorCount,
        恢复请求成功率: `${((recoveryRequests.successCount / 40) * 100).toFixed(2)}%`,
        恢复请求平均响应时间: `${recoveryRequests.averageResponseTime.toFixed(2)}ms`
      });

      // 错误请求应该失败
      expect(errorRequests.errorCount).toBeGreaterThan(35);

      // 恢复请求应该成功
      expect(recoveryRequests.successCount).toBeGreaterThan(35);
      expect(recoveryRequests.averageResponseTime).toBeLessThan(3000);
    });
  });

  afterAll(() => {
    console.info('负载测试完成');
  });
});
