#!/usr/bin/env node

/**
 * 代码质量监控脚本
 * 定期检查代码质量并生成报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      metrics: {},
      issues: [],
      summary: {}
    };
  }

  async runAllChecks() {
    console.log('🔍 开始代码质量监控...\n');

    await this.checkCodeComplexity();
    await this.checkTestCoverage();
    await this.checkDependencyHealth();
    await this.checkSecurityVulnerabilities();
    await this.checkCodeDuplication();
    await this.checkPerformanceMetrics();
    await this.generateQualityScore();
    await this.saveResults();

    console.log('✅ 质量监控完成！');
    this.displaySummary();
  }

  async checkCodeComplexity() {
    console.log('📊 检查代码复杂度...');

    try {
      // 使用ESLint统计规则违反
      const eslintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' });
      const errorCount = (eslintOutput.match(/✖ ([0-9]+) problems?/g) || [])
        .reduce((sum, match) => sum + parseInt(match.match(/\d+/)[0]), 0);

      this.results.metrics.codeComplexity = {
        errorCount,
        errorLevel: errorCount === 0 ? '优秀' : errorCount < 5 ? '良好' : '需要改进'
      };

      console.log(`  ✅ 发现 ${errorCount} 个代码质量问题`);
    } catch (error) {
      const errorOutput = error.stdout || error.message;
      const errorCount = (errorOutput.match(/✖ ([0-9]+) problems?/g) || [])
        .reduce((sum, match) => sum + parseInt(match.match(/\d+/)[0]), 0);

      this.results.metrics.codeComplexity = {
        errorCount,
        errorLevel: errorCount < 5 ? '良好' : '需要改进'
      };

      if (errorCount > 0) {
        this.results.issues.push({
          type: 'code_complexity',
          count: errorCount,
          details: `ESLint发现 ${errorCount} 个问题`
        });
      }

      console.log(`  ⚠️  发现 ${errorCount} 个代码质量问题`);
    }
  }

  async checkTestCoverage() {
    console.log('🧪 检查测试覆盖率...');

    const projects = [
      'portfolio/frontend',
      'portfolio/worker',
      'dashboard/frontend',
      'dashboard/worker'
    ];

    let totalCoverage = 0;
    let projectCount = 0;

    for (const project of projects) {
      const packageJsonPath = path.join(project, 'package.json');

      if (!fs.existsSync(packageJsonPath)) continue;

      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const scripts = packageJson.scripts || {};

        if (scripts['test:coverage']) {
          try {
            const coverageOutput = execSync(`cd ${project} && npm run test:coverage`, {
              encoding: 'utf8',
              stdio: 'pipe'
            });

            // 提取覆盖率百分比
            const coverageMatch = coverageOutput.match(/All files\s+\|\s+([\d.]+)/);
            if (coverageMatch) {
              const coverage = parseFloat(coverageMatch[1]);
              totalCoverage += coverage;
              projectCount++;
              console.log(`  ✅ ${project}: ${coverage}%`);
            }
          } catch (error) {
            console.log(`  ⚠️  ${project}: 无法获取测试覆盖率`);
          }
        } else {
          console.log(`  ⚠️  ${project}: 未配置测试覆盖率脚本`);
        }
      } catch (error) {
        console.log(`  ❌ ${project}: 读取package.json失败`);
      }
    }

    const avgCoverage = projectCount > 0 ? totalCoverage / projectCount : 0;
    this.results.metrics.testCoverage = {
      average: avgCoverage,
      projectCount,
      level: avgCoverage >= 80 ? '优秀' : avgCoverage >= 60 ? '良好' : '需要改进'
    };

    if (avgCoverage < 60) {
      this.results.issues.push({
        type: 'test_coverage',
        count: Math.round(avgCoverage),
        details: `平均测试覆盖率仅 ${avgCoverage.toFixed(1)}%，建议提升到80%以上`
      });
    }
  }

  async checkDependencyHealth() {
    console.log('📦 检查依赖健康度...');

    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
      const auditResult = JSON.parse(auditOutput);

      const vulnerabilities = {
        critical: auditResult.metadata?.vulnerabilities?.critical || 0,
        high: auditResult.metadata?.vulnerabilities?.high || 0,
        moderate: auditResult.metadata?.vulnerabilities?.moderate || 0,
        low: auditResult.metadata?.vulnerabilities?.low || 0
      };

      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

      this.results.metrics.dependencyHealth = {
        vulnerabilities,
        total: totalVulns,
        level: totalVulns === 0 ? '优秀' :
          (vulnerabilities.critical > 0 || vulnerabilities.high > 0) ? '严重' :
            totalVulns < 5 ? '良好' : '需要改进'
      };

      if (totalVulns > 0) {
        this.results.issues.push({
          type: 'dependency_vulnerabilities',
          count: totalVulns,
          details: `发现 ${totalVulns} 个安全漏洞，其中高危 ${vulnerabilities.critical + vulnerabilities.high} 个`
        });
      }

      console.log(`  ✅ 发现 ${totalVulns} 个依赖漏洞`);
    } catch (error) {
      console.log('  ⚠️  无法获取依赖审计信息');
      this.results.metrics.dependencyHealth = {
        level: '未知'
      };
    }
  }

  async checkSecurityVulnerabilities() {
    console.log('🔒 检查安全问题...');

    const securityIssues = [];

    // 检查是否有敏感信息泄露
    const sensitivePatterns = [
      /password\s*=\s*['"][^'"]*['"]/gi,
      /secret\s*=\s*['"][^'"]*['"]/gi,
      /token\s*=\s*['"][^'"]*['"]/gi,
      /api[_-]?key\s*=\s*['"][^'"]*['"]/gi
    ];

    const filesToCheck = [
      '.env*',
      'config/**/*.js',
      'src/**/*.ts',
      'src/**/*.tsx'
    ];

    for (const pattern of filesToCheck) {
      try {
        const files = execSync(`find . -name "${pattern}" -not -path "./node_modules/*"`, {
          encoding: 'utf8'
        }).trim().split('\n').filter(Boolean);

        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');

          for (const sensitivePattern of sensitivePatterns) {
            if (sensitivePattern.test(content) && !file.includes('.example')) {
              securityIssues.push({
                file,
                issue: 'Potential sensitive information exposure'
              });
            }
          }
        }
      } catch (error) {
        // 忽略文件不存在的错误
      }
    }

    this.results.metrics.security = {
      issues: securityIssues.length,
      level: securityIssues.length === 0 ? '优秀' : '需要改进'
    };

    if (securityIssues.length > 0) {
      this.results.issues.push({
        type: 'security',
        count: securityIssues.length,
        details: `发现 ${securityIssues.length} 个潜在安全问题`
      });
    }

    console.log(`  ✅ 发现 ${securityIssues.length} 个安全问题`);
  }

  async checkCodeDuplication() {
    console.log('🔄 检查代码重复...');

    // 简单的重复代码检测（基于相似的函数名和长度）
    const duplicateThreshold = 10; // 相似函数的最小行数
    const duplicates = [];

    const jsFiles = execSync('find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -not -path "./node_modules/*"', {
      encoding: 'utf8'
    }).trim().split('\n').filter(Boolean);

    const functions = [];

    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const functionMatches = content.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>|(\w+)\s*:\s*\([^)]*\)\s*=>)/g);

        if (functionMatches) {
          functionMatches.forEach(match => {
            const funcName = match.match(/\w+/)[0];
            const startIndex = content.indexOf(match);
            const lines = content.substring(startIndex).split('\n');
            let braceCount = 0;
            let endIndex = startIndex;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              braceCount += (line.match(/{/g) || []).length;
              braceCount -= (line.match(/}/g) || []).length;

              if (braceCount === 0 && i > 0) {
                endIndex = startIndex + lines.slice(0, i + 1).join('\n').length;
                break;
              }
            }

            const functionContent = content.substring(startIndex, endIndex);
            const lineCount = functionContent.split('\n').length;

            if (lineCount >= duplicateThreshold) {
              functions.push({
                file,
                name: funcName,
                content: functionContent,
                lines: lineCount,
                hash: this.simpleHash(functionContent.replace(/\s+/g, ' ').trim())
              });
            }
          });
        }
      } catch (error) {
        // 忽略读取错误
      }
    }

    // 检查重复的函数
    const hashGroups = {};
    functions.forEach(func => {
      if (!hashGroups[func.hash]) {
        hashGroups[func.hash] = [];
      }
      hashGroups[func.hash].push(func);
    });

    Object.values(hashGroups).forEach(group => {
      if (group.length > 1) {
        duplicates.push({
          functions: group.map(f => `${f.file}:${f.name}`),
          lines: group[0].lines
        });
      }
    });

    this.results.metrics.codeDuplication = {
      duplicates: duplicates.length,
      duplicatedLines: duplicates.reduce((sum, dup) => sum + dup.lines, 0),
      level: duplicates.length === 0 ? '优秀' :
        duplicates.length < 3 ? '良好' : '需要改进'
    };

    if (duplicates.length > 0) {
      this.results.issues.push({
        type: 'code_duplication',
        count: duplicates.length,
        details: `发现 ${duplicates.length} 处代码重复`
      });
    }

    console.log(`  ✅ 发现 ${duplicates.length} 处代码重复`);
  }

  async checkPerformanceMetrics() {
    console.log('⚡ 检查性能指标...');

    const metrics = {
      bundleSize: { total: 0, level: '良好' },
      buildTime: { duration: 0, level: '良好' },
      dependencies: { count: 0, level: '良好' }
    };

    try {
      // 检查构建后的bundle大小
      const distDirs = ['portfolio/worker/dist', 'dashboard/worker/dist'];

      for (const distDir of distDirs) {
        if (fs.existsSync(distDir)) {
          const files = execSync(`find ${distDir} -name "*.js" -exec du -b {} +`, {
            encoding: 'utf8'
          }).trim().split('\n');

          const totalSize = files.reduce((sum, line) => {
            const size = parseInt(line.split('\t')[0]);
            return sum + size;
          }, 0);

          metrics.bundleSize.total += totalSize;
        }
      }

      // 检查依赖数量
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencyCount = Object.keys(packageJson.dependencies || {}).length +
                             Object.keys(packageJson.devDependencies || {}).length;

      metrics.dependencies.count = dependencyCount;

      // 评估等级
      const sizeInMB = metrics.bundleSize.total / (1024 * 1024);
      metrics.bundleSize.level = sizeInMB < 5 ? '优秀' : sizeInMB < 10 ? '良好' : '需要改进';
      metrics.dependencies.level = dependencyCount < 50 ? '优秀' :
        dependencyCount < 100 ? '良好' : '需要改进';

    } catch (error) {
      console.log('  ⚠️  无法获取性能指标');
    }

    this.results.metrics.performance = metrics;
    console.log(`  ✅ Bundle大小: ${(metrics.bundleSize.total / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`  ✅ 依赖数量: ${metrics.dependencies.count}`);
  }

  async generateQualityScore() {
    console.log('🎯 生成质量评分...');

    const weights = {
      codeComplexity: 0.25,
      testCoverage: 0.20,
      dependencyHealth: 0.20,
      security: 0.15,
      codeDuplication: 0.10,
      performance: 0.10
    };

    const scores = {
      codeComplexity: this.getScore(this.results.metrics.codeComplexity?.errorLevel || '良好'),
      testCoverage: this.getScore(this.results.metrics.testCoverage?.level || '良好'),
      dependencyHealth: this.getScore(this.results.metrics.dependencyHealth?.level || '良好'),
      security: this.getScore(this.results.metrics.security?.level || '良好'),
      codeDuplication: this.getScore(this.results.metrics.codeDuplication?.level || '良好'),
      performance: this.getScore(this.results.metrics.performance?.bundleSize?.level || '良好')
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([metric, weight]) => {
      if (scores[metric] !== undefined) {
        totalScore += scores[metric] * weight;
        totalWeight += weight;
      }
    });

    const finalScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    const grade = this.getGrade(finalScore);

    this.results.summary = {
      score: finalScore,
      grade,
      issuesCount: this.results.issues.length,
      recommendations: this.generateRecommendations()
    };

    console.log(`  ✅ 质量评分: ${finalScore} (${grade})`);
  }

  getScore(level) {
    const scoreMap = {
      '优秀': 100,
      '良好': 80,
      '需要改进': 60,
      '严重': 40,
      '未知': 70
    };
    return scoreMap[level] || 70;
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.metrics.codeComplexity?.errorCount > 0) {
      recommendations.push('修复ESLint报告的代码质量问题');
    }

    if (this.results.metrics.testCoverage?.average < 80) {
      recommendations.push('提高测试覆盖率到80%以上');
    }

    if (this.results.metrics.dependencyHealth?.total > 0) {
      recommendations.push('更新依赖包以修复安全漏洞');
    }

    if (this.results.metrics.security?.issues > 0) {
      recommendations.push('检查并修复安全问题');
    }

    if (this.results.metrics.codeDuplication?.duplicates > 0) {
      recommendations.push('重构重复代码以提高可维护性');
    }

    if ((this.results.metrics.performance?.bundleSize?.total / (1024 * 1024)) > 10) {
      recommendations.push('优化bundle大小，考虑代码分割');
    }

    return recommendations;
  }

  async saveResults() {
    const resultsDir = 'quality-reports';
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${resultsDir}/quality-report-${timestamp}.json`;

    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`📁 报告已保存到: ${filename}`);
  }

  displaySummary() {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 代码质量监控总结');
    console.log('='.repeat(50));
    console.log(`🎯 质量评分: ${this.results.summary.score} (${this.results.summary.grade})`);
    console.log(`🔍 发现问题: ${this.results.summary.issuesCount} 个`);

    if (this.results.summary.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      this.results.summary.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n📈 详细指标:');
    Object.entries(this.results.metrics).forEach(([metric, data]) => {
      const emoji = this.getMetricEmoji(metric);
      const level = data.level || '未知';
      console.log(`  ${emoji} ${metric}: ${level}`);
    });

    if (this.results.issues.length > 0) {
      console.log('\n⚠️  需要关注的问题:');
      this.results.issues.forEach(issue => {
        console.log(`  • ${issue.details}`);
      });
    }
  }

  getMetricEmoji(metric) {
    const emojiMap = {
      codeComplexity: '📊',
      testCoverage: '🧪',
      dependencyHealth: '📦',
      security: '🔒',
      codeDuplication: '🔄',
      performance: '⚡'
    };
    return emojiMap[metric] || '📈';
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

// 主函数
async function main() {
  const monitor = new QualityMonitor();

  try {
    await monitor.runAllChecks();
    process.exit(0);
  } catch (error) {
    console.error('❌ 质量监控失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QualityMonitor;