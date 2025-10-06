# API架构设计文档

## 概述

谦舍博客系统采用双Worker架构，提供两套独立的API：

- **Portfolio API**: 公开访问的展示端API
- **Dashboard API**: 需要认证的管理端API

## 架构原则

### 1. 代码独立性

- 每个Worker独立部署和运行
- 独立的类型定义和业务逻辑
- 共享D1数据库实现数据互通

### 2. RESTful设计

- 遵循REST API设计规范
- 统一的响应格式
- 适当的HTTP状态码

### 3. 安全性

- JWT认证机制
- CORS跨域保护
- 输入验证和SQL注入防护

### 4. 性能优化

- 边缘缓存策略
- 数据库查询优化
- 响应压缩

## Portfolio API (展示端)

### 基础信息

- **域名**: `api.qianshe.top` 或 `portfolio-api.qianshe.workers.dev`
- **认证**: 无需认证（公开访问）
- **缓存**: 边缘缓存，TTL: 5分钟

### API端点

#### 文章相关

```http
# 获取文章列表
GET /api/posts?page=1&limit=10&category=blog&search=关键词
Response: BlogPostListResponse

# 获取文章详情
GET /api/posts/{slug}
Response: BlogPost

# 获取相关文章
GET /api/posts/{slug}/related
Response: RelatedPost[]

# 获取文章归档
GET /api/posts/archive?year=2025&month=1
Response: BlogArchive[]

# 获取标签统计
GET /api/posts/tags/stats
Response: TagStats[]

# 获取分类统计
GET /api/posts/categories/stats
Response: CategoryStats[]
```

#### 项目相关

```http
# 获取项目列表
GET /api/projects?page=1&limit=10&featured=true&search=关键词
Response: ProjectListResponse

# 获取项目详情
GET /api/projects/{slug}
Response: Project

# 获取技术栈统计
GET /api/projects/tech/stats
Response: TechStackStats[]
```

#### 评论相关

```http
# 获取评论列表
GET /api/comments?post_id={postId}&page=1&limit=20
Response: CommentListResponse

# 提交评论
POST /api/comments
Request: CommentRequest
Response: Comment

# 评论点赞
POST /api/comments/{commentId}/like
Request: CommentLikeRequest
Response: ApiResponse

# 验证邮箱
POST /api/comments/verify-email
Request: EmailVerificationRequest
Response: ApiResponse
```

#### 搜索功能

```http
# 全站搜索
GET /api/search?q=关键词&type=all&page=1&limit=10
Response: SearchResponse
```

#### 系统信息

```http
# 获取系统信息
GET /api/system/info
Response: SystemInfo

# 获取公开设置
GET /api/settings/public
Response: SystemSetting[]

# 获取友情链接
GET /api/links
Response: Link[]

# 记录访问统计
POST /api/analytics/track
Request: { path: string, referrer?: string }
Response: ApiResponse
```

### 响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": T,
  "message": "操作成功"
}

