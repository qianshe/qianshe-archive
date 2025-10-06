# Portfolio Worker API

基于Cloudflare Workers和Hono框架构建的Portfolio展示端API服务。

## 功能特性

- 🚀 **高性能**: 基于Cloudflare Workers边缘计算
- 📝 **文章管理**: 完整的博客文章API
- 🚀 **项目展示**: 项目列表和详情API
- 💬 **评论系统**: 支持评论和点赞功能
- 🔍 **全文搜索**: 站内搜索功能
- 📊 **访问统计**: 页面访问分析
- 🛡️ **安全防护**: CORS、速率限制、安全头
- 💾 **缓存优化**: KV缓存提升性能

## 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono.js
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **语言**: TypeScript
- **验证**: Zod

## API端点

### 基础信息

- **Base URL**: `https://your-domain.com/api`
- **健康检查**: `GET /api/health`

### 文章相关

#### 获取文章列表

```
GET /api/posts
```

查询参数:

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 100)
- `category`: 分类筛选 (blog|project|announcement)
- `search`: 搜索关键词
- `featured`: 是否精选
- `tags`: 标签筛选 (逗号分隔)
- `sort_by`: 排序字段 (published_at|view_count|like_count|created_at)
- `sort_order`: 排序方向 (asc|desc)

#### 获取文章详情

```
GET /api/posts/:slug
```

#### 获取相关文章

```
GET /api/posts/:slug/related?limit=3
```

#### 获取文章归档

```
GET /api/posts/archive
```

#### 获取标签统计

```
GET /api/posts/tags/stats
```

#### 获取分类统计

```
GET /api/posts/categories/stats
```

### 项目相关

#### 获取项目列表

```
GET /api/projects
```

查询参数:

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `featured`: 是否精选
- `tech`: 技术栈筛选 (逗号分隔)
- `status`: 项目状态 (completed|in-progress|planned)
- `sort_by`: 排序字段 (created_at|updated_at|star_count|title)
- `sort_order`: 排序方向 (asc|desc)

#### 获取项目详情

```
GET /api/projects/:slug
```

#### 获取技术栈统计

```
GET /api/projects/tech/stats
```

### 评论相关

#### 获取评论列表

```
GET /api/comments
```

查询参数:

- `page`: 页码
- `limit`: 每页数量
- `post_id`: 文章ID
- `project_id`: 项目ID
- `approved`: 是否已审核
- `sort_by`: 排序字段 (created_at|like_count)
- `sort_order`: 排序方向 (asc|desc)

#### 创建评论

```
POST /api/comments
```

请求体:

```json
{
  "post_id": 1,
  "author_name": "张三",
  "author_email": "zhangsan@example.com",
  "author_website": "https://example.com",
  "content": "这是一条评论内容"
}
```

#### 评论点赞

```
POST /api/comments/:id/like
```

#### 验证邮箱

```
POST /api/comments/verify-email
```

请求体:

```json
{
  "email": "zhangsan@example.com",
  "token": "verification_token"
}
```

### 搜索相关

#### 全站搜索

```
GET /api/search
```

查询参数:

- `query`: 搜索关键词 (必需)
- `type`: 搜索类型 (all|posts|projects)
- `page`: 页码
- `limit`: 每页数量

#### 获取搜索建议

```
GET /api/search/suggestions?q=keyword&limit=5
```

#### 获取热门搜索词

```
GET /api/search/popular?limit=10
```

### 系统相关

#### 获取系统信息

```
GET /api/system/info
```

#### 获取公开设置

```
GET /api/settings/public
```

#### 获取友情链接

```
GET /api/links
```

#### 记录访问统计

```
POST /api/analytics/track
```

请求体:

```json
{
  "path": "/blog/example-post",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0..."
}
```

## 响应格式

所有API响应都遵循统一格式:

```json
{
  "success": true,
  "data": {
    // 实际数据内容
  },
  "message": "操作成功",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

错误响应:

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 开发环境

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

### 类型检查

```bash
npm run type-check
```

### 构建

```bash
npm run build
```

### 部署

```bash
npm run deploy
```

## 环境配置

### wrangler.toml

```toml
name = "portfolio-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.development.vars]
ENVIRONMENT = "development"
SITE_URL = "http://localhost:8787"

[env.production.vars]
ENVIRONMENT = "production"
SITE_URL = "https://your-domain.com"

[[env.development.d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-archive-db"

[[env.production.d1_databases]]
binding = "SHARED_DB"
database_name = "qianshe-archive-db-prod"
```

### 环境变量

- `ENVIRONMENT`: 运行环境 (development|production)
- `SITE_URL`: 网站URL
- `CORS_ORIGIN`: CORS允许的源
- `JWT_SECRET`: JWT密钥 (如果需要)
- `SHARED_DB`: D1数据库绑定
- `CACHE`: KV缓存绑定

## 数据库表结构

### posts (文章表)

- `id`: 主键
- `title`: 标题
- `slug`: URL别名
- `content`: 内容
- `excerpt`: 摘要
- `category`: 分类
- `tags`: 标签 (JSON)
- `cover_image`: 封面图
- `is_published`: 是否发布
- `is_featured`: 是否精选
- `view_count`: 浏览量
- `like_count`: 点赞数
- `comment_count`: 评论数
- `published_at`: 发布时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

### projects (项目表)

- `id`: 主键
- `title`: 标题
- `slug`: URL别名
- `description`: 描述
- `tech_stack`: 技术栈 (JSON)
- `status`: 项目状态
- `github_url`: GitHub链接
- `demo_url`: 演示链接
- `cover_image`: 封面图
- `is_featured`: 是否精选
- `star_count`: 星标数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### comments (评论表)

- `id`: 主键
- `post_id`: 文章ID
- `project_id`: 项目ID
- `parent_id`: 父评论ID
- `author_name`: 作者姓名
- `author_email`: 作者邮箱
- `author_website`: 作者网站
- `content`: 评论内容
- `is_approved`: 是否已审核
- `like_count`: 点赞数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### analytics (访问统计表)

- `id`: 主键
- `path`: 访问路径
- `referrer`: 来源页面
- `user_agent`: 用户代理
- `ip_address`: IP地址
- `visit_date`: 访问日期
- `created_at`: 创建时间

## 缓存策略

- **文章列表**: 5分钟
- **文章详情**: 10分钟
- **相关文章**: 5分钟
- **标签统计**: 30分钟
- **项目列表**: 5分钟
- **项目详情**: 10分钟
- **系统信息**: 10分钟
- **友情链接**: 30分钟

## 安全特性

- **CORS配置**: 跨域请求控制
- **速率限制**: 每分钟100次请求
- **输入验证**: Zod模式验证
- **HTML转义**: 防止XSS攻击
- **安全头**: 防止点击劫持等攻击
- **HTTPS**: 强制使用HTTPS连接

## 许可证

MIT License
