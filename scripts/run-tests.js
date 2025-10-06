#!/usr/bin/env node

/**
 * 运行所有项目的单元测试
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

function runTests(project) {
  const { name, path: projectPath } = project;
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  ${name}: No package.json found, skipping...`);
    return true;
  }

  try {
    console.log(`🧪 ${name}: Running tests...`);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};

    if (!scripts.test) {
      console.log(`⚠️  ${name}: No test script found, skipping...`);
      return true;
    }

    // 运行测试
    execSync('npm test', {
      cwd: projectPath,
      stdio: 'pipe'
    });

    console.log(`✅ ${name}: Tests passed`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Tests failed`);
    console.log(error.stdout ? error.stdout.toString() : error.message);
    return false;
  }
}

function main() {
  console.log('🧪 Running tests for all projects...\n');

  let allPassed = true;

  for (const project of PROJECTS) {
    if (!runTests(project)) {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed.');
    console.log('Please fix the test failures before committing.');
    process.exit(1);
  }
}

main();