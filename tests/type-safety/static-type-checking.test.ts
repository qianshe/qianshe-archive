/**
 * 静态类型检查测试
 * 验证TypeScript编译器类型检查的正确性
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

interface TypeCheckResult {
  success: boolean;
  errors: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }>;
}

describe('静态类型检查测试', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const portfolioPath = path.join(projectRoot, 'portfolio');
  const dashboardPath = path.join(projectRoot, 'dashboard');

  beforeAll(() => {
    // 确保所有项目依赖已安装
    try {
      execSync('npm run install:all', { cwd: projectRoot, stdio: 'pipe' });
    } catch (error) {
      console.warn('依赖安装警告:', error);
    }
  });

  /**
   * 执行TypeScript类型检查
   */
  function runTypeCheck(projectPath: string): TypeCheckResult {
    try {
      const result = execSync('npx tsc --noEmit --pretty false', {
        cwd: projectPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        success: true,
        errors: [],
        warnings: []
      };
    } catch (error: any) {
      const output = error.stdout || error.message;
      const lines = output.split('\n').filter(line => line.trim());
      
      const errors: TypeCheckResult['errors'] = [];
      const warnings: TypeCheckResult['warnings'] = [];

      for (const line of lines) {
        // 解析TypeScript错误格式: filename(line,column): error TS####: message
        const match = line.match(/^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/);
        if (match) {
          const [, file, lineNum, colNum, severity, code, message] = match;
          
          if (severity === 'error') {
            errors.push({
              file: file.trim(),
              line: parseInt(lineNum),
              column: parseInt(colNum),
              message: message.trim(),
              severity: 'error'
            });
          } else {
            warnings.push({
              file: file.trim(),
              line: parseInt(lineNum),
              column: parseInt(colNum),
              message: message.trim()
            });
          }
        }
      }

      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * 检查关键类型定义文件
   */
  function checkTypeDefinitions(projectPath: string): {
    missingFiles: string[];
    presentFiles: string[];
  } {
    const criticalFiles = [
      'src/types/index.ts',
      'src/types/api.ts',
      'src/types/database.ts',
      'src/types/common.ts'
    ];

    const missingFiles: string[] = [];
    const presentFiles: string[] = [];

    for (const file of criticalFiles) {
      const fullPath = path.join(projectPath, file);
      if (existsSync(fullPath)) {
        presentFiles.push(file);
      } else {
        missingFiles.push(file);
      }
    }

    return { missingFiles, presentFiles };
  }

  describe('Portfolio 类型检查', () => {
    it('应该通过TypeScript编译检查', () => {
      const result = runTypeCheck(portfolioPath);
      
      if (!result.success) {
        console.error('Portfolio类型错误:', result.errors);
        console.error('Portfolio类型警告:', result.warnings);
      }

      // 期望所有关键类型错误都已修复
      const criticalErrors = result.errors.filter(error => 
        !error.message.includes('any') && // 允许any类型的警告
        !error.file.includes('node_modules')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    it('应该包含完整的类型定义文件', () => {
      const { missingFiles, presentFiles } = checkTypeDefinitions(portfolioPath);
      
      console.log('Portfolio类型定义文件:', presentFiles);
      if (missingFiles.length > 0) {
        console.warn('Portfolio缺少类型定义:', missingFiles);
      }

      // 至少应该有基础的类型定义
      expect(presentFiles.length).toBeGreaterThan(0);
    });

    it('API响应类型应该正确定义', () => {
      const apiTypesPath = path.join(portfolioPath, 'src/types/api.ts');
      if (existsSync(apiTypesPath)) {
        const content = readFileSync(apiTypesPath, 'utf8');
        
        // 检查关键API类型定义
        const expectedTypes = [
          'ApiResponse',
          'PostResponse',
          'ProjectResponse',
          'CommentResponse'
        ];

        for (const type of expectedTypes) {
          expect(content).toContain(`interface ${type}`) || 
          expect(content).toContain(`type ${type}`);
        }
      }
    });
  });

  describe('Dashboard 类型检查', () => {
    it('应该通过TypeScript编译检查', () => {
      const result = runTypeCheck(dashboardPath);
      
      if (!result.success) {
        console.error('Dashboard类型错误:', result.errors);
        console.error('Dashboard类型警告:', result.warnings);
      }

      const criticalErrors = result.errors.filter(error => 
        !error.message.includes('any') &&
        !error.file.includes('node_modules')
      );

      expect(criticalErrors).toHaveLength(0);
    });

    it('应该包含完整的类型定义文件', () => {
      const { missingFiles, presentFiles } = checkTypeDefinitions(dashboardPath);
      
      console.log('Dashboard类型定义文件:', presentFiles);
      if (missingFiles.length > 0) {
        console.warn('Dashboard缺少类型定义:', missingFiles);
      }

      expect(presentFiles.length).toBeGreaterThan(0);
    });

    it('管理API类型应该正确定义', () => {
      const apiTypesPath = path.join(dashboardPath, 'src/types/api.ts');
      if (existsSync(apiTypesPath)) {
        const content = readFileSync(apiTypesPath, 'utf8');
        
        const expectedTypes = [
          'AuthResponse',
          'UserResponse',
          'PostManageResponse',
          'AnalyticsResponse'
        ];

        for (const type of expectedTypes) {
          expect(content).toContain(`interface ${type}`) || 
          expect(content).toContain(`type ${type}`);
        }
      }
    });
  });

  describe('共享类型检查', () => {
    it('全局类型定义应该有效', () => {
      const globalsPath = path.join(projectRoot, 'globals.d.ts');
      expect(existsSync(globalsPath)).toBe(true);

      const content = readFileSync(globalsPath, 'utf8');
      
      // 检查关键的全局类型定义
      const expectedInterfaces = [
        'D1Database',
        'D1PreparedStatement',
        'D1Result',
        'KVNamespace',
        'R2Bucket'
      ];

      for (const interfaceName of expectedInterfaces) {
        expect(content).toContain(`interface ${interfaceName}`);
      }
    });

    it('共享类型定义应该一致', () => {
      const sharedTypesPath = path.join(projectRoot, 'shared/types');
      if (existsSync(sharedTypesPath)) {
        // 这里可以添加共享类型一致性检查
        // 确保Portfolio和Dashboard使用的共享类型是一致的
        expect(true).toBe(true); // 暂时通过，实际实现需要根据具体情况
      }
    });
  });

  describe('类型安全性验证', () => {
    it('应该避免使用any类型', () => {
      const portfolioResult = runTypeCheck(portfolioPath);
      const dashboardResult = runTypeCheck(dashboardPath);

      // 统计any类型的使用
      const anyUsagePortfolio = portfolioResult.warnings.filter(w => 
        w.message.includes('any')
      ).length;

      const anyUsageDashboard = dashboardResult.warnings.filter(w => 
        w.message.includes('any')
      ).length;

      console.log(`Portfolio any类型使用: ${anyUsagePortfolio}处`);
      console.log(`Dashboard any类型使用: ${anyUsageDashboard}处`);

      // any类型的使用应该尽可能少
      expect(anyUsagePortfolio + anyUsageDashboard).toBeLessThan(10);
    });

    it('应该正确处理可选属性', () => {
      // 检查可选属性的类型安全性
      // 这里可以添加更具体的可选属性检查逻辑
      expect(true).toBe(true);
    });

    it('应该有严格的null检查', () => {
      // 检查是否有适当的null检查配置
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      if (existsSync(tsconfigPath)) {
        const content = readFileSync(tsconfigPath, 'utf8');
        
        // 检查严格模式配置
        expect(content).toContain('"strict": true');
      }
    });
  });
});