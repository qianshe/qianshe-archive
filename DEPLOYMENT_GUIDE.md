# 谦舍 (QianShe) 部署指南

## 前置要求

### 账户准备

- **Cloudflare 账户** - 用于部署 Workers 和 D1 数据库
- **域名** - 已添加到 Cloudflare 的域名（如 `qianshe.top`）
- **GitHub 账户** - 用于代码托管和 CI/CD（可选）

### 工具安装

```bash
# 安装 Node.js (v18+)
nvm install 18
nvm use 18

# 安装 Wrangler CLI
npm install -g wrangler

# 验证安装
node --version
npm --version
wrangler --version
```

## 环境配置

### 1. 克隆项目

```bash
git clone <repository-url>
cd qiansheArchive
```

### 2. 安装依赖

```bash
# 安装所有项目依赖
npm run install:all

# 分别安装子项目依赖
cd portfolio/frontend && npm install
cd ../dashboard/frontend && npm install
```

### 3. 环境变量配置

#### Portfolio Worker 环境变量

创建 `portfolio/worker/.env`:

```env
# 环境标识
ENVIRONMENT=production

# 数据库绑定
D1_DATABASE_NAME=qianshe-db
SHARED_DB=qianshe-db

# KV 存储绑定
CACHE_KV=qianshe-cache

# 域名配置
PORTFOLIO_DOMAIN=portfolio.qianshe.top
DASHBOARD_DOMAIN=dashboard.qianshe.top
```

#### Dashboard Worker 环境变量

创建 `dashboard/worker/.env`:

```env
# 环境标识
ENVIRONMENT=production

# 数据库绑定
D1_DATABASE_NAME=qianshe-db
SHARED_DB=qianshe-db

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# 管理员账户
ADMIN_EMAIL=admin@qianshe.top
ADMIN_PASSWORD=your-admin-password

# 域名配置
PORTFOLIO_DOMAIN=portfolio.qianshe.top
DASHBOARD_DOMAIN=dashboard.qianshe.top
```

#### 前端环境变量

创建 `portfolio/.env.production`:

```env
VITE_API_BASE_URL=https://portfolio.qianshe.top/api
VITE_APP_TITLE=谦舍 - 个人博客与作品集
VITE_APP_DESCRIPTION=个人技术博客、项目作品展示与想法记录
```

创建 `dashboard/.env.production`:

```env
VITE_API_BASE_URL=https://dashboard.qianshe.top/api
VITE_APP_TITLE=谦舍管理控制台
VITE_PORTFOLIO_URL=https://portfolio.qianshe.top
```

## 数据库设置

### 1. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create qianshe-db

# 记录返回的 database_id，后续配置需要
```

### 2. 执行数据库迁移

```bash
# Portfolio Worker 数据库迁移
cd portfolio/worker
wrangler d1 migrations apply qianshe-db --remote

# Dashboard Worker 数据库迁移（如果有的话）
cd ../../dashboard/worker
wrangler d1 migrations apply qianshe-db --remote
```

### 3. 创建管理员用户

```bash
# 使用 Dashboard Worker 的脚本创建管理员
cd dashboard/worker
wrangler d1 execute qianshe-db --command "
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('admin', 'admin@qianshe.top', '\$2b\$10\$...', '管理员', 'admin', datetime('now'), datetime('now'))
"
```

## KV 存储设置

### 1. 创建 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create "qianshe-cache"
wrangler kv:namespace create "qianshe-cache" --preview
```

### 2. 记录 KV 绑定信息

更新 `portfolio/worker/wrangler.toml` 和 `dashboard/worker/wrangler.toml` 中的 KV 绑定配置。

## Worker 配置

### Portfolio Worker 配置

更新 `portfolio/worker/wrangler.toml`:

```toml
name = "portfolio-qianshe"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-db"
database_id = "your-database-id-here"

[[kv_namespaces]]
binding = "CACHE_KV"
id = "your-kv-namespace-id-here"
preview_id = "your-preview-kv-namespace-id-here"

[vars]
ENVIRONMENT = "production"
PORTFOLIO_DOMAIN = "portfolio.qianshe.top"
DASHBOARD_DOMAIN = "dashboard.qianshe.top"
```

### Dashboard Worker 配置

更新 `dashboard/worker/wrangler.toml`:

```toml
name = "dashboard-qianshe"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-db"
database_id = "your-database-id-here"

[vars]
ENVIRONMENT = "production"
JWT_SECRET = "your-super-secret-jwt-key-here"
JWT_EXPIRES_IN = "24h"
PORTFOLIO_DOMAIN = "portfolio.qianshe.top"
DASHBOARD_DOMAIN = "dashboard.qianshe.top"

[secrets]
ADMIN_PASSWORD = "your-admin-password"
```

## 前端构建

### 1. 构建 Portfolio 前端

```bash
cd portfolio/frontend
npm run build

# 验证构建输出
ls -la dist/
```

### 2. 构建 Dashboard 前端

```bash
cd dashboard/frontend
npm run build

# 验证构建输出
ls -la dist/
```

## 域名配置

### 1. 设置 DNS 记录

在 Cloudflare 控制台添加 DNS 记录：

```
A    portfolio    192.0.2.1    # Cloudflare Workers IP
A    dashboard    192.0.2.1    # Cloudflare Workers IP
```

