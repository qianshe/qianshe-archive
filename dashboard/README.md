# 谦舍博客 - Dashboard管理后台

## 项目简介

谦舍博客系统的Dashboard管理后台，用于管理博客内容、用户、系统设置等功能。

## 技术栈

### 前端

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: React Query + Context API
- **路由**: React Router
- **UI框架**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **表单**: React Hook Form
- **通知**: React Hot Toast

### 后端

- **运行时**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: JWT + bcryptjs
- **文件存储**: Cloudflare R2
- **缓存**: Cloudflare KV

## 项目结构

```
dashboard/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   │   ├── auth/        # 认证相关组件
│   │   │   └── Layout.tsx   # 布局组件
│   │   ├── contexts/        # React Context
│   │   ├── pages/           # 页面组件
│   │   │   ├── auth/        # 认证页面
│   │   │   ├── posts/       # 文章管理
│   │   │   ├── projects/    # 项目管理
│   │   │   ├── comments/    # 评论管理
│   │   │   ├── users/       # 用户管理
│   │   │   ├── analytics/   # 数据分析
│   │   │   ├── files/       # 文件管理
│   │   │   └── settings/    # 系统设置
│   │   ├── services/        # API服务
│   │   ├── types/          # TypeScript类型定义
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── utils/          # 工具函数
│   │   ├── styles/         # 样式文件
│   │   ├── App.tsx         # 主应用组件
│   │   └── main.tsx        # 入口文件
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── worker/                  # 后端Worker
│   ├── src/
│   │   ├── handlers/       # API路由处理器
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑服务
│   │   ├── shared/         # 共享工具
│   │   ├── types/          # 类型定义
│   │   └── index.ts        # 入口文件
│   ├── package.json
│   ├── wrangler.toml      # Worker配置
│   └── tsconfig.json
│
└── README.md               # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Cloudflare CLI (wrangler)
- Cloudflare 账号

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../worker
npm install
```

### 环境配置

1. 前端环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

2. 后端环境变量

```bash
# 编辑wrangler.toml配置文件
vim wrangler.toml
```

### 数据库配置

1. 创建D1数据库

```bash
# 创建数据库
wrangler d1 create qianshe-archive-db

# 在wrangler.toml中配置数据库ID
```

2. 运行数据库迁移

```bash
# 本地迁移
npm run db:migrate:local

# 生产环境迁移
npm run db:migrate
```

### 开发启动

1. 启动后端服务

```bash
cd worker
npm run dev
```

2. 启动前端服务

```bash
cd frontend
npm run dev
```

3. 访问应用

- 前端地址: http://localhost:3000
- 后端API: http://localhost:8787/api

## 功能特性

### 用户认证系统

- ✅ 用户登录/登出
- ✅ 管理员快速登录
- ✅ JWT Token管理
- ✅ 权限控制（admin、moderator、user）
- ✅ 自动Token刷新
- ✅ 会话管理

### 内容管理

- ✅ 文章管理（CRUD操作）
- ✅ 项目管理（CRUD操作）
- ✅ 评论审核（批准/拒绝/删除）
- ✅ 批量操作
- ✅ 内容状态管理
- ✅ 分类和标签管理

### 数据统计

- ✅ 访问统计概览
- ✅ 实时数据展示
- ✅ 用户活跃度分析
- ✅ 内容表现分析
- ✅ 地理位置分析
- ✅ 设备统计

### 文件管理

- ✅ 文件上传/下载
- ✅ 图片压缩处理
- ✅ 文件权限管理
- ✅ 批量文件操作
- ✅ 存储统计

### 系统设置

- ✅ 网站基本信息配置
- ✅ 用户权限管理
- ✅ 系统配置选项
- ✅ 友情链接管理
- ✅ SEO设置

## API接口

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/admin-login` - 管理员登录
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 登出
- `GET /api/auth/verify` - 验证Token

### 内容管理

- `GET /api/posts` - 获取文章列表
- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章
- `POST /api/posts/batch` - 批量操作文章

- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

- `GET /api/comments` - 获取评论列表
- `PUT /api/comments/:id/status` - 更新评论状态
- `DELETE /api/comments/:id` - 删除评论

### 用户管理

- `GET /api/users` - 获取用户列表（管理员）
- `POST /api/users` - 创建用户（管理员）
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 数据分析

- `GET /api/analytics/overview` - 获取概览统计
- `GET /api/analytics/trends` - 获取访问趋势
- `GET /api/analytics/popular-pages` - 获取热门页面
- `GET /api/analytics/referrers` - 获取流量来源
- `GET /api/analytics/devices` - 获取设备统计

### 文件管理

- `GET /api/upload` - 获取文件列表
- `POST /api/upload` - 上传文件
- `PUT /api/upload/:id` - 更新文件信息
- `DELETE /api/upload/:id` - 删除文件

### 系统设置

- `GET /api/settings` - 获取设置列表
- `PUT /api/settings/:key` - 更新设置
- `DELETE /api/settings/:key` - 删除设置

## 部署指南

### 前端部署

1. 构建生产版本

```bash
cd frontend
npm run build
```

2. 部署到静态托管服务

```bash
# 可以部署到 Cloudflare Pages, Vercel, Netlify 等
npm run deploy
```

### 后端部署

1. 构建Worker

```bash
cd worker
npm run build
```

2. 部署到Cloudflare Workers

```bash
# 开发环境
npm run deploy:staging

# 生产环境
npm run deploy
```

3. 配置环境变量

```bash
# 设置生产环境变量
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_PASSWORD
```

## 安全考虑

### 认证安全

- 使用JWT进行无状态认证
- Token自动刷新机制
- 密码使用bcryptjs哈希存储
- 管理员密码通过环境变量配置

### 数据安全

- 输入验证和参数清理
- SQL注入防护
- CORS配置
- 速率限制

### 文件安全

- 文件类型白名单
- 文件大小限制
- 路径遍历防护
- 权限控制

## 开发指南

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint配置
- 使用Prettier格式化代码
- 提交前进行类型检查

### 测试

```bash
# 前端测试
cd frontend
npm run test

# 后端测试
cd worker
npm run test
```

### 日志和监控

- 结构化日志记录
- 错误追踪
- 性能监控
- 安全事件记录

## 故障排除

### 常见问题

1. **登录失败**
   - 检查JWT_SECRET配置
   - 验证用户密码
   - 查看日志信息

2. **API请求失败**
   - 检查网络连接
   - 验证Token有效性
   - 查看CORS配置

3. **文件上传失败**
   - 检查文件大小限制
   - 验证文件类型
   - 检查存储空间

### 调试工具

- 浏览器开发者工具
- Cloudflare Dashboard
- wrangler CLI工具
- 数据库查询工具

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码变更
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/your-username/qianshe-blog
- 作者邮箱: contact@qianshe.top
- 个人网站: https://qianshe.top
