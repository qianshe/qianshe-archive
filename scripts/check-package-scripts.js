#!/usr/bin/env node

/**
 * 检查各个子项目的package.json scripts一致性
 * 确保所有项目都有统一的标准脚本
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_SCRIPTS = [
  'dev',
  'build',
  'type-check',
  'lint',
  'lint:fix',
  'test',
  'test:coverage'
];

const PROJECTS = [
  'portfolio/frontend',
  'portfolio/worker',
  'dashboard/frontend',
  'dashboard/worker',
  'shared/types'
];

function checkProjectScripts(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Warning: package.json not found in ${projectPath}`);
    return true; // 如果没有package.json，跳过检查
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    const missingScripts = REQUIRED_SCRIPTS.filter(script => !scripts[script]);

    if (missingScripts.length > 0) {
      console.log(`❌ ${projectPath}: Missing required scripts: ${missingScripts.join(', ')}`);
      return false;
    }

    console.log(`✅ ${projectPath}: All required scripts present`);
    return true;
  } catch (error) {
    console.log(`❌ ${projectPath}: Error parsing package.json - ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 Checking package.json scripts consistency...\n');

  let allPassed = true;

  for (const project of PROJECTS) {
    if (!checkProjectScripts(project)) {
      allPassed = false;
    }
  }

  // 检查根目录的package.json
  if (fs.existsSync('package.json')) {
    console.log('\n🔍 Checking root package.json...');
    const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const rootScripts = rootPackageJson.scripts || {};

    const requiredRootScripts = [
      'lint',
      'lint:fix',
      'format',
      'format:check',
      'lint:all'
    ];

    const missingRootScripts = requiredRootScripts.filter(script => !rootScripts[script]);

    if (missingRootScripts.length > 0) {
      console.log(`❌ Root: Missing required scripts: ${missingRootScripts.join(', ')}`);
      allPassed = false;
    } else {
      console.log('✅ Root: All required scripts present');
    }
  }

  if (allPassed) {
    console.log('\n✅ All package.json scripts are consistent!');
    process.exit(0);
  } else {
    console.log('\n❌ Some package.json scripts are missing or inconsistent.');
    console.log('Please add the missing scripts to ensure consistency across projects.');
    process.exit(1);
  }
}

main();