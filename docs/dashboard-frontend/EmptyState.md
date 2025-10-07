# EmptyState 组件文档

## 概述

EmptyState 是一个通用的空状态展示组件，用于在没有数据、搜索无结果或出现错误时提供友好的用户界面。

## 文件位置

- `src/components/EmptyState.tsx`

## 功能特性

✅ **预设类型**
- `default` - 默认空状态
- `no-data` - 无数据状态
- `search` - 搜索无结果
- `error` - 错误状态

✅ **灵活配置**
- 支持自定义图标、标题、描述
- 支持可选的操作按钮
- 响应式设计
- 支持暗黑模式

## 基本用法

### 1. 使用预设类型

```tsx
import EmptyState from '../components/EmptyState';

// 无数据状态
<EmptyState type="no-data" />

// 搜索无结果
<EmptyState type="search" />

// 错误状态
<EmptyState type="error" />
```

### 2. 自定义内容

```tsx
import EmptyState from '../components/EmptyState';
import { FileText } from 'lucide-react';

<EmptyState
  type="no-data"
  title="暂无文章"
  description="开始创建您的第一篇文章"
  action={{
    label: "创建文章",
    onClick: handleCreate
  }}
/>
```

### 3. 完全自定义

```tsx
import EmptyState from '../components/EmptyState';
import { CustomIcon } from 'lucide-react';

<EmptyState
  icon={<CustomIcon className="w-16 h-16 text-blue-500" />}
  title="自定义标题"
  description="自定义描述内容"
  action={{
    label: "自定义按钮",
    onClick: () => console.log('clicked')
  }}
/>
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `'default' \| 'search' \| 'error' \| 'no-data'` | `'default'` | 预设类型 |
| title | string | 根据 type 决定 | 标题文本 |
| description | string | 根据 type 决定 | 描述文本 |
| icon | ReactNode | 根据 type 决定 | 自定义图标 |
| action | { label: string, onClick: () => void } | undefined | 操作按钮配置 |
| className | string | `''` | 额外的 CSS 类名 |

### EmptyStateType 预设配置

| 类型 | 图标 | 标题 | 描述 | 使用场景 |
|------|------|------|------|----------|
| `default` | FileQuestion | 空空如也 | 这里什么也没有 | 通用空状态 |
| `no-data` | Inbox | 暂无内容 | 这里还没有任何内容 | 列表、表格无数据 |
| `search` | SearchX | 未找到搜索结果 | 尝试使用不同的关键词或筛选条件 | 搜索无结果 |
| `error` | AlertCircle | 出现了一些问题 | 抱歉，无法加载内容。请稍后重试。 | 加载错误 |

## 使用场景

### 场景 1: 列表页面无数据

```tsx
function PostsPage() {
  const { data, isLoading } = useQuery('posts', fetchPosts);

  if (isLoading) return <Loading />;
  
  if (!data || data.length === 0) {
    return (
      <EmptyState
        type="no-data"
        title="暂无文章"
        description="开始创建您的第一篇文章"
        action={{
          label: "创建文章",
          onClick: () => navigate('/posts/new')
        }}
      />
    );
  }

  return <PostsList data={data} />;
}
```

### 场景 2: 搜索无结果

```tsx
function SearchResults({ query, results }) {
  if (results.length === 0) {
    return (
      <EmptyState
        type="search"
        title={`未找到"${query}"的相关结果`}
        description="尝试使用不同的关键词或筛选条件"
      />
    );
  }

  return <ResultsList results={results} />;
}
```

### 场景 3: 错误状态

```tsx
function DataView() {
  const { data, error, refetch } = useQuery('data', fetchData);

  if (error) {
    return (
      <EmptyState
        type="error"
        action={{
          label: "重新加载",
          onClick: refetch
        }}
      />
    );
  }

  return <DataDisplay data={data} />;
}
```

### 场景 4: 开发中功能

```tsx
function UpcomingFeature() {
  return (
    <div className="card">
      <div className="card-body">
        <EmptyState
          type="no-data"
          title="功能开发中"
          description="我们正在努力开发这个功能，敬请期待。"
        />
      </div>
    </div>
  );
}
```

## 样式自定义

### 1. 使用 className

```tsx
<EmptyState
  type="no-data"
  className="min-h-[400px]"
/>
```

### 2. 自定义图标样式

```tsx
import { Heart } from 'lucide-react';

<EmptyState
  icon={<Heart className="w-20 h-20 text-pink-500" />}
  title="收藏夹是空的"
  description="开始收藏你喜欢的内容"
/>
```

## 最佳实践

### 1. 提供操作引导

始终为用户提供下一步操作的指引：

```tsx
// ✅ 好的实践
<EmptyState
  type="no-data"
  title="暂无项目"
  description="创建第一个项目开始工作"
  action={{
    label: "创建项目",
    onClick: handleCreate
  }}
/>

// ❌ 不好的实践
<EmptyState
  type="no-data"
  title="没有项目"
/>
```

### 2. 使用合适的类型

根据实际情况选择最合适的预设类型：

```tsx
// 数据为空
<EmptyState type="no-data" />

// 搜索无结果
<EmptyState type="search" />

// 加载错误
<EmptyState type="error" />
```

### 3. 提供清晰的描述

描述应该告诉用户为什么是空的以及如何改变：

```tsx
<EmptyState
  type="search"
  title="未找到搜索结果"
  description="尝试使用不同的关键词，或检查拼写是否正确"
/>
```

## 可访问性

EmptyState 组件已考虑可访问性：

- ✅ 使用语义化的 HTML 结构
- ✅ 图标包含适当的 ARIA 标签
- ✅ 按钮具有清晰的文本标签
- ✅ 支持键盘导航

## 响应式设计

组件已针对不同屏幕尺寸优化：

- 📱 移动端：图标和文字适当缩小
- 💻 桌面端：完整的图标和描述
- 🎨 自适应的间距和布局

## 与其他组件配合

### 与 Card 组件

```tsx
<div className="card">
  <div className="card-body">
    <EmptyState type="no-data" />
  </div>
</div>
```

### 与 Loading 组件

```tsx
function DataView() {
  if (isLoading) return <LoadingSpinner />;
  if (!data?.length) return <EmptyState type="no-data" />;
  return <DataList data={data} />;
}
```

## 示例集合

### 完整示例：文章列表页

```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '../components/EmptyState';
import { FileText } from 'lucide-react';

function PostsPage() {
  const { data: posts, isLoading, error, refetch } = useQuery(
    'posts',
    fetchPosts
  );
  const navigate = useNavigate();

  // 加载中
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 错误状态
  if (error) {
    return (
      <div className="container py-6">
        <EmptyState
          type="error"
          title="加载失败"
          description="无法加载文章列表，请稍后重试"
          action={{
            label: "重新加载",
            onClick: refetch
          }}
        />
      </div>
    );
  }

  // 空数据
  if (!posts || posts.length === 0) {
    return (
      <div className="container py-6">
        <div className="card">
          <div className="card-body">
            <EmptyState
              type="no-data"
              title="还没有文章"
              description="开始创建您的第一篇文章，分享您的想法"
              action={{
                label: "创建文章",
                onClick: () => navigate('/posts/new')
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 有数据
  return (
    <div className="container py-6">
      <PostsList posts={posts} />
    </div>
  );
}
```

## 版本历史

- **v1.0.0** (2025-10-07) - 初始版本，参考 portfolio-frontend 标准实现
  - 支持 4 种预设类型
  - 支持完全自定义
  - 响应式设计和暗黑模式支持
