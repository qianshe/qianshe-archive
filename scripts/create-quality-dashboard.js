#!/usr/bin/env node

/**
 * 创建质量监控仪表板
 */

const fs = require('fs');
const path = require('path');

function createQualityDashboard() {
  const dashboardData = {
    current: null,
    trend: null,
    lastUpdated: new Date().toISOString()
  };

  // 读取最新的质量报告
  try {
    const reportsDir = 'quality-reports';
    if (fs.existsSync(reportsDir)) {
      const reportFiles = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('quality-report-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (reportFiles.length > 0) {
        const latestReport = JSON.parse(
          fs.readFileSync(path.join(reportsDir, reportFiles[0]), 'utf8')
        );
        dashboardData.current = latestReport;
      }
    }
  } catch (error) {
    console.log('⚠️  无法读取质量报告:', error.message);
  }

  // 读取趋势数据
  try {
    if (fs.existsSync('quality-trend.json')) {
      dashboardData.trend = JSON.parse(fs.readFileSync('quality-trend.json', 'utf8'));
    }
  } catch (error) {
    console.log('⚠️  无法读取趋势数据:', error.message);
  }

  // 生成HTML仪表板
  const html = generateDashboardHTML(dashboardData);
  fs.writeFileSync('quality-dashboard.html', html);

  console.log('✅ 质量监控仪表板已生成: quality-dashboard.html');
}

