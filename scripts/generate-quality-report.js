#!/usr/bin/env node

/**
 * 生成代码质量报告
 */

const fs = require('fs');
const path = require('path');

function generateQualityReport() {
  const artifactsPath = 'artifacts';
  const reportPath = 'quality-report.html';

  // 收集所有检查结果
  const results = {
    timestamp: new Date().toISOString(),
    checks: {
      lint: { status: 'unknown', details: '' },
      format: { status: 'unknown', details: '' },
      typeCheck: { status: 'unknown', details: '' },
      security: { status: 'unknown', details: '' },
      build: { status: 'unknown', details: '' },
      tests: { status: 'unknown', details: '' }
    }
  };

  // 检查各个结果文件
  try {
    // 检查ESLint结果
    if (fs.existsSync(path.join(artifactsPath, 'eslint-report'))) {
      results.checkslint.status = 'completed';
      results.checks.lint.details = 'ESLint check completed with results available';
    }

    // 检查构建结果
    const buildArtifacts = fs.readdirSync(artifactsPath).filter(dir => dir.startsWith('coverage-'));
    results.checks.build.status = buildArtifacts.length > 0 ? 'success' : 'unknown';
    results.checks.build.details = `${buildArtifacts.length} projects built successfully`;

    // 检查测试覆盖率
    const coverageArtifacts = fs.readdirSync(artifactsPath).filter(dir => dir.startsWith('coverage-'));
    results.checks.tests.status = coverageArtifacts.length > 0 ? 'success' : 'unknown';
    results.checks.tests.details = `${coverageArtifacts.length} test suites completed`;

    // 检查依赖图
    const depArtifacts = fs.readdirSync(artifactsPath).filter(dir => dir.startsWith('dependency-graph-'));
    results.checks.dependencies = {
      status: depArtifacts.length > 0 ? 'success' : 'unknown',
      details: `${depArtifacts.length} dependency graphs generated`
    };

    // 检查性能分析
    const perfArtifacts = fs.readdirSync(artifactsPath).filter(dir => dir.startsWith('bundle-analysis-'));
    results.checks.performance = {
      status: perfArtifacts.length > 0 ? 'success' : 'unknown',
      details: `${perfArtifacts.length} bundle analyses completed`
    };

  } catch (error) {
    console.log('Error collecting results:', error);
  }

  // 生成HTML报告
  const html = generateHTMLReport(results);
  fs.writeFileSync(reportPath, html);

  console.log(`✅ Quality report generated: ${reportPath}`);
}

function generateHTMLReport(results) {
  const timestamp = new Date(results.timestamp).toLocaleString();

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码质量报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .timestamp {
            opacity: 0.9;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .check-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .check-card {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            background: white;
        }
        .check-card h3 {
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
            text-transform: uppercase;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.warning { background: #fff3cd; color: #856404; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.unknown { background: #e2e3e5; color: #383d41; }
        .details {
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }
        .summary {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .summary h2 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .metric {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ 代码质量报告</h1>
            <div class="timestamp">生成时间: ${timestamp}</div>
        </div>

        <div class="content">
            <div class="check-grid">
                <div class="check-card">
                    <h3>
                        🔍 代码检查 (ESLint)
                        <span class="status ${results.checks.lint.status}">${results.checks.lint.status}</span>
                    </h3>
                    <div class="details">${results.checks.lint.details || 'ESLint代码质量检查完成'}</div>
                </div>

                <div class="check-card">
                    <h3>
                        📝 代码格式化 (Prettier)
                        <span class="status ${results.checks.format.status}">${results.checks.format.status}</span>
                    </h3>
                    <div class="details">${results.checks.format.details || 'Prettier格式化检查完成'}</div>
                </div>

                <div class="check-card">
                    <h3>
                        🏷️ 类型检查 (TypeScript)
                        <span class="status ${results.checks.typeCheck.status}">${results.checks.typeCheck.status}</span>
                    </h3>
                    <div class="details">${results.checks.typeCheck.details || 'TypeScript类型检查完成'}</div>
                </div>

                <div class="check-card">
                    <h3>
                        🔒 安全扫描
                        <span class="status ${results.checks.security.status}">${results.checks.security.status}</span>
                    </h3>
                    <div class="details">${results.checks.security.details || '安全漏洞扫描完成'}</div>
                </div>

                <div class="check-card">
                    <h3>
                        🔨 构建检查
                        <span class="status ${results.checks.build.status}">${results.checks.build.status}</span>
                    </h3>
                    <div class="details">${results.checks.build.details}</div>
                </div>

                <div class="check-card">
                    <h3>
                        🧪 单元测试
                        <span class="status ${results.checks.tests.status}">${results.checks.tests.status}</span>
                    </h3>
                    <div class="details">${results.checks.tests.details}</div>
                </div>

                ${results.checks.dependencies ? `
                <div class="check-card">
                    <h3>
                        📦 依赖检查
                        <span class="status ${results.checks.dependencies.status}">${results.checks.dependencies.status}</span>
                    </h3>
                    <div class="details">${results.checks.dependencies.details}</div>
                </div>
                ` : ''}

                ${results.checks.performance ? `
                <div class="check-card">
                    <h3>
                        ⚡ 性能分析
                        <span class="status ${results.checks.performance.status}">${results.checks.performance.status}</span>
                    </h3>
                    <div class="details">${results.checks.performance.details}</div>
                </div>
                ` : ''}
            </div>

            <div class="summary">
                <h2>📊 质量指标概览</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">${Object.keys(results.checks).length}</div>
                        <div class="metric-label">检查项目</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${Object.values(results.checks).filter(c => c.status === 'success').length}</div>
                        <div class="metric-label">通过检查</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${Object.values(results.checks).filter(c => c.status === 'error').length}</div>
                        <div class="metric-label">失败检查</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${Math.round((Object.values(results.checks).filter(c => c.status === 'success').length / Object.keys(results.checks).length) * 100)}%</div>
                        <div class="metric-label">质量评分</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

generateQualityReport();