#!/usr/bin/env node

/**
 * 检查所有项目是否能够成功构建
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECTS = [
  { name: 'portfolio/frontend', path: 'portfolio/frontend' },
  { name: 'portfolio/worker', path: 'portfolio/worker' },
  { name: 'dashboard/frontend', path: 'dashboard/frontend' },
  { name: 'dashboard/worker', path: 'dashboard/worker' }
];

function runBuildCheck(project) {
  const { name, path: projectPath } = project;
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  ${name}: No package.json found, skipping...`);
    return true;
  }

  try {
    console.log(`🔨 ${name}: Running build check...`);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};

    if (!scripts.build) {
      console.log(`⚠️  ${name}: No build script found, skipping...`);
      return true;
    }

    // 运行构建检查
    execSync('npm run build', {
      cwd: projectPath,
      stdio: 'pipe'
    });

    console.log(`✅ ${name}: Build check passed`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Build check failed`);
    console.log(error.stdout ? error.stdout.toString() : error.message);
    return false;
  }
}

function main() {
  console.log('🔨 Running build checks for all projects...\n');

  let allPassed = true;

  for (const project of PROJECTS) {
    if (!runBuildCheck(project)) {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n✅ All build checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some build checks failed.');
    console.log('Please fix the build errors before committing.');
    process.exit(1);
  }
}

main();