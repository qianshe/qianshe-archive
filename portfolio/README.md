# Portfolio - 谦舍个人博客与作品集

## 项目简介

Portfolio 是谦舍项目的对外展示端，是一个现代化的个人博客和作品集网站。采用 React + TypeScript + TailwindCSS 构建，运行在 Cloudflare Workers 边缘计算平台上。

## 🌟 主要特性

- 🏠 **响应式首页** - Hero 区域、最新文章、精选项目展示
- 📝 **博客系统** - 文章列表、详情页、分类筛选、搜索功能
- 💼 **作品集展示** - 项目卡片、详情页、技术栈筛选
- 💬 **评论系统** - 访客评论、回复功能
- 🌓 **主题切换** - 明暗主题无缝切换
- 📱 **移动端适配** - 完美支持各种设备尺寸
- ⚡ **高性能** - 边缘计算 + 多级缓存策略
- 🔍 **SEO友好** - 优化的元数据和语义化标签

## 🛠 技术栈

### 前端技术

- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速构建工具
- **TailwindCSS** - 实用优先的CSS框架
- **React Query** - 数据获取和状态管理
- **React Router** - 客户端路由

### 后端服务

- **Cloudflare Workers** - 无服务器边缘计算
- **Hono.js** - 轻量级Web框架
- **D1 Database** - SQLite数据库
- **KV Storage** - 键值存储缓存

## 📁 项目结构

```
portfolio/
├── frontend/           # 前端React应用
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── hooks/       # 自定义Hooks
│   │   ├── pages/       # 页面组件
│   │   ├── styles/      # 样式文件
│   │   └── utils/       # 工具函数
│   ├── public/          # 静态资源
│   └── package.json
├── worker/              # 后端Worker服务
│   ├── src/
│   │   ├── routes/      # API路由
│   │   ├── middleware/  # 中间件
│   │   └── types/       # 类型定义
│   ├── migrations/      # 数据库迁移
│   └── wrangler.toml
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 包管理器
- Cloudflare 账户

### 本地开发

1. **安装依赖**

   ```bash
   cd portfolio/frontend
   npm install
   ```

2. **启动开发服务器**

   ```bash
   npm run dev
   ```

3. **启动Worker开发服务器**
   ```bash
   cd ../worker
   npx wrangler dev
   ```

### 环境配置

创建 `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8787/api
VITE_APP_TITLE=谦舍 - 个人博客与作品集
VITE_APP_DESCRIPTION=个人技术博客、项目作品展示与想法记录
```

## 📦 部署

### 前端部署

```bash
cd portfolio/frontend
npm run build
```

### Worker部署

```bash
cd portfolio/worker
npx wrangler deploy
```

## 🎨 组件架构

### 核心组件

- **Header** - 导航栏组件
- **Footer** - 页脚组件
- **ThemeToggle** - 主题切换
- **LoadingSpinner** - 加载状态
- **ErrorBoundary** - 错误边界

### 页面组件

- **HomePage** - 首页
- **PostsPage** - 文章列表页
- **PostDetail** - 文章详情页
- **ProjectsPage** - 项目列表页
- **ProjectDetail** - 项目详情页
- **AboutPage** - 关于页面

### 数据Hooks

- **usePosts** - 文章数据获取
- **useProjects** - 项目数据获取
- **useComments** - 评论数据管理
- **useTheme** - 主题状态管理

## 🔧 API接口

### 文章相关

- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `GET /api/posts/search?q=keyword` - 搜索文章

### 项目相关

- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `GET /api/projects/featured` - 获取精选项目

### 评论相关

- `GET /api/comments/:postId` - 获取文章评论
- `POST /api/comments` - 提交评论

## 🎯 功能特性

### 博客功能

- **Markdown支持** - 文章内容Markdown渲染
- **代码高亮** - 语法高亮显示
- **标签分类** - 文章分类和标签
- **搜索功能** - 全文搜索
- **分页加载** - 无限滚动或分页

### 作品集功能

- **项目展示** - 卡片式项目展示
- **技术栈筛选** - 按技术栈过滤
- **项目详情** - 详细项目介绍
- **外链支持** - 项目链接和演示

### 用户交互

- **评论系统** - 访客可以留言评论
- **主题切换** - 明暗主题切换
- **响应式设计** - 适配各种设备
- **无障碍支持** - ARIA标签支持

## 🎨 设计系统

### 颜色主题

```css
/* 明亮主题 */
--primary: #3b82f6;
--secondary: #64748b;
--background: #ffffff;
--surface: #f8fafc;

/* 暗色主题 */
--primary: #60a5fa;
--secondary: #94a3b8;
--background: #0f172a;
--surface: #1e293b;
```

### 字体系统

- **主字体**: Inter, system-ui, sans-serif
- **代码字体**: JetBrains Mono, Consolas, monospace
- **中文字体**: Noto Sans SC, sans-serif

### 间距系统

采用 TailwindCSS 的间距系统，基于 4px 的倍数。

## 📊 性能优化

### 前端优化

- **代码分割** - 按路由和组件分割代码
- **懒加载** - 图片和组件懒加载
- **缓存策略** - React Query缓存
- **资源压缩** - Gzip压缩和资源优化

### 后端优化

- **边缘缓存** - Cloudflare CDN缓存
- **KV缓存** - 热点数据缓存
- **数据库优化** - 查询优化和索引
- **响应压缩** - 自动响应压缩

## 🧪 测试

### 测试类型

- **单元测试** - 组件和函数测试
- **集成测试** - API集成测试
- **端到端测试** - 用户流程测试
- **性能测试** - 加载性能测试

### 运行测试

```bash
cd portfolio/frontend
npm test        # 单元测试
npm run test:e2e    # 端到端测试
npm run test:coverage # 测试覆盖率
```

## 🔒 安全特性

- **XSS防护** - 输入验证和输出编码
- **CSRF保护** - CSRF Token验证
- **内容安全策略** - CSP头部设置
- **HTTPS强制** - 全站HTTPS访问
- **输入验证** - 严格的数据验证

## 📈 监控和分析

### 性能监控

- **Core Web Vitals** - 核心性能指标
- **错误追踪** - 异常捕获和报告
- **资源监控** - 资源加载性能

### 用户分析

- **访问统计** - PV/UV统计
- **用户行为** - 点击和浏览行为
- **内容分析** - 热门文章和项目

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **项目地址**: [GitHub Repository]
- **部署地址**: [https://portfolio.qianshe.top](https://portfolio.qianshe.top)
- **相关问题**: [Issues Page]

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Hono](https://hono.dev/)

---

**谦舍 Portfolio** - 用心构建的个人数字花园 🌱
