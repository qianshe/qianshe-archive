#!/usr/bin/env node

/**
 * Monorepo 部署脚本示例
 * 用于部署到 Cloudflare Workers
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const PROJECTS = {
  portfolio: {
    name: 'portfolio-worker',
    path: 'packages/portfolio-worker',
    env: 'production'
  },
  dashboard: {
    name: 'dashboard-worker',
    path: 'packages/dashboard-worker',
    env: 'production'
  }
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function exec(command, cwd) {
  try {
    log(`执行: ${command}`, 'info');
    execSync(command, {
      cwd,
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    log(`命令执行失败: ${error.message}`, 'error');
    return false;
  }
}

async function buildProject(project) {
  log(`\n📦 构建 ${project.name}...`, 'info');
  
  const projectPath = path.resolve(process.cwd(), project.path);
  
  if (!existsSync(projectPath)) {
    log(`项目路径不存在: ${projectPath}`, 'error');
    return false;
  }
  
  // 1. 安装依赖（如果需要）
  if (!existsSync(path.join(projectPath, 'node_modules'))) {
    log('安装依赖...', 'info');
    if (!exec('npm install', projectPath)) return false;
  }
  
  // 2. 构建项目
  if (!exec('npm run build', projectPath)) return false;
  
  log(`✅ ${project.name} 构建完成`, 'success');
  return true;
}

async function deployProject(project) {
  log(`\n🚀 部署 ${project.name} 到 Cloudflare...`, 'info');
  
  const projectPath = path.resolve(process.cwd(), project.path);
  
  // 使用 wrangler 部署
  const deployCmd = `npx wrangler deploy --env ${project.env}`;
  
  if (!exec(deployCmd, projectPath)) {
    log(`❌ ${project.name} 部署失败`, 'error');
    return false;
  }
  
  log(`✅ ${project.name} 部署成功`, 'success');
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];
  
  let projectsToDeploy = [];
  
  if (projectName && PROJECTS[projectName]) {
    // 部署单个项目
    projectsToDeploy = [PROJECTS[projectName]];
  } else if (projectName === 'all' || !projectName) {
    // 部署所有项目
    projectsToDeploy = Object.values(PROJECTS);
  } else {
    log('用法: node deploy-monorepo-example.js [portfolio|dashboard|all]', 'warn');
    process.exit(1);
  }
  
  log(`\n🎯 准备部署 ${projectsToDeploy.length} 个项目`, 'info');
  
  for (const project of projectsToDeploy) {
    log(`\n${'='.repeat(50)}`, 'info');
    log(`开始处理: ${project.name}`, 'info');
    log(`${'='.repeat(50)}`, 'info');
    
    // 构建
    const buildSuccess = await buildProject(project);
    if (!buildSuccess) {
      log(`\n❌ ${project.name} 构建失败，跳过部署`, 'error');
      continue;
    }
    
    // 部署
    const deploySuccess = await deployProject(project);
    if (!deploySuccess) {
      log(`\n❌ ${project.name} 部署失败`, 'error');
      continue;
    }
  }
  
  log('\n✨ 部署流程完成！', 'success');
}

main().catch(error => {
  log(`\n❌ 部署失败: ${error.message}`, 'error');
  process.exit(1);
});
