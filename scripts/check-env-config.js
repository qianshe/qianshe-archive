#!/usr/bin/env node

/**
 * 检查环境变量配置文件的一致性和完整性
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'DATABASE_URL',
  'CLOUDFLARE_API_TOKEN'
];

function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Warning: ${filePath} not found`);
    return true; // 跳过不存在的文件
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const envVars = new Set();

    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const key = line.split('=')[0];
        envVars.add(key);
      }
    });

    const missingVars = REQUIRED_ENV_VARS.filter(varName => !envVars.has(varName));

    if (missingVars.length > 0) {
      console.log(`❌ ${filePath}: Missing required env vars: ${missingVars.join(', ')}`);
      return false;
    }

    // 检查是否有敏感信息
    const sensitivePatterns = [
      /password.*=.*[^$]/i,
      /secret.*=.*[^$]/i,
      /key.*=.*[^$]/i,
      /token.*=.*[^$]/i
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(content) && !filePath.includes('.example')) {
        console.log(`❌ ${filePath}: Contains potentially sensitive information`);
        return false;
      }
    }

    console.log(`✅ ${filePath}: Environment variables check passed`);
    return true;
  } catch (error) {
    console.log(`❌ ${filePath}: Error reading file - ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Checking environment configuration...\n');

  const envFiles = [
    '.env.example',
    '.env.local',
    '.env'
  ];

  let allPassed = true;

  for (const file of envFiles) {
    if (!checkEnvFile(file)) {
      allPassed = false;
    }
  }

  // 检查各个子项目的环境文件
  const PROJECTS = [
    'portfolio/worker',
    'dashboard/worker'
  ];

  for (const project of PROJECTS) {
    const projectEnvFile = path.join(project, '.env.example');
    if (!checkEnvFile(projectEnvFile)) {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n✅ All environment configurations are valid!');
    process.exit(0);
  } else {
    console.log('\n❌ Some environment configurations have issues.');
    console.log('Please fix the issues before committing.');
    process.exit(1);
  }
}

main();