# ErrorBoundary 组件文档

## 概述

ErrorBoundary 是一个 React 错误边界组件，用于捕获子组件树中的 JavaScript 错误，防止整个应用崩溃，并提供友好的降级 UI。

## 文件位置

- `src/components/ErrorBoundary.tsx` - 主错误边界组件
- `src/components/ErrorFallback.tsx` - 默认错误降级 UI

## 功能特性

✅ **错误捕获**
- 捕获组件渲染期间的错误
- 捕获生命周期方法中的错误
- 捕获构造函数中的错误

✅ **友好的用户界面**
- 提供用户友好的错误提示
- 开发环境显示详细错误信息
- 提供"重新加载"和"返回首页"操作

✅ **灵活的配置**
- 支持自定义降级 UI
- 支持错误重置功能
- 保留错误日志便于调试

## 基本用法

### 1. 默认使用

```tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 2. 自定义降级 UI

```tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div>
          <h1>出错了！</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>重试</button>
        </div>
      )}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## API 参考

### ErrorBoundary Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| children | ReactNode | 是 | 需要保护的子组件 |
| fallback | (error: Error, resetError: () => void) => ReactNode | 否 | 自定义降级 UI |

### ErrorFallback Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| error | Error | 是 | 捕获的错误对象 |
| resetError | () => void | 是 | 重置错误状态的函数 |

## 使用场景

### 场景 1: 应用顶层保护

```tsx
// App.tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <Routes>{/* 路由配置 */}</Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### 场景 2: 路由级别保护

```tsx
// 为每个主要路由添加错误边界
<Routes>
  <Route
    path="/dashboard"
    element={
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    }
  />
  <Route
    path="/posts"
    element={
      <ErrorBoundary>
        <PostsPage />
      </ErrorBoundary>
    }
  />
</Routes>
```

### 场景 3: 关键组件保护

```tsx
// 保护可能出错的关键组件
function DataDashboard() {
  return (
    <div>
      <ErrorBoundary>
        <ComplexChart />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <DataTable />
      </ErrorBoundary>
    </div>
  );
}
```

## 注意事项

### ErrorBoundary 无法捕获的错误

❌ **不能捕获的错误类型:**
1. 事件处理器中的错误（使用 try-catch）
2. 异步代码中的错误（如 setTimeout、Promise）
3. 服务端渲染的错误
4. ErrorBoundary 自身抛出的错误

```tsx
// ❌ 错误 - 无法捕获
function MyComponent() {
  const handleClick = () => {
    throw new Error('Click error'); // 不会被捕获
  };
  
  useEffect(() => {
    setTimeout(() => {
      throw new Error('Async error'); // 不会被捕获
    }, 1000);
  }, []);
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确 - 使用 try-catch
function MyComponent() {
  const handleClick = () => {
    try {
      // 可能出错的代码
      riskyOperation();
    } catch (error) {
      console.error('Error:', error);
      // 处理错误
    }
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

## 最佳实践

### 1. 分层错误边界

建议在应用的不同层级设置错误边界：

```tsx
// 应用级别
<ErrorBoundary>
  <App />
</ErrorBoundary>

// 页面级别
<ErrorBoundary>
  <Page />
</ErrorBoundary>

// 组件级别
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>
```

### 2. 错误日志上报

在生产环境中，应该将错误上报到监控服务：

```tsx
// ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  
  // 上报到错误监控服务
  if (import.meta.env.PROD) {
    errorReportingService.log({
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }
}
```

### 3. 提供有意义的错误信息

开发环境应该显示详细信息，生产环境显示用户友好的消息：

```tsx
{import.meta.env.DEV ? (
  <div>
    <h3>错误详情：</h3>
    <p>{error.message}</p>
    <pre>{error.stack}</pre>
  </div>
) : (
  <p>应用遇到了一个错误，我们正在努力解决。</p>
)}
```

## 与其他工具集成

### 与 Sentry 集成

```tsx
import * as Sentry from '@sentry/react';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack
      }
    }
  });
}
```

### 与 LogRocket 集成

```tsx
import LogRocket from 'logrocket';

componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  LogRocket.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack
    }
  });
}
```

## 调试技巧

### 1. 使用 React DevTools

React DevTools 可以帮助定位错误发生的组件：

```
组件树 → 查找红色高亮的组件 → 检查 props 和 state
```

### 2. 查看完整堆栈

在开发环境中，点击"查看堆栈跟踪"可以看到完整的错误堆栈。

### 3. 禁用 ErrorBoundary 调试

开发时如果需要看到原始错误，可以临时禁用 ErrorBoundary：

```tsx
const ErrorBoundaryWrapper = import.meta.env.DEV && process.env.DISABLE_ERROR_BOUNDARY
  ? React.Fragment
  : ErrorBoundary;

<ErrorBoundaryWrapper>
  <App />
</ErrorBoundaryWrapper>
```

## 相关资源

- [React 官方文档 - Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry React 错误监控](https://docs.sentry.io/platforms/javascript/guides/react/)
- [LogRocket 错误追踪](https://docs.logrocket.com/docs/error-tracking)

## 版本历史

- **v1.0.0** (2025-10-07) - 初始版本，参考 portfolio-frontend 标准实现
  - 拆分为 ErrorBoundary 和 ErrorFallback
  - 支持自定义降级 UI
  - 开发环境显示详细错误信息