### 2. 配置自定义域名

```bash
# Portfolio Worker 自定义域名
wrangler custom-domains add portfolio.qianshe.top

# Dashboard Worker 自定义域名
wrangler custom-domains add dashboard.qianshe.top
```

## 部署步骤

### 1. 部署 Portfolio Worker

```bash
cd portfolio/worker

# 部署到生产环境
wrangler deploy

# 验证部署
curl https://portfolio.qianshe.top/health
```

### 2. 部署 Dashboard Worker

```bash
cd dashboard/worker

# 部署到生产环境
wrangler deploy

# 验证部署
curl https://dashboard.qianshe.top/health
```

### 3. 测试 API 连接

```bash
# 测试 Portfolio API
curl https://portfolio.qianshe.top/api/posts

# 测试 Dashboard API（需要认证）
curl -X POST https://dashboard.qianshe.top/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@qianshe.top","password":"your-admin-password"}'
```

## 验证部署

### 1. 功能检查清单

#### Portfolio 端检查

- [ ] 首页正常加载
- [ ] 文章列表显示
- [ ] 文章详情页面
- [ ] 项目展示页面
- [ ] 评论功能正常
- [ ] 主题切换功能
- [ ] 移动端适配

#### Dashboard 端检查

- [ ] 登录功能正常
- [ ] 内容管理界面
- [ ] 数据统计显示
- [ ] 用户权限控制
- [ ] 系统设置功能

### 2. 性能测试

```bash
# 使用 curl 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://portfolio.qianshe.top/

# 或使用在线工具测试
# - Google PageSpeed Insights
# - GTmetrix
# - WebPageTest
```

### 3. 安全测试

```bash
# 测试 HTTPS 证书
openssl s_client -connect portfolio.qianshe.top:443

# 检查安全头
curl -I https://portfolio.qianshe.top
```

## 监控和维护

### 1. 设置监控

#### Cloudflare Analytics

- 访问 Cloudflare 控制台
- 查看 Analytics & Logs
- 配置自定义仪表板

#### Worker Analytics

```bash
# 查看 Worker 日志
wrangler tail portfolio-qianshe
wrangler tail dashboard-qianshe
```

### 2. 备份策略

#### 数据库备份

```bash
# 导出数据库
wrangler d1 export qianshe-db --output=qianshe-backup.sql

# 定期备份脚本
# 建议设置 cron 任务每周备份一次
```

#### 配置备份

定期备份以下文件：

- `wrangler.toml` 配置文件
- 环境变量配置
- 数据库迁移脚本

### 3. 更新流程

#### 代码更新

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
npm run install:all

# 3. 重新构建
cd portfolio/frontend && npm run build
cd ../dashboard/frontend && npm run build

# 4. 部署 Workers
cd portfolio/worker && wrangler deploy
cd ../../dashboard/worker && wrangler deploy
```

#### 数据库更新

```bash
# 执行新的迁移
cd portfolio/worker
wrangler d1 migrations apply qianshe-db --remote
```

## 故障排除

### 常见问题

#### 1. Worker 部署失败

```bash
# 检查配置文件
wrangler whoami
wrangler kv:namespace list
wrangler d1 list

# 查看详细错误
wrangler deploy --dry-run
```

#### 2. 数据库连接问题

```bash
# 测试数据库连接
wrangler d1 execute qianshe-db --command "SELECT 1"

# 检查数据库绑定
wrangler d1 info qianshe-db
```

#### 3. 域名解析问题

```bash
# 检查 DNS 解析
nslookup portfolio.qianshe.top
dig portfolio.qianshe.top

# 检查 SSL 证书
curl -I https://portfolio.qianshe.top
```

#### 4. 前端构建问题

```bash
# 清理缓存重新构建
rm -rf node_modules dist
npm install
npm run build
```

### 日志分析

#### Worker 日志

```bash
# 实时查看日志
wrangler tail portfolio-qianshe --format=pretty

# 查看特定时间段日志
wrangler tail portfolio-qianshe --since=1h
```

#### 错误日志分析

常见错误类型：

- **Binding 错误** - 检查 wrangler.toml 中的绑定配置
- **权限错误** - 检查 JWT Token 和权限设置
- **数据库错误** - 检查 D1 数据库连接和查询语句
- **KV 存储错误** - 检查 KV 命名空间绑定

## 性能优化建议

### 1. 缓存优化

- 设置合适的缓存 TTL
- 使用缓存标签进行精细化控制
- 定期清理过期缓存

### 2. 数据库优化

- 添加适当索引
- 优化查询语句
- 使用连接池

### 3. 前端优化

- 启用 Gzip 压缩
- 使用 CDN 加速
- 优化图片资源

## 安全加固

### 1. 访问控制

- 定期更新 JWT 密钥
- 设置强密码策略
- 启用双因素认证

### 2. 数据保护

- 加密敏感数据
- 定期备份
- 访问日志记录

### 3. 网络安全

- 配置 WAF 规则
- 启用 DDoS 保护
- 设置安全头

## 联系支持

如遇到部署问题，可以：

1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 搜索 [GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)
3. 联系 Cloudflare 技术支持
4. 在项目仓库中提交 Issue

---

**部署完成后，请务必进行全面的测试验证，确保所有功能正常运行。**
