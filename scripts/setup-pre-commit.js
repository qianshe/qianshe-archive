#!/usr/bin/env node

/**
 * 安装和配置pre-commit hooks
 */

const { execSync } = require('child_process');
const fs = require('fs');

function checkPython() {
  try {
    execSync('python --version', { stdio: 'pipe' });
    return true;
  } catch {
    try {
      execSync('python3 --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

function checkPip() {
  try {
    execSync('pip --version', { stdio: 'pipe' });
    return true;
  } catch {
    try {
      execSync('pip3 --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }
}

function main() {
  console.log('🔧 Setting up pre-commit hooks...\n');

  // 检查Python环境
  if (!checkPython()) {
    console.log('❌ Python is not installed. Please install Python first.');
    process.exit(1);
  }

  if (!checkPip()) {
    console.log('❌ pip is not installed. Please install pip first.');
    process.exit(1);
  }

  try {
    // 安装pre-commit
    console.log('📦 Installing pre-commit...');
    execSync('pip install pre-commit', { stdio: 'inherit' });

    // 安装pre-commit hooks
    console.log('🔧 Installing pre-commit hooks...');
    execSync('pre-commit install', { stdio: 'inherit' });

    // 创建secrets baseline
    console.log('🔐 Setting up secrets detection baseline...');
    try {
      execSync('detect-secrets scan --baseline .secrets.baseline', { stdio: 'pipe' });
      console.log('✅ Secrets baseline created');
    } catch (error) {
      // 如果没有找到secrets，创建空的baseline
      fs.writeFileSync('.secrets.baseline', JSON.stringify({
        version: '0.4.0',
        generated_at: new Date().toISOString(),
        results: [],
        used_exclude: []
      }, null, 2));
      console.log('✅ Empty secrets baseline created');
    }

    // 安装node依赖（如果需要glob等）
    try {
      execSync('npm list -g glob', { stdio: 'pipe' });
    } catch {
      console.log('📦 Installing global dependencies...');
      execSync('npm install -g glob', { stdio: 'inherit' });
    }

    console.log('\n✅ Pre-commit hooks setup completed!');
    console.log('\nNext steps:');
    console.log('1. Make sure all your scripts in /scripts directory are executable');
    console.log('2. Run "npm run pre-commit" to test the setup');
    console.log('3. The hooks will now run automatically before each commit');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();