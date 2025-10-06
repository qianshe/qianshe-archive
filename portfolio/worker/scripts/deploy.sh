#!/bin/bash

# Portfolio Worker 部署脚本

set -e

echo "🚀 开始部署 Portfolio Worker..."

# 检查是否有 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装，请先安装: npm install -g wrangler"
    exit 1
fi

# 类型检查
echo "📋 进行类型检查..."
npm run type-check

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到 Cloudflare Workers
echo "☁️  部署到 Cloudflare Workers..."
wrangler deploy

echo "✅ 部署完成！"
echo "🌐 API地址: https://portfolio-worker.your-subdomain.workers.dev"
echo "📊 健康检查: https://portfolio-worker.your-subdomain.workers.dev/api/health"