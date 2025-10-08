// 检查环境变量脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n=== 检查环境变量配置 ===\n');

// 检查 .dev.vars
const devVarsPath = path.join(__dirname, '..', '.dev.vars');
if (fs.existsSync(devVarsPath)) {
  console.log('✓ .dev.vars 文件存在');
  const content = fs.readFileSync(devVarsPath, 'utf-8');
  const hasAdminPassword = content.includes('ADMIN_PASSWORD');
  console.log(`  ${hasAdminPassword ? '✓' : '✗'} ADMIN_PASSWORD 已配置`);
} else {
  console.log('✗ .dev.vars 文件不存在');
}

// 检查 wrangler.toml
const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
if (fs.existsSync(wranglerPath)) {
  console.log('\n✓ wrangler.toml 文件存在');
  const content = fs.readFileSync(wranglerPath, 'utf-8');
  const hasAdminPassword = content.includes('ADMIN_PASSWORD');
  console.log(`  ${hasAdminPassword ? '✓' : '✗'} ADMIN_PASSWORD 已在 [vars] 配置`);
} else {
  console.log('\n✗ wrangler.toml 文件不存在');
}

console.log('\n=== 建议 ===');
console.log('1. 确保已停止当前的 wrangler dev 进程');
console.log('2. 重新运行: npm run dev');
console.log('3. 检查控制台输出的 DEBUG 日志');
console.log('\n密码应该是: admin123\n');
