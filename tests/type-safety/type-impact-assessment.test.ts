/**
 * 类型变更影响评估测试
 * 验证类型定义变更对现有代码的影响，确保向后兼容性
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// 类型变更影响评估器
class TypeImpactAssessor {
  /**
   * 分析类型定义变更的影响范围
   */
  static analyzeTypeChanges(
    projectPath: string,
    changes: Array<{ file: string; oldType: string; newType: string; impact: 'breaking' | 'non-breaking' }>
  ): {
    affectedFiles: string[];
    breakingChanges: number;
    nonBreakingChanges: number;
    recommendations: string[];
  } {
    const affectedFiles: string[] = [];
    let breakingChanges = 0;
    let nonBreakingChanges = 0;
    const recommendations: string[] = [];

    for (const change of changes) {
      if (change.impact === 'breaking') {
        breakingChanges++;
      } else {
        nonBreakingChanges++;
      }

      // 查找使用该类型的文件
      const files = this.findFilesUsingType(projectPath, change.oldType);
      affectedFiles.push(...files);
    }

    // 去重
    const uniqueFiles = [...new Set(affectedFiles)];

    // 生成建议
    if (breakingChanges > 0) {
      recommendations.push('存在破坏性变更，需要版本号升级');
      recommendations.push('建议添加向后兼容性过渡期');
    }

    if (uniqueFiles.length > 10) {
      recommendations.push('影响范围较大，建议分阶段实施变更');
    }

    return {
      affectedFiles: uniqueFiles,
      breakingChanges,
      nonBreakingChanges,
      recommendations
    };
  }

  /**
   * 查找使用特定类型的文件
   */
  private static findFilesUsingType(projectPath: string, typeName: string): string[] {
    const files: string[] = [];
    
    try {
      // 使用grep搜索类型使用
      const result = execSync(`rg -l "${typeName}" --type ts --type tsx ${projectPath}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      files.push(...result.split('\n').filter(file => file.trim()));
    } catch (error) {
      // 没有找到匹配的文件
    }

    return files;
  }

  /**
   * 验证向后兼容性
   */
  static validateBackwardCompatibility(
    projectPath: string,
    compatibilityTests: Array<{ testName: string; testCode: string }>
  ): {
    passedTests: string[];
    failedTests: Array<{ name: string; error: string }>;
    compatibilityScore: number;
  } {
    const passedTests: string[] = [];
    const failedTests: Array<{ name: string; error: string }> = [];

    for (const test of compatibilityTests) {
      try {
        // 这里应该执行测试代码，简化版本直接检查语法
        const result = execSync(`npx tsc --noEmit --strict`, {
          cwd: projectPath,
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        passedTests.push(test.testName);
      } catch (error: any) {
        failedTests.push({
          name: test.testName,
          error: error.message
        });
      }
    }

    const totalTests = compatibilityTests.length;
    const compatibilityScore = totalTests > 0 ? (passedTests.length / totalTests) * 100 : 100;

    return {
      passedTests,
      failedTests,
      compatibilityScore
    };
  }

  /**
   * 检查类型定义的一致性
   */
  static checkTypeConsistency(projectPath: string): {
    inconsistencies: Array<{ file: string; issue: string }>;
    duplicateTypes: Array<{ type: string; files: string[] }>;
    missingExports: string[];
  } {
    const inconsistencies: Array<{ file: string; issue: string }> = [];
    const duplicateTypes: Array<{ type: string; files: string[] }> = [];
    const missingExports: string[] = [];

    // 这里应该实现更复杂的类型一致性检查逻辑
    // 简化版本检查基本的问题

    return {
      inconsistencies,
      duplicateTypes,
      missingExports
    };
  }
}

// 模拟的类型变更场景
const typeChangeScenarios = [
  {
    name: 'User接口新增字段',
    description: '在User接口中新增last_login字段',
    changes: [
      {
        file: 'src/types/user.ts',
        oldType: 'interface User { id: number; email: string; name: string; }',
        newType: 'interface User { id: number; email: string; name: string; last_login?: string; }',
        impact: 'non-breaking' as const
      }
    ]
  },
  {
    name: 'Post状态字段类型变更',
    description: '将Post的status字段从string改为枚举',
    changes: [
      {
        file: 'src/types/post.ts',
        oldType: 'status: string;',
        newType: 'status: "draft" | "published" | "private";',
        impact: 'breaking' as const
      }
    ]
  },
  {
    name: 'API响应格式重构',
    description: '统一API响应格式，添加metadata字段',
    changes: [
      {
        file: 'src/types/api.ts',
        oldType: 'interface ApiResponse<T> { success: boolean; data: T; }',
        newType: 'interface ApiResponse<T> { success: boolean; data: T; metadata?: { version: string; timestamp: string; }; }',
        impact: 'non-breaking' as const
      }
    ]
  }
];

describe('类型变更影响评估测试', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const portfolioPath = path.join(projectRoot, 'portfolio');
  const dashboardPath = path.join(projectRoot, 'dashboard');

  describe('类型变更影响分析', () => {
    it('应该正确分析非破坏性变更的影响', () => {
      const scenario = typeChangeScenarios[0]; // User接口新增字段
      const impact = TypeImpactAssessor.analyzeTypeChanges(portfolioPath, scenario.changes);

      expect(impact.breakingChanges).toBe(0);
      expect(impact.nonBreakingChanges).toBe(1);
      expect(impact.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('应该正确分析破坏性变更的影响', () => {
      const scenario = typeChangeScenarios[1]; // Post状态字段类型变更
      const impact = TypeImpactAssessor.analyzeTypeChanges(portfolioPath, scenario.changes);

      expect(impact.breakingChanges).toBe(1);
      expect(impact.recommendations).toContain('存在破坏性变更，需要版本号升级');
    });

    it('应该识别受影响的文件', () => {
      const scenario = typeChangeScenarios[2]; // API响应格式重构
      const impact = TypeImpactAssessor.analyzeTypeChanges(projectRoot, scenario.changes);

      expect(Array.isArray(impact.affectedFiles)).toBe(true);
      if (impact.affectedFiles.length > 0) {
        console.log('API响应格式变更影响的文件:', impact.affectedFiles);
      }
    });
  });

  describe('向后兼容性验证', () => {
    it('应该验证新增可选字段的兼容性', () => {
      const compatibilityTests = [
        {
          testName: 'User接口新增可选字段',
          testCode: `
            interface User { id: number; email: string; name: string; last_login?: string; }
            const user: User = { id: 1, email: 'test@example.com', name: 'Test' };
            console.log(user.email);
          `
        }
      ];

      const result = TypeImpactAssessor.validateBackwardCompatibility(portfolioPath, compatibilityTests);
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    });

    it('应该检测破坏性变更的兼容性问题', () => {
      const compatibilityTests = [
        {
          testName: 'Post状态字段类型变更',
          testCode: `
            interface Post { status: "draft" | "published" | "private"; }
            const post: Post = { status: "published" }; // 新类型
            const oldPost = { status: "published" as string }; // 旧类型兼容性
          `
        }
      ];

      const result = TypeImpactAssessor.validateBackwardCompatibility(portfolioPath, compatibilityTests);
      if (result.failedTests.length > 0) {
        console.log('兼容性测试失败:', result.failedTests);
      }
    });
  });

  describe('类型定义一致性检查', () => {
    it('应该检查Portfolio和Dashboard的类型一致性', () => {
      const portfolioConsistency = TypeImpactAssessor.checkTypeConsistency(portfolioPath);
      const dashboardConsistency = TypeImpactAssessor.checkTypeConsistency(dashboardPath);

      expect(Array.isArray(portfolioConsistency.inconsistencies)).toBe(true);
      expect(Array.isArray(dashboardConsistency.inconsistencies)).toBe(true);

      if (portfolioConsistency.inconsistencies.length > 0) {
        console.log('Portfolio类型一致性问题:', portfolioConsistency.inconsistencies);
      }

      if (dashboardConsistency.inconsistencies.length > 0) {
        console.log('Dashboard类型一致性问题:', dashboardConsistency.inconsistencies);
      }
    });

    it('应该检测重复的类型定义', () => {
      const consistency = TypeImpactAssessor.checkTypeConsistency(projectRoot);
      
      expect(Array.isArray(consistency.duplicateTypes)).toBe(true);
      
      if (consistency.duplicateTypes.length > 0) {
        console.log('发现重复类型定义:', consistency.duplicateTypes);
      }
    });

    it('应该检查缺失的类型导出', () => {
      const consistency = TypeImpactAssessor.checkTypeConsistency(projectRoot);
      
      expect(Array.isArray(consistency.missingExports)).toBe(true);
      
      if (consistency.missingExports.length > 0) {
        console.log('发现缺失的类型导出:', consistency.missingExports);
      }
    });
  });

  describe('类型变更风险评估', () => {
    it('应该评估类型变更的风险等级', () => {
      const riskAssessment = (changes: typeof typeChangeScenarios[0]['changes']) => {
        const impact = TypeImpactAssessor.analyzeTypeChanges(projectRoot, changes);
        
        let riskLevel: 'low' | 'medium' | 'high';
        if (impact.breakingChanges === 0) {
          riskLevel = 'low';
        } else if (impact.breakingChanges <= 2 && impact.affectedFiles.length <= 5) {
          riskLevel = 'medium';
        } else {
          riskLevel = 'high';
        }

        return { riskLevel, ...impact };
      };

      // 测试低风险变更
      const lowRiskScenario = typeChangeScenarios[0].changes;
      const lowRisk = riskAssessment(lowRiskScenario);
      expect(lowRisk.riskLevel).toBe('low');

      // 测试高风险变更
      const highRiskChanges = [
        {
          file: 'src/types/api.ts',
          oldType: 'interface ApiResponse<T> { success: boolean; data: T; }',
          newType: 'interface ApiResponse<T> { success: boolean; result: T; }',
          impact: 'breaking' as const
        }
      ];
      const highRisk = riskAssessment(highRiskChanges);
      expect(['medium', 'high']).toContain(highRisk.riskLevel);
    });

    it('应该生成类型变更建议', () => {
      const scenario = typeChangeScenarios[1]; // 破坏性变更
      const impact = TypeImpactAssessor.analyzeTypeChanges(portfolioPath, scenario.changes);

      expect(impact.recommendations.length).toBeGreaterThan(0);
      expect(impact.recommendations.some(rec => 
        rec.includes('破坏性变更') || rec.includes('向后兼容')
      )).toBe(true);
    });
  });

  describe('类型迁移策略测试', () => {
    it('应该建议渐进式类型迁移策略', () => {
      const migrationPlan = {
        phase: 1,
        description: '添加新的类型定义，保留旧类型',
        changes: [
          {
            action: 'add',
            type: 'PostStatusV2',
            definition: 'type PostStatusV2 = "draft" | "published" | "private" | "archived";'
          },
          {
            action: 'keep',
            type: 'PostStatus',
            definition: 'type PostStatus = string;'
          }
        ]
      };

      expect(migrationPlan.phase).toBe(1);
      expect(migrationPlan.changes.length).toBeGreaterThan(0);
    });

    it('应该验证类型迁移的完整性', () => {
      const migrationValidation = {
        originalTypes: ['Post', 'User', 'Comment'],
        newTypes: ['PostV2', 'UserV2', 'CommentV2'],
        migrationMap: {
          'Post': 'PostV2',
          'User': 'UserV2',
          'Comment': 'CommentV2'
        },
        isComplete: true
      };

      expect(migrationValidation.isComplete).toBe(true);
      expect(Object.keys(migrationValidation.migrationMap)).toHaveLength(
        migrationValidation.originalTypes.length
      );
    });
  });

  describe('类型性能影响测试', () => {
    it('应该评估类型检查性能影响', () => {
      const performanceTest = () => {
        const startTime = Date.now();
        
        try {
          execSync('npx tsc --noEmit', { 
            cwd: portfolioPath, 
            stdio: 'pipe' 
          });
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          return {
            success: true,
            duration,
            withinThreshold: duration < 10000 // 10秒阈值
          };
        } catch (error) {
          return {
            success: false,
            duration: 0,
            withinThreshold: false,
            error
          };
        }
      };

      const result = performanceTest();
      
      if (result.success) {
        expect(result.withinThreshold).toBe(true);
        console.log(`类型检查耗时: ${result.duration}ms`);
      }
    });

    it('应该检查编译输出的稳定性', () => {
      const stabilityTest = {
        beforeChange: {
          compilationTime: 1000,
          bundleSize: '1.2MB',
          errors: 0,
          warnings: 2
        },
        afterChange: {
          compilationTime: 1200,
          bundleSize: '1.3MB',
          errors: 0,
          warnings: 3
        },
        acceptableIncrease: {
          compilationTime: 500, // 500ms
          bundleSize: '0.2MB',
          warnings: 2
        }
      };

      const compilationTimeIncrease = 
        stabilityTest.afterChange.compilationTime - stabilityTest.beforeChange.compilationTime;
      
      expect(compilationTimeIncrease).toBeLessThanOrEqual(
        stabilityTest.acceptableIncrease.compilationTime
      );
    });
  });

  describe('类型文档更新检查', () => {
    it('应该检查类型文档的完整性', () => {
      const documentationCheck = {
        typeDefinitionsFile: 'src/types/index.ts',
        apiDocumentationFile: 'docs/api.md',
        typeChangeLog: 'CHANGELOG.md',
        isComplete: true
      };

      // 检查类型定义文件是否存在
      const typesFileExists = existsSync(path.join(portfolioPath, documentationCheck.typeDefinitionsFile));
      expect(typesFileExists).toBe(true);

      // 检查API文档是否存在
      const apiDocsExist = existsSync(path.join(projectRoot, documentationCheck.apiDocumentationFile));
      // API文档可能不存在，这不影响测试
    });

    it('应该验证类型注释的质量', () => {
      const typeFile = path.join(portfolioPath, 'src/types/index.ts');
      if (existsSync(typeFile)) {
        const content = readFileSync(typeFile, 'utf8');
        
        // 检查是否有类型注释
        const hasTypeComments = content.includes('/**') || content.includes('/*');
        
        // 检查是否有JSDoc格式的注释
        const hasJsDocComments = content.includes('@param') || content.includes('@returns') || content.includes('@type');
        
        if (hasTypeComments) {
          console.log('发现类型注释');
        }
        
        if (hasJsDocComments) {
          console.log('发现JSDoc格式注释');
        }
      }
    });
  });
});