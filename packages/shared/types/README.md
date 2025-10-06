# Shared Types

这个包提供跨项目共享的最小化类型定义。

## 设计原则

⚠️ **重要**: 大部分类型定义应该在各个子项目的 `src/types/` 目录中定义，而不是放在这里。

这个包应该只包含：

1. **真正需要跨多个项目共享的通用类型**（如 API 响应格式）
2. **基础工具类型**（如 `Optional`, `Nullable` 等）
3. **通用接口定义**（如分页、排序等）

## 项目类型定义位置

- `packages/dashboard-frontend/src/types/` - Dashboard 前端类型
- `packages/portfolio-frontend/src/types/` - Portfolio 前端类型
- `packages/dashboard-worker/src/types/` - Dashboard Worker 类型
- `packages/portfolio-worker/src/types/` - Portfolio Worker 类型

## 使用方式

```typescript
// 从 shared types 导入通用类型
import type { ApiResponse, PaginatedResponse } from '@qianshe/shared/types';

// 从项目本地 types 导入业务类型
import type { BlogPost, Project } from '../types';
```

## 为什么这样设计？

1. **减少耦合**: 各个项目的类型定义独立，修改不会影响其他项目
2. **避免冲突**: 不同项目可以有不同的同名类型定义
3. **简化维护**: 不需要维护一个庞大的共享类型库
4. **提高编译速度**: 减少类型检查的复杂度
