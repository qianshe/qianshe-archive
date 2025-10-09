# Cloudflare Workers 升级说明

**升级日期**: 2025-10-10
**升级目标**: 迁移到新的 Cloudflare Workers Assets 配置
**升级范围**:
- ✅ dashboard-worker (后台管理)
- ✅ portfolio-worker (前台展示)

## 主要变更

### 1. 静态资源服务升级

#### 从旧的 `[site]` 配置迁移到新的 `[assets]` 配置

**之前 (wrangler.local.toml)**:
```toml
[site]
bucket = "./dist"
```

**现在 (wrangler.local.toml)**:
```toml
[observability]
enabled = true

[assets]
directory = "./dist"
binding = "ASSETS"
```

#### 代码层面改动

- ✅ **移除**: `@cloudflare/kv-asset-handler` 依赖
- ✅ **移除**: `getAssetFromKV()` 函数调用
- ✅ **移除**: `__STATIC_CONTENT` 和 `__STATIC_CONTENT_MANIFEST` 相关代码
- ✅ **新增**: 使用 `ASSETS` Fetcher 绑定服务静态文件

**新的静态文件服务方式**:
```typescript
// 使用 ASSETS 绑定
if (c.env.ASSETS) {
  const response = await c.env.ASSETS.fetch(c.req.raw);
  return response;
}
```

### 2. 依赖升级

| 包名 | 旧版本 | 新版本 |
|------|--------|--------|
| wrangler | ^3.0.0 | **^4.42.2** |
| @cloudflare/workers-types | ^4.20231121.0 | **^4.20250110.0** |
| hono | ^4.0.0 | **^4.7.10** |
| marked | ^11.1.1 | **^15.0.6** |
| dompurify | ^3.0.6 | **^3.2.3** |
| zod | ^3.22.4 | **^3.24.1** |
| typescript | ^5.3.3 | **^5.7.3** |
| @types/jsonwebtoken | ^9.0.5 | **^9.0.7** |

**移除的依赖**:
- `@cloudflare/kv-asset-handler` (不再需要)

### 3. 类型定义更新

**src/types/index.ts**:
```typescript
export interface DashboardEnv {
  // 静态资源（新的 assets 配置）
  ASSETS?: Fetcher;

  // 移除了旧的：
  // __STATIC_CONTENT?: KVNamespace;
  // __STATIC_CONTENT_MANIFEST?: string;
}
```

### 4. 路由改进

修复了 `/assets/:filename` 路由的 fallback 逻辑：
```typescript
// 现在正确地 fallback 到静态文件处理器
if (!bucket || !object) {
  return await next();
}
```

## 升级步骤

### 1. 更新依赖（已完成）
```bash
# 在项目根目录执行
npm install --legacy-peer-deps
```

### 2. Dashboard Worker 开发

#### 构建前端
```bash
cd packages/dashboard-frontend
npm run build
```

#### 启动开发服务器
```bash
cd packages/dashboard-worker
npm run dev  # http://localhost:8788
```

### 3. Portfolio Worker 开发

#### 构建前端
```bash
cd packages/portfolio-frontend
npm run build
```

#### 启动开发服务器
```bash
cd packages/portfolio-worker
npm run dev  # http://localhost:8787
```

## 开发模式

### 推荐：前后端分离开发
```bash
# 终端 1：前端热重载
cd packages/dashboard-frontend
npm run dev  # http://localhost:5173

# 终端 2：Worker API
cd packages/dashboard-worker
npm run dev  # http://localhost:8788
```

### 测试完整部署
如需测试完整部署（前端 + Worker），确保：
1. 前端已构建：`cd packages/dashboard-frontend && npm run build`
2. Worker 可以访问 `dist/` 目录
3. 访问：`http://localhost:8788`

## 优势

### 新的 [assets] 配置优势
- ✅ **更简单**: 无需手动管理 KV 和 manifest
- ✅ **更可靠**: Wrangler 自动处理文件映射
- ✅ **更高效**: 内置优化的静态文件服务
- ✅ **开发体验**: 本地开发更稳定

### 依赖升级优势
- ✅ **Wrangler 4.x**: 性能改进和新特性
- ✅ **Hono 4.7**: 更好的 TypeScript 支持
- ✅ **最新安全补丁**: 所有依赖都是最新稳定版本

## 注意事项

1. **部署无影响**: 生产部署命令保持不变
2. **向后兼容**: 旧的部署继续工作
3. **无数据迁移**: 只是代码层面的改动

## 验证

### Dashboard Worker (http://localhost:8788)
- [ ] `/health` 返回 200
- [ ] `/` 加载前端页面
- [ ] `/api/*` API 正常工作
- [ ] 静态资源（JS/CSS）正确加载

### Portfolio Worker (http://localhost:8787)
- [ ] `/health` 返回 200
- [ ] `/` 加载前端页面
- [ ] `/api/*` API 正常工作
- [ ] 静态资源（JS/CSS）正确加载

### 类型检查（已通过 ✅）
```bash
npm run type-check --workspace=packages/dashboard-worker  # ✅ 通过
npm run type-check --workspace=packages/portfolio-worker  # ✅ 通过
```

## 相关文档

- [Cloudflare Workers Assets](https://developers.cloudflare.com/workers/configuration/sites/)
- [Wrangler 4.x Migration Guide](https://developers.cloudflare.com/workers/wrangler/)
- [Hono Documentation](https://hono.dev/)

---

**生成日期**: 2025-10-10
**状态**: ✅ 已完成升级
