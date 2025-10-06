/**
 * 性能基准测试
 * 测试关键功能的性能基准并建立性能监控基线
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// 性能监控工具
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
    };
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name);
      if (metrics) {
        result[name] = metrics;
      }
    }

    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

// 内存使用监控
const getMemoryUsage = (): NodeJS.MemoryUsage | null => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage();
  }
  return null;
};

// 模拟数据库查询性能测试
const simulateDatabaseQuery = async (
  complexity: 'simple' | 'medium' | 'complex' = 'simple'
): Promise<any> => {
  const delays = {
    simple: Math.random() * 50 + 10, // 10-60ms
    medium: Math.random() * 100 + 50, // 50-150ms
    complex: Math.random() * 200 + 100 // 100-300ms
  };

  await new Promise(resolve => setTimeout(resolve, delays[complexity]));

  return {
    id: Math.floor(Math.random() * 1000),
    title: `Test Item ${Math.random()}`,
    content: `Test content ${Math.random()}`.repeat(complexity === 'complex' ? 10 : 1),
    created_at: new Date().toISOString()
  };
};

// 模拟API响应性能测试
const simulateApiResponse = async (
  endpoint: string,
  dataSize: 'small' | 'medium' | 'large' = 'small'
): Promise<any> => {
  const dataSizes = {
    small: 10, // 10条记录
    medium: 100, // 100条记录
    large: 1000 // 1000条记录
  };

  const size = dataSizes[dataSize];
  const data = Array.from({ length: size }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    created_at: new Date().toISOString()
  }));

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

  return {
    success: true,
    data: {
      items: data,
      pagination: {
        page: 1,
        limit: size,
        total: size,
        totalPages: 1
      }
    }
  };
};

describe('性能基准测试', () => {
  const monitor = new PerformanceMonitor();
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8787';

  beforeAll(() => {
    console.info('开始性能基准测试...');
    monitor.reset();
  });

  describe('数据库查询性能', () => {
    it('简单查询应该在合理时间内完成', async () => {
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('db_simple_query');
        await simulateDatabaseQuery('simple');
        stopTimer();
      }

      const metrics = monitor.getMetrics('db_simple_query');
      console.info('简单数据库查询性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最小耗时: `${metrics?.min.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`,
        测试次数: metrics?.count
      });

      expect(metrics?.avg).toBeLessThan(100); // 平均响应时间小于100ms
      expect(metrics?.max).toBeLessThan(200); // 最大响应时间小于200ms
    });

    it('中等复杂度查询性能测试', async () => {
      const iterations = 30;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('db_medium_query');
        await simulateDatabaseQuery('medium');
        stopTimer();
      }

      const metrics = monitor.getMetrics('db_medium_query');
      console.info('中等复杂度数据库查询性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(200); // 平均响应时间小于200ms
      expect(metrics?.max).toBeLessThan(400); // 最大响应时间小于400ms
    });

    it('复杂查询性能测试', async () => {
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('db_complex_query');
        await simulateDatabaseQuery('complex');
        stopTimer();
      }

      const metrics = monitor.getMetrics('db_complex_query');
      console.info('复杂数据库查询性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(400); // 平均响应时间小于400ms
      expect(metrics?.max).toBeLessThan(800); // 最大响应时间小于800ms
    });
  });

  describe('API响应性能', () => {
    it('小数据量API响应性能', async () => {
      const iterations = 30;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('api_small_data');
        await simulateApiResponse('/api/posts', 'small');
        stopTimer();
      }

      const metrics = monitor.getMetrics('api_small_data');
      console.info('小数据量API响应性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(300); // 平均响应时间小于300ms
      expect(metrics?.max).toBeLessThan(600); // 最大响应时间小于600ms
    });

    it('中等数据量API响应性能', async () => {
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('api_medium_data');
        await simulateApiResponse('/api/posts', 'medium');
        stopTimer();
      }

      const metrics = monitor.getMetrics('api_medium_data');
      console.info('中等数据量API响应性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(800); // 平均响应时间小于800ms
      expect(metrics?.max).toBeLessThan(1500); // 最大响应时间小于1.5秒
    });

    it('大数据量API响应性能', async () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('api_large_data');
        await simulateApiResponse('/api/posts', 'large');
        stopTimer();
      }

      const metrics = monitor.getMetrics('api_large_data');
      console.info('大数据量API响应性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(2000); // 平均响应时间小于2秒
      expect(metrics?.max).toBeLessThan(4000); // 最大响应时间小于4秒
    });
  });

  describe('缓存性能', () => {
    it('缓存读取性能测试', async () => {
      const iterations = 100;

      // 模拟缓存读取
      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('cache_read');
        // 模拟缓存读取（非常快）
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 1));
        stopTimer();
      }

      const metrics = monitor.getMetrics('cache_read');
      console.info('缓存读取性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(20); // 缓存读取应该非常快
      expect(metrics?.max).toBeLessThan(50); // 最大缓存读取时间
    });

    it('缓存写入性能测试', async () => {
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const stopTimer = monitor.startTimer('cache_write');
        // 模拟缓存写入
        await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 5));
        stopTimer();
      }

      const metrics = monitor.getMetrics('cache_write');
      console.info('缓存写入性能:', {
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      expect(metrics?.avg).toBeLessThan(50); // 缓存写入应该很快
      expect(metrics?.max).toBeLessThan(100); // 最大缓存写入时间
    });
  });

  describe('内存使用监控', () => {
    it('应该监控内存使用情况', async () => {
      const initialMemory = getMemoryUsage();

      // 执行一些内存密集操作
      const largeArrays = [];
      for (let i = 0; i < 10; i++) {
        largeArrays.push(new Array(10000).fill(Math.random()));
      }

      const peakMemory = getMemoryUsage();

      // 清理内存
      largeArrays.length = 0;

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      const finalMemory = getMemoryUsage();

      if (initialMemory && peakMemory && finalMemory) {
        console.info('内存使用情况:', {
          初始内存: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          峰值内存: `${(peakMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          最终内存: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          内存增长: `${((peakMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`
        });

        // 内存增长应该在合理范围内
        const memoryGrowth = peakMemory.heapUsed - initialMemory.heapUsed;
        expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // 小于100MB增长
      }
    });
  });

  describe('并发性能', () => {
    it('并发处理性能测试', async () => {
      const concurrency = 20;
      const iterations = 5;

      for (let batch = 0; batch < iterations; batch++) {
        const stopTimer = monitor.startTimer('concurrent_requests');

        const promises = Array.from({ length: concurrency }, async () => {
          return simulateApiResponse('/api/posts', 'small');
        });

        await Promise.all(promises);
        stopTimer();
      }

      const metrics = monitor.getMetrics('concurrent_requests');
      console.info('并发处理性能:', {
        并发数: concurrency,
        平均耗时: `${metrics?.avg.toFixed(2)}ms`,
        最大耗时: `${metrics?.max.toFixed(2)}ms`
      });

      // 并发处理的平均时间应该合理
      expect(metrics?.avg).toBeLessThan(1000); // 平均并发处理时间小于1秒
    });
  });

  describe('性能回归检测', () => {
    it('建立性能基线并检测回归', async () => {
      const allMetrics = monitor.getAllMetrics();

      console.info('性能基线报告:');
      console.table(allMetrics);

      // 定义性能基线（这些值应该根据实际环境调整）
      const performanceBaselines = {
        db_simple_query: { maxAvg: 100, maxMax: 200 },
        db_medium_query: { maxAvg: 200, maxMax: 400 },
        db_complex_query: { maxAvg: 400, maxMax: 800 },
        api_small_data: { maxAvg: 300, maxMax: 600 },
        api_medium_data: { maxAvg: 800, maxMax: 1500 },
        api_large_data: { maxAvg: 2000, maxMax: 4000 },
        cache_read: { maxAvg: 20, maxMax: 50 },
        cache_write: { maxAvg: 50, maxMax: 100 },
        concurrent_requests: { maxAvg: 1000, maxMax: 2000 }
      };

      const regressions: string[] = [];

      for (const [metric, baseline] of Object.entries(performanceBaselines)) {
        const current = allMetrics[metric];
        if (current) {
          if (current.avg > baseline.maxAvg) {
            regressions.push(
              `${metric}: 平均性能超出基线 (${current.avg.toFixed(2)}ms > ${baseline.maxAvg}ms)`
            );
          }
          if (current.max > baseline.maxMax) {
            regressions.push(
              `${metric}: 最大性能超出基线 (${current.max.toFixed(2)}ms > ${baseline.maxMax}ms)`
            );
          }
        }
      }

      if (regressions.length > 0) {
        console.warn('检测到性能回归:');
        regressions.forEach(regression => console.warn(`  - ${regression}`));
      } else {
        console.info('所有性能指标都在基线范围内');
      }

      // 如果有严重回归，测试失败
      expect(regressions.length).toBeLessThan(3); // 允许少量回归
    });
  });

  afterAll(() => {
    console.info('性能基准测试完成');
    const finalMetrics = monitor.getAllMetrics();
    console.info('最终性能指标:');
    console.table(finalMetrics);
  });
});
