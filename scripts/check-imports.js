#!/usr/bin/env node

/**
 * 检查导入路径的一致性
 * 确保使用相对路径或绝对路径的一致性
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 检查的文件扩展名
const FILE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];

function checkFileImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let hasIssues = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // 检查import语句
      const importMatch = line.match(/import.*from\s+['"](.+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];

        // 检查是否有不规范的相对路径
        if (importPath.startsWith('../..')) {
          console.log(`⚠️  ${filePath}:${lineNum}: Deep relative path detected: ${importPath}`);
          hasIssues = true;
        }

        // 检查是否有绝对路径但没有@前缀
        if (importPath.startsWith('/') && !importPath.startsWith('@/')) {
          console.log(`⚠️  ${filePath}:${lineNum}: Absolute path without @ prefix: ${importPath}`);
          hasIssues = true;
        }
      }

      // 检查require语句
      const requireMatch = line.match(/require\s*\(\s*['"](.+)['"]\s*\)/);
      if (requireMatch) {
        const requirePath = requireMatch[1];

        if (requirePath.startsWith('../..')) {
          console.log(`⚠️  ${filePath}:${lineNum}: Deep relative path in require: ${requirePath}`);
          hasIssues = true;
        }
      }
    });

    return !hasIssues;
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

function findFiles(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, { ignore: '**/node_modules/**' }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

async function main() {
  console.log('🔍 Checking import path consistency...\n');

  let allPassed = true;

  for (const ext of FILE_EXTENSIONS) {
    const pattern = `**/*.${ext}`;
    const files = await findFiles(pattern);

    for (const file of files) {
      if (!checkFileImports(file)) {
        allPassed = false;
      }
    }
  }

  // 检查特定项目的导入一致性
  const SHARED_IMPORT_PATTERNS = [
    {
      pattern: /from\s+['"]\.\.\/\.\.\/shared\//,
      message: 'Use @shared/ alias instead of relative path to shared modules'
    }
  ];

  const projectFiles = await findFiles('portfolio/**/*.ts');
  for (const file of projectFiles) {
    const content = fs.readFileSync(file, 'utf8');

    for (const { pattern, message } of SHARED_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        console.log(`⚠️  ${file}: ${message}`);
        allPassed = false;
      }
    }
  }

  if (allPassed) {
    console.log('\n✅ All import paths are consistent!');
    process.exit(0);
  } else {
    console.log('\n❌ Some import paths have issues.');
    console.log('Please fix the import paths before committing.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error during import check:', error);
  process.exit(1);
});