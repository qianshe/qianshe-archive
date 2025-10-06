#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于创建D1数据库并执行初始迁移
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'qianshe-db';
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

console.log('🚀 开始初始化谦舍数据库...');

// 检查必要文件是否存在
if (!fs.existsSync(SCHEMA_FILE)) {
  console.error('❌ 找不到schema.sql文件');
  process.exit(1);
}

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('❌ 找不到migrations目录');
  process.exit(1);
}

// 创建D1数据库
console.log(`📦 创建D1数据库: ${DB_NAME}`);
try {
  execSync(`npx wrangler d1 create ${DB_NAME}`, { stdio: 'inherit' });
  console.log('✅ D1数据库创建成功');
} catch (error) {
  console.log('ℹ️  D1数据库可能已存在，继续执行...');
}

// 执行schema
console.log('📋 执行数据库schema...');
try {
  execSync(`npx wrangler d1 execute ${DB_NAME} --file=schema.sql`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Schema执行成功');
} catch (error) {
  console.error('❌ Schema执行失败:', error.message);
  process.exit(1);
}

// 执行迁移文件
const migrationFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log(`🔄 找到 ${migrationFiles.length} 个迁移文件`);

for (const file of migrationFiles) {
  console.log(`📝 执行迁移: ${file}`);
  try {
    execSync(`npx wrangler d1 execute ${DB_NAME} --file=migrations/${file}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✅ 迁移 ${file} 执行成功`);
  } catch (error) {
    console.error(`❌ 迁移 ${file} 执行失败:`, error.message);
    process.exit(1);
  }
}

console.log('🎉 数据库初始化完成！');
console.log('');
console.log('接下来的步骤:');
console.log('1. 更新wrangler.toml文件中的database_id');
console.log('2. 运行 npm run deploy:portfolio 部署展示端');
console.log('3. 运行 npm run deploy:dashboard 部署管理端');
console.log('');
console.log('默认管理员账户:');
console.log('邮箱: admin@qianshe.top');
console.log('密码: admin123');
