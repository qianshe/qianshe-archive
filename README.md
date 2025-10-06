# 谦舍个人博客与作品集系统

## 🏗️ 项目概览

这是一个基于 Cloudflare Workers 和 React 的现代化个人博客与作品集系统，采用 monorepo 架构，包含作品集展示和管理后台两大核心模块。

### ✨ 核心特性

- 🚀 **高性能**：基于 Cloudflare Workers 的边缘计算
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **现代化UI**：使用 React 和 Tailwind CSS
- 🔒 **类型安全**：全面使用 TypeScript
- 🧪 **高质量代码**：完整的测试覆盖和代码质量保障
- 📊 **质量监控**：自动化的代码质量监控和报告
- 🔐 **安全可靠**：JWT认证、权限控制、安全扫描
- ⚡ **快速部署**：一键部署到Cloudflare平台

## 📁 项目结构

```
qianshe-archive/
├── portfolio/                 # 作品集前端
│   ├── frontend/             # React前端应用
│   └── worker/               # Cloudflare Workers API
├── dashboard/                # 管理后台
│   ├── frontend/             # React管理界面
│   └── worker/               # Cloudflare Workers API
├── shared/                   # 共享代码
│   └── types/                # TypeScript类型定义
├── database/                 # 数据库相关
│   └── migrations/           # 数据库迁移
├── docs/                     # 项目文档
├── scripts/                  # 工具脚本
├── tests/                    # 测试文件
└── .github/                  # GitHub配置
```

## 🛠️ 技术栈

### 前端
- **React 18**：用户界面框架
- **TypeScript**：类型安全的JavaScript
- **Tailwind CSS**：实用优先的CSS框架
- **Vite**：快速构建工具
- **React Router**：客户端路由

### 后端
- **Cloudflare Workers**：边缘计算平台
- **Cloudflare D1**：SQLite兼容数据库
- **Hono**：轻量级Web框架
- **Drizzle ORM**：类型安全的ORM

### 开发工具
- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Jest**：单元测试框架
- **Playwright**：端到端测试

### 质量保障
- **Pre-commit Hooks**：提交前自动检查
- **CI/CD Pipeline**：持续集成检查
- **代码审查**：团队代码审查流程
- **质量监控**：自动化质量监控和报告

## 📜 质量保障

本项目建立了完整的代码质量保障体系：

### 🚪 质量门禁
- **Pre-commit Hooks**：提交前自动检查
- **CI/CD Pipeline**：持续集成检查
- **代码审查**：团队代码审查流程

### 📊 质量监控
```bash
# 运行质量检查
npm run quality-check

# 生成质量监控报告
npm run quality:monitor

# 查看质量仪表板
npm run quality:dashboard
```

### 📈 质量指标
- 代码覆盖率 > 80%
- ESLint错误 = 0
- 安全漏洞 = 0
- 构建时间 < 5分钟

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm 或 yarn
- Cloudflare 账户和 Wrangler CLI

### 安装和配置

1. **克隆项目**

```bash
git clone <repository-url>
cd qiansheArchive
```

2. **安装依赖**

```bash
npm run install:all
```

3. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，填入真实配置
```

4. **初始化数据库**

```bash
npm run init:db
```

5. **本地开发**

```bash
# 启动展示端 (端口 8787)
npm run dev:portfolio

# 启动管理端 (端口 8788)
npm run dev:dashboard
```

## 📦 部署

### 自动部署（推荐）

```bash
# 完整部署
npm run deploy

# 仅部署展示端
npm run deploy:portfolio

# 仅部署管理端
npm run deploy:dashboard
```

### 手动部署

1. **创建 D1 数据库**

```bash
cd database
npx wrangler d1 create qianshe-db
```

2. **执行数据库迁移**

```bash
npx wrangler d1 execute qianshe-db --file=schema.sql
npx wrangler d1 execute qianshe-db --file=migrations/001_initial_data.sql
```

3. **创建 KV 存储**

```bash
npx wrangler kv:namespace create "qianshe-cache"
npx wrangler kv:namespace create "qianshe-sessions"
```

4. **创建 R2 存储桶**

```bash
npx wrangler r2 bucket create qianshe-uploads
```

5. **更新配置文件**

- 更新 `portfolio/worker/wrangler.toml` 中的数据库 ID
- 更新 `dashboard/worker/wrangler.toml` 中的数据库 ID

6. **部署 Workers**

```bash
# 部署展示端
cd portfolio/worker
npm run deploy

# 部署管理端
cd dashboard/worker
npm run deploy
```

## 🛠️ 开发指南

### 项目结构

- **展示端 (Portfolio)**: 面向公众的博客和作品集展示
- **管理端 (Dashboard):** 内容管理和数据统计后台
- **共享数据库**: 两个端点共享同一个 D1 数据库

### API 设计

- **Portfolio API**: 公开的读取接口
- **Dashboard API**: 需要认证的管理接口
- **共享数据**: 通过数据库实现数据同步

### 本地开发端口

- Portfolio: http://localhost:8787
- Dashboard: http://localhost:8788

## 🔧 配置说明

### 环境变量

主要配置项说明：

```bash
# 数据库
D1_DATABASE_ID=your-database-id
D1_DATABASE_NAME=qianshe-db

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key

# 域名
PORTFOLIO_DOMAIN=qianshe.top
DASHBOARD_DOMAIN=dashboard.qianshe.top

# 管理员账户
ADMIN_EMAIL=admin@qianshe.top
ADMIN_PASSWORD=admin123
```

### 域名配置

1. 在 Cloudflare DNS 中添加记录：
   - `qianshe.top` -> Portfolio Worker
   - `dashboard.qianshe.top` -> Dashboard Worker

2. 在 Cloudflare Workers 中绑定自定义域名

## 📊 功能模块

### 展示端功能

- 📝 博客文章展示
- 💼 项目作品集
- 💬 评论系统
- 🔍 搜索功能
- 📱 响应式设计
- 🌙 深色模式

### 管理端功能

- 🔐 用户认证
- 📝 内容管理
- 📊 数据统计
- 👥 用户管理
- ⚙️ 系统设置
- 📁 文件管理

## 🔒 安全特性

- JWT 认证机制
- 角色权限控制
- 输入验证和清理
- XSS 防护
- CSRF 保护

## 📈 性能优化

- Cloudflare CDN
- 静态资源缓存
- 数据库索引优化
- 图片压缩和优化
- 懒加载实现

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 许可证

MIT License

## 🆘 支持

如有问题，请通过以下方式联系：

- 邮箱: admin@qianshe.top
- GitHub Issues: [项目地址]

---

**谦舍** - 记录想法，分享技术，展示作品
