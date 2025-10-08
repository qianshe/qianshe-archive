# Wrangler 配置说明

## 配置文件说明

本项目使用两套配置文件：

### 1. `wrangler.toml` - 生产环境配置模板
- **用途**：生产环境部署配置
- **版本控制**：✅ 提交到 Git
- **特点**：
  - 包含生产环境资源绑定（KV、D1、R2）
  - 敏感信息使用占位符，需在 Cloudflare Dashboard 配置
  - 用于 `npm run deploy` 部署命令

### 2. `wrangler.local.toml` - 本地开发配置
- **用途**：本地开发环境配置
- **版本控制**：❌ 不提交到 Git（已添加到 .gitignore）
- **特点**：
  - 包含本地开发的实际配置值
  - 使用本地模拟的资源（local-db、local-cache 等）
  - 用于 `npm run dev` 开发命令

## 使用方法

### 本地开发
```bash
cd packages/dashboard-worker
npm run dev
```
自动使用 `wrangler.local.toml` 配置

### 生产部署
```bash
cd packages/dashboard-worker
npm run deploy
```
自动使用 `wrangler.toml` 配置（需要先在 Cloudflare Dashboard 配置敏感变量）

## 首次设置

### 步骤 1：复制本地配置（已完成）
本地配置文件已创建，包含开发环境的默认值。

### 步骤 2：配置生产环境
在 Cloudflare Dashboard 中设置以下环境变量：
- `JWT_SECRET` - JWT 密钥（生产环境使用强密码）
- `ADMIN_PASSWORD` - 管理员密码（生产环境使用强密码）

### 步骤 3：更新资源 ID
在生产部署前，更新 `wrangler.toml` 中的资源 ID：
- D1 数据库 ID
- KV 命名空间 ID
- R2 存储桶名称

## 安全提示

⚠️ **重要**：
- 永远不要将 `wrangler.local.toml` 提交到 Git
- 生产环境的敏感配置应通过 Cloudflare Dashboard 或 CI/CD 环境变量配置
- 定期更新生产环境的密钥和密码
