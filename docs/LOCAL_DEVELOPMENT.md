# 本地开发环境配置指南

## 📋 目录

- [概述](#概述)
- [本地开发模式选择](#本地开发模式选择)
- [完全本地模式（推荐）](#完全本地模式推荐)
- [混合模式](#混合模式本地代码--远程数据)
- [完全远程模式](#完全远程模式)
- [常见问题](#常见问题)
- [故障排查](#故障排查)

---

## 概述

本项目基于 Cloudflare Workers 平台，使用以下服务：
- **D1 数据库**: SQLite 数据库服务
- **R2 对象存储**: 文件存储服务
- **KV 存储**: 键值对存储服务

在本地开发时，Wrangler v3 提供了完整的本地模拟能力，**无需创建任何远程资源**即可进行开发。

---

## 本地开发模式选择

### 模式对比

| 特性 | 完全本地模式 | 混合模式 | 完全远程模式 |
|------|------------|---------|------------|
| 网络要求 | ❌ 离线可用 | ⚠️ 需要连接 | ✅ 需要连接 |
| 迭代速度 | ✅ 最快 | ⚠️ 中等 | ❌ 慢 |
| 数据隔离 | ✅ 完全隔离 | ⚠️ 部分隔离 | ❌ 共享生产 |
| 资源创建 | ❌ 不需要 | ✅ 需要 | ✅ 需要 |
| 推荐场景 | 日常开发 | 团队协作 | 生产测试 |

---

## 完全本地模式（推荐）

### ✨ 特点

- ✅ **无需创建远程资源**
- ✅ **完全离线工作**
- ✅ **数据持久化在本地**
- ✅ **快速迭代开发**
- ⚠️ 需要手动初始化本地数据

### 📦 快速开始

#### 1. 安装依赖

```bash
npm install
```

#### 2. 初始化本地数据库

```bash
# 方式 1: 使用项目脚本（推荐）
npm run init:db

# 方式 2: 手动初始化
wrangler d1 execute SHARED_DB --local --file=database/schema.sql --persist-to .wrangler/state
```

#### 3. 启动开发服务器

```bash
# 启动 Dashboard Worker (端口 8788)
npm run dev:dashboard

# 启动 Portfolio Worker (端口 8787)
npm run dev:portfolio
```

### 📂 本地数据存储位置

所有本地数据都存储在项目根目录下的 `.wrangler/state/` 目录：

```
.wrangler/state/
├── v3/
│   ├── d1/          # D1 数据库文件
│   ├── r2/          # R2 对象存储
│   └── kv/          # KV 键值存储
```

### 🔧 本地数据操作

#### D1 数据库操作

```bash
# 执行 SQL 查询
wrangler d1 execute SHARED_DB --local --command="SELECT * FROM users"

# 执行 SQL 文件
wrangler d1 execute SHARED_DB --local --file=database/migrations/001_initial_data.sql

# 导出数据库
wrangler d1 export SHARED_DB --local --output=backup.sql

# 查看未应用的迁移
wrangler d1 migrations list SHARED_DB --local
```

#### R2 对象存储操作

```bash
# 上传文件
wrangler r2 object put --local my-file.txt --bucket qianshe-uploads-dev

# 列出文件
wrangler r2 object list --local --bucket qianshe-uploads-dev

# 下载文件
wrangler r2 object get --local my-file.txt --bucket qianshe-uploads-dev

# 删除文件
wrangler r2 object delete --local my-file.txt --bucket qianshe-uploads-dev
```

#### KV 存储操作

```bash
# 写入键值
wrangler kv:key put --local "my-key" "my-value" --binding=CACHE_KV

# 读取键值
wrangler kv:key get --local "my-key" --binding=CACHE_KV

# 列出所有键
wrangler kv:key list --local --binding=CACHE_KV

# 删除键
wrangler kv:key delete --local "my-key" --binding=CACHE_KV
```

### 🗄️ 数据持久化

本地数据会自动持久化到 `.wrangler/state/` 目录，重启开发服务器后数据依然存在。

**清除本地数据**：
```bash
# 删除所有本地数据
rm -rf .wrangler/state

# 或仅删除特定服务的数据
rm -rf .wrangler/state/v3/d1
rm -rf .wrangler/state/v3/r2
rm -rf .wrangler/state/v3/kv
```

---

## 混合模式（本地代码 + 远程数据）

适用于需要访问真实生产数据或团队共享开发数据的场景。

### 📋 前置要求

1. Cloudflare 账号
2. Wrangler CLI 已登录
3. 已创建远程资源

### 🚀 设置步骤

#### 1. 登录 Cloudflare

```bash
wrangler login
```

#### 2. 创建远程资源

```bash
# 创建 D1 数据库
wrangler d1 create qianshe-db
# 记录返回的 database_id

# 创建 R2 Bucket
wrangler r2 bucket create qianshe-uploads-dev

# 创建 KV 命名空间
wrangler kv:namespace create "SESSIONS_KV"
wrangler kv:namespace create "CACHE_KV"
# 记录返回的 id
```

#### 3. 更新配置文件

编辑 `packages/dashboard-worker/wrangler.toml`:

```toml
[[env.development.d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为实际 ID

[[env.development.r2_buckets]]
binding = "UPLOADS_BUCKET"
bucket_name = "qianshe-uploads-dev"

[[env.development.kv_namespaces]]
binding = "SESSIONS_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # 替换为实际 ID

[[env.development.kv_namespaces]]
binding = "CACHE_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # 替换为实际 ID
```

编辑 `packages/portfolio-worker/wrangler.toml`:

```toml
[[env.development.d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 同一个 D1 ID

[[r2_buckets]]
binding = "UPLOADS_BUCKET"
bucket_name = "qianshe-uploads-dev"
```

#### 4. 初始化远程数据库

```bash
# 执行数据库架构
wrangler d1 execute qianshe-db --file=database/schema.sql

# 执行初始数据
wrangler d1 execute qianshe-db --file=database/migrations/001_initial_data.sql
```

#### 5. 配置远程绑定

在 `wrangler.toml` 中指定哪些绑定使用远程资源：

```toml
[[env.development.d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-db"
database_id = "your-d1-id"
remote = true  # 使用远程 D1
```

#### 6. 启动开发服务器

```bash
# 使用远程绑定
npm run dev:dashboard

# 或完全使用远程模式
wrangler dev --remote --env development
```

### 💰 费用说明

Cloudflare 提供慷慨的免费额度：

| 服务 | 免费额度 | 超出费用 |
|------|---------|---------|
| D1 | 5GB 存储，2500 万次读，5000 万次写/月 | $0.75/GB，$0.001/1000 次读，$1.00/1000 次写 |
| R2 | 10GB 存储，100 万次 A 类操作，1000 万次 B 类操作/月 | $0.015/GB，$4.50/100 万次 A 类，$0.36/100 万次 B 类 |
| KV | 1GB 存储，1000 万次读，100 万次写/月 | $0.50/GB，$0.50/100 万次读，$5.00/100 万次写 |

开发环境通常在免费额度内。

---

## 完全远程模式

⚠️ **不推荐用于日常开发**，仅用于测试生产环境配置。

### 使用方法

```bash
wrangler dev --remote --env production
```

### 特点

- ❌ 每次修改都上传到 Cloudflare
- ❌ 迭代速度慢
- ⚠️ 使用生产数据（风险高）
- ✅ 完全模拟生产环境

---

## 常见问题

### Q1: 为什么我之前的项目 KV 不用创建？

**A:** Wrangler v3 默认使用本地模拟模式，所有绑定（D1/R2/KV）都会自动在 `.wrangler/state/` 目录创建本地实例，无需手动创建。

### Q2: 本地数据会丢失吗？

**A:** 不会。本地数据持久化在 `.wrangler/state/` 目录，除非手动删除，否则会一直保留。

### Q3: 如何在本地和远程模式之间切换？

**A:** 
- 本地模式：`wrangler dev`（默认）
- 远程模式：`wrangler dev --remote`
- 混合模式：在 `wrangler.toml` 中配置 `remote: true`

### Q4: 团队协作如何共享开发数据？

**A:** 使用混合模式，创建专门的 `development` 环境资源，团队成员配置相同的 `database_id` 和 `bucket_name`。

### Q5: 本地开发时端口冲突怎么办？

**A:** 
```bash
# 指定端口
wrangler dev --port 9000

# 或在 wrangler.toml 中配置
[dev]
port = 9000
```

### Q6: 如何重置本地数据库？

**A:**
```bash
# 删除本地数据
rm -rf .wrangler/state/v3/d1

# 重新初始化
npm run init:db
```

---

## 故障排查

### 问题 1: `wrangler dev` 启动失败

**可能原因**：
- Node.js 版本过低（需要 >= 18.0.0）
- 端口被占用
- 缺少依赖

**解决方案**：
```bash
# 检查 Node.js 版本
node --version

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 使用不同端口
wrangler dev --port 9000
```

### 问题 2: 本地数据库查询失败

**可能原因**：
- 数据库未初始化
- SQL 语法错误
- 绑定名称错误

**解决方案**：
```bash
# 检查数据库是否存在
ls .wrangler/state/v3/d1

# 重新初始化
npm run init:db

# 验证 SQL
wrangler d1 execute SHARED_DB --local --command="SELECT 1"
```

### 问题 3: R2 文件上传失败

**可能原因**：
- Bucket 名称不匹配
- 文件路径错误
- 权限问题

**解决方案**：
```bash
# 检查配置
cat packages/dashboard-worker/wrangler.toml | grep -A 2 r2_buckets

# 测试上传
echo "test" > test.txt
wrangler r2 object put --local test.txt --bucket qianshe-uploads-dev
```

### 问题 4: 开发服务器热重载不工作

**解决方案**：
```bash
# 清除缓存
rm -rf .wrangler

# 重启开发服务器
npm run dev:dashboard
```

### 问题 5: TypeScript 类型错误

**解决方案**：
```bash
# 重新生成类型定义
npm run type-check

# 检查 @cloudflare/workers-types 版本
npm list @cloudflare/workers-types
```

---

## 📚 相关文档

- [Cloudflare Workers 官方文档](https://developers.cloudflare.com/workers/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [R2 对象存储文档](https://developers.cloudflare.com/r2/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目架构文档](./api-architecture.md)
- [开发工作流](./DEVELOPMENT_WORKFLOW.md)

---

## 🔄 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| 1.0.0 | 2025-01-07 | 初始版本，包含完整的本地开发配置指南 |

---

**💡 提示**: 推荐使用完全本地模式进行日常开发，仅在需要测试生产环境配置或团队协作时使用混合/远程模式。