function generateDashboardHTML(data) {
  const current = data.current;
  const trend = data.trend;

  const timestamp = new Date(data.lastUpdated).toLocaleString('zh-CN');

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码质量监控仪表板</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header .timestamp {
            color: #666;
            font-size: 0.9em;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .metric-title {
            font-size: 1.1em;
            font-weight: 600;
            color: #333;
        }

        .metric-icon {
            font-size: 1.5em;
        }

        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .metric-level {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
        }

        .level-excellent { background: #d4edda; color: #155724; }
        .level-good { background: #cce5ff; color: #004085; }
        .level-warning { background: #fff3cd; color: #856404; }
        .level-critical { background: #f8d7da; color: #721c24; }

        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            margin-bottom: 30px;
        }

        .chart-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        .issues-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        .issues-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        .issue-item {
            background: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
        }

        .issue-type {
            font-weight: 600;
            color: #dc3545;
            margin-bottom: 5px;
        }

        .issue-details {
            color: #666;
            font-size: 0.9em;
        }

        .recommendations-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            margin-top: 30px;
        }

        .recommendations-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        .recommendation-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .recommendation-icon {
            color: #28a745;
            margin-right: 10px;
            margin-top: 3px;
        }

        .recommendation-text {
            color: #333;
            line-height: 1.5;
        }

        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 40px;
        }

        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 2em;
            }

            .metric-value {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ 代码质量监控仪表板</h1>
            <div class="timestamp">最后更新: ${timestamp}</div>
        </div>

        ${current ? generateMetricsSection(current) : '<div class="no-data">暂无质量监控数据</div>'}

        ${trend && trend.timestamps.length > 0 ? generateChartsSection(trend) : ''}

        ${current && current.issues && current.issues.length > 0 ? generateIssuesSection(current.issues) : ''}

        ${current && current.summary && current.summary.recommendations ? generateRecommendationsSection(current.summary.recommendations) : ''}
    </div>

    ${trend && trend.timestamps.length > 0 ? generateChartScripts(trend) : ''}
</body>
</html>
  `;
}

function generateMetricsSection(data) {
  const score = data.summary?.score || 0;
  const grade = data.summary?.grade || 'N/A';
  const issuesCount = data.summary?.issuesCount || 0;

  return `
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-header">
                <div class="metric-title">🎯 质量评分</div>
                <div class="metric-icon">📊</div>
            </div>
            <div class="metric-value" style="color: ${getScoreColor(score)}">${score}</div>
            <span class="metric-level level-${getGradeLevel(grade)}">${grade}</span>
        </div>

        <div class="metric-card">
            <div class="metric-header">
                <div class="metric-title">🔍 发现问题</div>
                <div class="metric-icon">⚠️</div>
            </div>
            <div class="metric-value" style="color: ${issuesCount > 0 ? '#dc3545' : '#28a745'}">${issuesCount}</div>
            <span class="metric-level level-${issuesCount > 0 ? 'warning' : 'excellent'}">
                ${issuesCount > 0 ? '需要关注' : '状态良好'}
            </span>
        </div>

        ${generateMetricCard('代码复杂度', '📊', data.metrics.codeComplexity)}
        ${generateMetricCard('测试覆盖率', '🧪', data.metrics.testCoverage)}
        ${generateMetricCard('依赖健康度', '📦', data.metrics.dependencyHealth)}
        ${generateMetricCard('安全性', '🔒', data.metrics.security)}
        ${generateMetricCard('代码重复', '🔄', data.metrics.codeDuplication)}
        ${generateMetricCard('性能', '⚡', data.metrics.performance?.bundleSize)}
    </div>
  `;
}

function generateMetricCard(title, icon, data) {
  if (!data) return '';

  let value = 'N/A';
  let level = 'unknown';

  if (title === '测试覆盖率' && data.average !== undefined) {
    value = `${Math.round(data.average)}%`;
  } else if (title === '代码复杂度' && data.errorCount !== undefined) {
    value = data.errorCount.toString();
  } else if (title === '依赖健康度' && data.total !== undefined) {
    value = data.total.toString();
  } else if (title === '安全性' && data.issues !== undefined) {
    value = data.issues.toString();
  } else if (title === '代码重复' && data.duplicates !== undefined) {
    value = data.duplicates.toString();
  } else if (title === '性能' && data.total !== undefined) {
    value = `${(data.total / (1024 * 1024)).toFixed(2)}MB`;
  }

  level = data.level || 'unknown';

  return `
    <div class="metric-card">
        <div class="metric-header">
            <div class="metric-title">${icon} ${title}</div>
        </div>
        <div class="metric-value" style="color: ${getLevelColor(level)}">${value}</div>
        <span class="metric-level level-${getLevelClass(level)}">${level}</span>
    </div>
  `;
}

function generateChartsSection(trendData) {
  return `
    <div class="chart-container">
        <div class="chart-title">📈 质量趋势</div>
        <canvas id="qualityTrendChart" width="400" height="150"></canvas>
    </div>

    <div class="chart-container">
        <div class="chart-title">📊 各项指标趋势</div>
        <canvas id="metricsTrendChart" width="400" height="200"></canvas>
    </div>
  `;
}

function generateIssuesSection(issues) {
  return `
    <div class="issues-section">
        <div class="issues-title">⚠️ 需要关注的问题</div>
        ${issues.map(issue => `
            <div class="issue-item">
                <div class="issue-type">${issue.type.replace(/_/g, ' ').toUpperCase()}</div>
                <div class="issue-details">${issue.details}</div>
            </div>
        `).join('')}
    </div>
  `;
}

function generateRecommendationsSection(recommendations) {
  return `
    <div class="recommendations-section">
        <div class="recommendations-title">💡 改进建议</div>
        ${recommendations.map((rec, index) => `
            <div class="recommendation-item">
                <div class="recommendation-icon">✅</div>
                <div class="recommendation-text">${rec}</div>
            </div>
        `).join('')}
    </div>
  `;
}

function generateChartScripts(trendData) {
  return `
    <script>
        // 质量评分趋势图
        const ctx1 = document.getElementById('qualityTrendChart').getContext('2d');
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendData.timestamps)},
                datasets: [{
                    label: '质量评分',
                    data: ${JSON.stringify(trendData.scores)},
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // 各项指标趋势图
        const ctx2 = document.getElementById('metricsTrendChart').getContext('2d');
        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trendData.timestamps)},
                datasets: [
                    {
                        label: '代码复杂度',
                        data: ${JSON.stringify(trendData.metrics.codeComplexity)},
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    },
                    {
                        label: '测试覆盖率',
                        data: ${JSON.stringify(trendData.metrics.testCoverage)},
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    },
                    {
                        label: '依赖健康度',
                        data: ${JSON.stringify(trendData.metrics.dependencyHealth)},
                        borderColor: 'rgb(255, 206, 86)',
                        tension: 0.1
                    },
                    {
                        label: '安全性',
                        data: ${JSON.stringify(trendData.metrics.security)},
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // 自动刷新（每5分钟）
        setTimeout(() => {
            location.reload();
        }, 300000);
    </script>
  `;
}

function getScoreColor(score) {
  if (score >= 90) return '#28a745';
  if (score >= 80) return '#17a2b8';
  if (score >= 70) return '#ffc107';
  if (score >= 60) return '#fd7e14';
  return '#dc3545';
}

function getGradeLevel(grade) {
  if (['A+', 'A'].includes(grade)) return 'excellent';
  if (['B'].includes(grade)) return 'good';
  if (['C', 'D'].includes(grade)) return 'warning';
  return 'critical';
}

function getLevelColor(level) {
  const colorMap = {
    '优秀': '#28a745',
    '良好': '#17a2b8',
    '需要改进': '#ffc107',
    '严重': '#dc3545',
    '未知': '#6c757d'
  };
  return colorMap[level] || '#6c757d';
}

function getLevelClass(level) {
  const classMap = {
    '优秀': 'excellent',
    '良好': 'good',
    '需要改进': 'warning',
    '严重': 'critical',
    '未知': 'warning'
  };
  return classMap[level] || 'warning';
}

if (require.main === module) {
  createQualityDashboard();
}

module.exports = { createQualityDashboard };