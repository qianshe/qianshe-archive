# 谦舍个人博客与作品集系统 - AI 开发团队配置

## 项目概述
这是一个基于 Cloudflare Workers 和 React 的现代化个人博客与作品集系统，采用 monorepo 架构。

**技术栈**: React 18 + TypeScript + Cloudflare Workers + Hono + D1/KV/R2

---

## 自定义 AI Agents

### qianshe-cloudflare-specialist
**专属 Cloudflare 生态系统专家**

- **模型**: Sonnet (平衡性能与成本)
- **职责**:
  - Cloudflare Workers API 开发 (Hono 框架)
  - D1 数据库设计、查询与迁移
  - KV 缓存策略与 R2 对象存储
  - Wrangler 部署配置与执行
  - 边缘计算性能优化

- **协作模式**:
  - 与全局 `react-developer` 协作处理前后端集成
  - 与全局 `test-expert` 协作处理测试策略
  - 与全局 `code-review-expert` 协作处理安全审查

- **使用场景**:
  - 开发新的 API 端点
  - 优化 Worker 性能
  - 设计数据库 schema
  - 配置部署流程
  - 排查生产问题

---

## AI 团队使用指南

### 开发新功能 (前后端分离)
```bash
# 示例: 添加新的评论功能
"请 react-developer 和 qianshe-cloudflare-specialist 协作开发评论功能：
- react-developer: 实现评论组件和 UI
- qianshe-cloudflare-specialist: 实现评论 API 和数据库"
```

### 纯后端任务
```bash
# 示例: 优化数据库查询
"请 qianshe-cloudflare-specialist 优化文章列表的 D1 查询性能"
```

### 纯前端任务
```bash
# 示例: 优化 React 组件
"请 react-developer 优化 Dashboard 页面的加载性能"
```

### 部署和运维
```bash
# 示例: 配置生产环境
"请 qianshe-cloudflare-specialist 配置生产环境的 Wrangler 部署"
```

---

## 技术约定

### API 响应格式
```typescript
// 成功响应
{ "success": true, "data": {...}, "message": "..." }

// 错误响应
{ "success": false, "error": "...", "code": "ERROR_CODE" }
```

### 数据库迁移
- 位置: `database/migrations/`
- 命名: `001_initial_schema.sql`, `002_add_comments.sql`
- 执行: `npx wrangler d1 execute qianshe-db --local --file=./database/migrations/xxx.sql`

### 部署命令
```bash
# Portfolio (前台)
npm run deploy:portfolio

# Dashboard (后台)
npm run deploy:dashboard

# 本地开发
npm run dev  # Portfolio: http://localhost:8787
npm run dev  # Dashboard: http://localhost:8788
```

---

## 项目结构
```
qiansheArchive/
├── packages/
│   ├── portfolio-frontend/   # 前台 React 应用
│   ├── portfolio-worker/     # 前台 Cloudflare Worker
│   ├── dashboard-frontend/   # 后台 React 应用
│   └── dashboard-worker/     # 后台 Cloudflare Worker
├── database/                 # 数据库 schema 和迁移
├── .claude/
│   └── agents/               # 自定义 AI agents
│       └── qianshe-cloudflare-specialist.md
└── CLAUDE.md                 # 本文件
```

---

**生成日期**: 2025-10-10
**InitX 版本**: 智能模型匹配模式
**Agent 数量**: 1 个核心专属 Agent