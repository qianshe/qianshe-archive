#!/usr/bin/env node

/**
 * 对所有项目进行TypeScript类型检查
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECTS = [
  { name: 'portfolio/frontend', path: 'portfolio/frontend' },
  { name: 'portfolio/worker', path: 'portfolio/worker' },
  { name: 'dashboard/frontend', path: 'dashboard/frontend' },
  { name: 'dashboard/worker', path: 'dashboard/worker' },
  { name: 'shared/types', path: 'shared/types' }
];

function runTypeCheck(project) {
  const { name, path: projectPath } = project;
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  ${name}: No package.json found, skipping...`);
    return true;
  }

  try {
    console.log(`🔍 ${name}: Running type check...`);

    // 检查是否有tsconfig.json
    const tsConfigPath = path.join(projectPath, 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      console.log(`⚠️  ${name}: No tsconfig.json found, skipping type check...`);
      return true;
    }

    // 运行类型检查
    execSync('npx tsc --noEmit', {
      cwd: projectPath,
      stdio: 'pipe'
    });

    console.log(`✅ ${name}: Type check passed`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Type check failed`);
    console.log(error.stdout ? error.stdout.toString() : error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Running TypeScript type checks for all projects...\n');

  let allPassed = true;

  for (const project of PROJECTS) {
    if (!runTypeCheck(project)) {
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n✅ All TypeScript type checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some TypeScript type checks failed.');
    console.log('Please fix the type errors before committing.');
    process.exit(1);
  }
}

main();