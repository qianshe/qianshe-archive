#!/usr/bin/env node

/**
 * 生成质量趋势数据
 */

const fs = require('fs');
const path = require('path');

function generateQualityTrend() {
  const reportsDir = 'quality-reports';
  const trendData = {
    timestamps: [],
    scores: [],
    grades: [],
    issues: [],
    metrics: {
      codeComplexity: [],
      testCoverage: [],
      dependencyHealth: [],
      security: [],
      codeDuplication: [],
      performance: []
    }
  };

  if (!fs.existsSync(reportsDir)) {
    console.log('📁 质量报告目录不存在，创建新目录...');
    fs.mkdirSync(reportsDir);
    return;
  }

  // 读取所有质量报告
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('quality-report-') && file.endsWith('.json'))
    .sort();

  reportFiles.forEach(file => {
    try {
      const reportPath = path.join(reportsDir, file);
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      // 提取时间戳
      const timestamp = new Date(report.timestamp).toISOString().split('T')[0];
      trendData.timestamps.push(timestamp);

      // 提取总体评分
      if (report.summary) {
        trendData.scores.push(report.summary.score);
        trendData.grades.push(report.summary.grade);
        trendData.issues.push(report.summary.issuesCount);
      }

      // 提取各项指标
      if (report.metrics) {
        Object.keys(trendData.metrics).forEach(metric => {
          const metricData = report.metrics[metric];
          if (metricData) {
            const level = metricData.level || '未知';
            const score = getScoreFromLevel(level);
            trendData.metrics[metric].push(score);
          }
        });
      }
    } catch (error) {
      console.log(`⚠️  读取报告 ${file} 失败:`, error.message);
    }
  });

  // 保存趋势数据
  const trendPath = 'quality-trend.json';
  fs.writeFileSync(trendPath, JSON.stringify(trendData, null, 2));

  // 生成趋势分析
  const analysis = analyzeTrend(trendData);
  fs.writeFileSync('quality-trend-analysis.json', JSON.stringify(analysis, null, 2));

  console.log(`✅ 质量趋势数据已生成，共 ${reportFiles.length} 个数据点`);
  console.log(`📈 当前质量评分: ${trendData.scores.slice(-1)[0] || 'N/A'}`);
  console.log(`📊 趋势: ${analysis.trend || '数据不足'}`);
}

function getScoreFromLevel(level) {
  const scoreMap = {
    '优秀': 100,
    '良好': 80,
    '需要改进': 60,
    '严重': 40,
    '未知': 70
  };
  return scoreMap[level] || 70;
}

function analyzeTrend(trendData) {
  const analysis = {
    trend: 'stable',
    improvement: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 100,
    dataPoints: trendData.timestamps.length,
    recommendations: []
  };

  if (trendData.scores.length < 2) {
    analysis.trend = 'insufficient_data';
    return analysis;
  }

  // 计算基本统计
  const scores = trendData.scores;
  analysis.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  analysis.bestScore = Math.max(...scores);
  analysis.worstScore = Math.min(...scores);

  // 分析趋势
  const recentScores = scores.slice(-5); // 最近5个数据点
  const olderScores = scores.slice(0, Math.max(0, scores.length - 5));

  if (olderScores.length > 0) {
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    analysis.improvement = Math.round(recentAvg - olderAvg);

    if (analysis.improvement > 5) {
      analysis.trend = 'improving';
      analysis.recommendations.push('代码质量持续改善，保持当前的开发实践');
    } else if (analysis.improvement < -5) {
      analysis.trend = 'declining';
      analysis.recommendations.push('代码质量下降，需要关注开发流程和代码审查');
    } else {
      analysis.trend = 'stable';
      analysis.recommendations.push('代码质量稳定，继续监控并寻找改进机会');
    }
  }

  // 分析各项指标趋势
  Object.entries(trendData.metrics).forEach(([metric, values]) => {
    if (values.length >= 2) {
      const recent = values.slice(-3);
      const older = values.slice(0, Math.max(0, values.length - 3));

      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        const change = recentAvg - olderAvg;

        if (change < -10) {
          analysis.recommendations.push(`${metric} 指标下降明显，需要重点改进`);
        }
      }
    }
  });

  return analysis;
}

if (require.main === module) {
  generateQualityTrend();
}

module.exports = { generateQualityTrend, analyzeTrend };