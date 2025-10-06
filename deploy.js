#!/usr/bin/env node

/**
 * 谦舍项目部署脚本
 * 自动化部署Portfolio和Dashboard Workers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const PORTFOLIO_DIR = path.join(PROJECT_ROOT, 'portfolio');
const DASHBOARD_DIR = path.join(PROJECT_ROOT, 'dashboard');

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function stepLog(step, message) {
  colorLog('cyan', `\n[步骤 ${step}] ${message}`);
}

function successLog(message) {
  colorLog('green', `✅ ${message}`);
}

function errorLog(message) {
  colorLog('red', `❌ ${message}`);
}

function warningLog(message) {
  colorLog('yellow', `⚠️  ${message}`);
}

// 检查项目结构
function checkProjectStructure() {
  stepLog(1, '检查项目结构...');

  const requiredDirs = [
    'portfolio/frontend',
    'portfolio/worker',
    'dashboard/frontend',
    'dashboard/worker',
    'database'
  ];

  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(PROJECT_ROOT, dir))) {
      errorLog(`缺少必要目录: ${dir}`);
      process.exit(1);
    }
  }

  successLog('项目结构检查通过');
}

// 安装依赖
function installDependencies() {
  stepLog(2, '安装项目依赖...');

  const projects = [
    { name: 'Portfolio Frontend', dir: 'portfolio/frontend' },
    { name: 'Portfolio Worker', dir: 'portfolio/worker' },
    { name: 'Dashboard Frontend', dir: 'dashboard/frontend' },
    { name: 'Dashboard Worker', dir: 'dashboard/worker' }
  ];

  for (const project of projects) {
    colorLog('blue', `正在安装 ${project.name} 的依赖...`);
    try {
      execSync('npm install', {
        stdio: 'pipe',
        cwd: path.join(PROJECT_ROOT, project.dir)
      });
      successLog(`${project.name} 依赖安装完成`);
    } catch (error) {
      errorLog(`${project.name} 依赖安装失败: ${error.message}`);
      process.exit(1);
    }
  }
}

// 构建前端项目
function buildFrontends() {
  stepLog(3, '构建前端项目...');

  const frontends = [
    { name: 'Portfolio Frontend', dir: 'portfolio/worker', command: 'npm run build:frontend' },
    { name: 'Dashboard Frontend', dir: 'dashboard/worker', command: 'npm run build:frontend' }
  ];

  for (const frontend of frontends) {
    colorLog('blue', `正在构建 ${frontend.name}...`);
    try {
      execSync(frontend.command, {
        stdio: 'pipe',
        cwd: path.join(PROJECT_ROOT, frontend.dir)
      });
      successLog(`${frontend.name} 构建完成`);
    } catch (error) {
      errorLog(`${frontend.name} 构建失败: ${error.message}`);
      process.exit(1);
    }
  }
}

// 初始化数据库
function initDatabase() {
  stepLog(4, '初始化数据库...');

  try {
    execSync('node init-db.js', {
      stdio: 'inherit',
      cwd: path.join(PROJECT_ROOT, 'database')
    });
    successLog('数据库初始化完成');
  } catch (error) {
    warningLog('数据库初始化失败，请手动执行: cd database && node init-db.js');
  }
}

// 部署Workers
function deployWorkers() {
  stepLog(5, '部署Workers...');

  const workers = [
    { name: 'Portfolio Worker', dir: 'portfolio/worker' },
    { name: 'Dashboard Worker', dir: 'dashboard/worker' }
  ];

  for (const worker of workers) {
    colorLog('blue', `正在部署 ${worker.name}...`);
    try {
      execSync('npx wrangler deploy', {
        stdio: 'inherit',
        cwd: path.join(PROJECT_ROOT, worker.dir)
      });
      successLog(`${worker.name} 部署完成`);
    } catch (error) {
      errorLog(`${worker.name} 部署失败: ${error.message}`);
      process.exit(1);
    }
  }
}

// 验证部署
function verifyDeployment() {
  stepLog(6, '验证部署...');

  colorLog('yellow', '请手动验证以下URL是否正常访问:');
  colorLog('cyan', '- Portfolio: https://qianshe.top');
  colorLog('cyan', '- Dashboard: https://dashboard.qianshe.top');
  colorLog('cyan', '- API测试: https://qianshe.top/api/health');

  console.log('');
  colorLog('magenta', '默认管理员账户信息:');
  colorLog('yellow', '邮箱: admin@qianshe.top');
  colorLog('yellow', '密码: admin123');
  console.log('');

  successLog('部署完成！🎉');
}

// 主函数
function main() {
  colorLog('magenta', '🚀 开始部署谦舍项目...');
  console.log('');

  try {
    checkProjectStructure();
    installDependencies();
    buildFrontends();
    initDatabase();
    deployWorkers();
    verifyDeployment();
  } catch (error) {
    errorLog(`部署失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
谦舍项目部署脚本

用法: node deploy.js [选项]

选项:
  --help, -h     显示帮助信息
  --skip-deps    跳过依赖安装
  --skip-build   跳过前端构建
  --skip-db      跳过数据库初始化
  --portfolio    仅部署Portfolio Worker
  --dashboard    仅部署Dashboard Worker

示例:
  node deploy.js                    # 完整部署
  node deploy.js --skip-deps        # 跳过依赖安装
  node deploy.js --portfolio        # 仅部署Portfolio
  node deploy.js --dashboard        # 仅部署Dashboard
  `);
  process.exit(0);
}

// 根据参数调整部署流程
if (args.includes('--portfolio')) {
  stepLog(1, '仅部署Portfolio Worker...');
  execSync('npx wrangler deploy', {
    stdio: 'inherit',
    cwd: path.join(PROJECT_ROOT, 'portfolio/worker')
  });
  successLog('Portfolio Worker部署完成');
  process.exit(0);
}

if (args.includes('--dashboard')) {
  stepLog(1, '仅部署Dashboard Worker...');
  execSync('npx wrangler deploy', {
    stdio: 'inherit',
    cwd: path.join(PROJECT_ROOT, 'dashboard/worker')
  });
  successLog('Dashboard Worker部署完成');
  process.exit(0);
}

// 执行完整部署流程
main();