// 错误响应
{
  "success": false,
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

## Dashboard API (管理端)

### 基础信息

- **域名**: `admin-api.qianshe.top` 或 `dashboard-api.qianshe.workers.dev`
- **认证**: JWT Bearer Token
- **权限**: 基于角色的访问控制

### 认证机制

```http
# 用户登录
POST /api/auth/login
Request: LoginRequest
Response: LoginResponse

# 刷新Token
POST /api/auth/refresh
Request: RefreshTokenRequest
Response: { token: string }

# 登出
POST /api/auth/logout
Headers: Authorization: Bearer {token}
Response: ApiResponse

# 修改密码
POST /api/auth/change-password
Request: ChangePasswordRequest
Response: ApiResponse
```

### 文章管理

```http
# 获取文章列表（管理）
GET /api/posts?page=1&limit=20&status=published&category=blog
Response: BlogPostListResponse

# 创建文章
POST /api/posts
Request: BlogPostRequest
Response: BlogPost

# 更新文章
PUT /api/posts/{id}
Request: BlogPostRequest
Response: BlogPost

# 删除文章
DELETE /api/posts/{id}
Response: ApiResponse

# 批量操作
POST /api/posts/bulk
Request: BulkOperationRequest
Response: BulkOperationResponse

# 获取文章统计
GET /api/posts/stats
Response: BlogPostStats
```

### 评论管理

```http
# 获取评论列表（管理）
GET /api/comments?page=1&limit=50&approved=false
Response: CommentListResponse

# 审核评论
POST /api/comments/moderate
Request: ModerationRequest
Response: ApiResponse

# 获取评论统计
GET /api/comments/stats
Response: CommentStats
```

### 项目管理

```http
# 获取项目列表（管理）
GET /api/projects?page=1&limit=20&status=active
Response: ProjectListResponse

# 创建项目
POST /api/projects
Request: ProjectRequest
Response: Project

# 更新项目
PUT /api/projects/{id}
Request: ProjectRequest
Response: Project

# 删除项目
DELETE /api/projects/{id}
Response: ApiResponse

# 获取项目统计
GET /api/projects/stats
Response: ProjectStats
```

### 用户管理

```http
# 获取用户列表
GET /api/users?page=1&limit=20&role=admin
Response: UserListResponse

# 创建用户
POST /api/users
Request: UserRequest
Response: User

# 更新用户
PUT /api/users/{id}
Request: UserRequest
Response: User

# 删除用户
DELETE /api/users/{id}
Response: ApiResponse

# 获取用户统计
GET /api/users/stats
Response: UserStats
```

### 系统设置

```http
# 获取所有设置
GET /api/settings
Response: SystemSetting[]

# 更新设置
PUT /api/settings/{key}
Request: { value: string }
Response: SystemSetting

# 获取系统统计
GET /api/analytics/overview
Response: OverviewStats

# 获取访问统计
GET /api/analytics/visits?start_date=2025-01-01&end_date=2025-01-31
Response: AnalyticsResponse
```

### 文件管理

```http
# 上传文件
POST /api/upload
Request: multipart/form-data
Response: UploadResponse

# 获取文件列表
GET /api/upload?page=1&limit=20
Response: FileUpload[]

# 删除文件
DELETE /api/upload/{id}
Response: ApiResponse
```

### 认证中间件

```typescript
// JWT验证
const authMiddleware = async (request: Request, env: Env) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return new Response('Invalid token', { status: 401 });
  }

  request.user = payload;
  return null; // 继续处理请求
};
```

### 权限控制

```typescript
const permissions = {
  admin: [
    'posts.create',
    'posts.read',
    'posts.update',
    'posts.delete',
    'comments.moderate',
    'users.manage',
    'settings.update',
    'analytics.view'
  ],
  moderator: ['posts.read', 'posts.update', 'comments.moderate', 'analytics.view'],
  user: ['posts.read', 'analytics.view']
};

const hasPermission = (userRole: string, permission: string): boolean => {
  return permissions[userRole]?.includes(permission) || false;
};
```

## 数据库架构

### 共享数据库

- **数据库名称**: `qianshe-archive-db`
- **Worker绑定**: `SHARED_DB`
- **迁移管理**: `database/migrations/`

### 核心表结构

- `posts`: 文章和项目内容
- `comments`: 评论系统
- `users`: 用户管理
- `projects`: 项目作品
- `analytics`: 访问统计
- `settings`: 系统配置
- `uploads`: 文件管理
- `links`: 友情链接

## 错误处理

### 标准错误码

```typescript
const ERROR_CODES = {
  // 通用错误
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // 认证错误
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // 业务错误
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  SLUG_EXISTS: 'SLUG_EXISTS',
  INVALID_EMAIL: 'INVALID_EMAIL',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND'
};
```

### 错误响应格式

```typescript
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": {} // 可选的详细信息
}
```

## 缓存策略

### Portfolio API缓存

- **文章列表**: 5分钟
- **文章详情**: 10分钟
- **项目列表**: 5分钟
- **评论列表**: 2分钟
- **系统设置**: 30分钟

### Dashboard API缓存

- **统计数据**: 1分钟
- **用户列表**: 5分钟
- **系统信息**: 10分钟

## 安全措施

### 输入验证

- 所有用户输入进行验证和清理
- SQL参数化查询防止注入
- XSS攻击防护

### 访问控制

- JWT Token认证
- 基于角色的权限控制
- API访问频率限制

### 数据保护

- 密码哈希存储
- 敏感数据加密
- 安全的文件上传

## 部署配置

### 环境变量

```typescript
// Portfolio Worker
interface Env {
  SHARED_DB: D1Database;
  CORS_ORIGIN: string;
  UPLOAD_BUCKET?: R2Bucket;
}

// Dashboard Worker
interface Env {
  SHARED_DB: D1Database;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  UPLOAD_BUCKET?: R2Bucket;
  ADMIN_EMAIL: string;
}
```

### 部署命令

```bash
# 部署Portfolio Worker
wrangler deploy --env production

# 部署Dashboard Worker
wrangler deploy --env production

# 数据库迁移
wrangler d1 migrations apply qianshe-archive-db --remote
```

## 监控和日志

### 性能监控

- API响应时间监控
- 错误率统计
- 数据库查询性能

### 访问日志

- 请求日志记录
- 错误日志追踪
- 用户行为分析

这个API架构确保了系统的安全性、可扩展性和性能，同时保持了代码的独立性和数据的互通性。
