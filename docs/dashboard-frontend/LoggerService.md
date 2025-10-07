# LoggerService 文档

## 概述

LoggerService 是一个统一的日志记录服务，提供分级日志记录、内存缓存和可选的远程日志上报功能。

## 文件位置

- `src/services/loggerService.ts`

## 功能特性

✅ **分级日志**
- DEBUG - 调试信息
- INFO - 一般信息
- WARN - 警告信息
- ERROR - 错误信息

✅ **智能管理**
- 内存缓存最近 1000 条日志
- 可配置的日志级别过滤
- 自动环境适配（开发/生产）

✅ **扩展功能**
- 支持远程日志推送
- 日志导出功能
- 按级别筛选日志

## 基本用法

### 1. 记录日志

```tsx
import { loggerService } from '../services/loggerService';

// 调试日志
loggerService.debug('User data loaded', { userId: 123, time: Date.now() });

// 信息日志
loggerService.info('User logged in', { username: 'admin' });

// 警告日志
loggerService.warn('API response slow', { duration: 3000, endpoint: '/api/users' });

// 错误日志
loggerService.error('Request failed', { 
  error: error.message,
  endpoint: '/api/posts',
  status: 500
});
```

### 2. 配置日志服务

```tsx
import { loggerService, LogLevel } from '../services/loggerService';

// 配置日志服务
loggerService.configure({
  enabled: true,
  minLevel: LogLevel.INFO, // 只记录 INFO 及以上级别
  remote: true,
  remoteEndpoint: '/api/logs'
});
```

### 3. 查询日志

```tsx
// 获取所有日志
const allLogs = loggerService.getLogs();

// 获取指定级别的日志
const errorLogs = loggerService.getLogsByLevel(LogLevel.ERROR);
const warnLogs = loggerService.getLogsByLevel(LogLevel.WARN);

// 导出日志（用于下载或调试）
const logsJson = loggerService.exportLogs();
```

## API 参考

### 配置接口

```typescript
interface LoggerConfig {
  enabled: boolean;           // 是否启用日志
  minLevel: LogLevel;        // 最低日志级别
  remote: boolean;           // 是否发送到远程
  remoteEndpoint?: string;   // 远程日志端点
}
```

### 日志级别

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
```

### 主要方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| configure | config: Partial<LoggerConfig> | void | 配置日志服务 |
| debug | message: string, context?: object | void | 记录调试日志 |
| info | message: string, context?: object | void | 记录信息日志 |
| warn | message: string, context?: object | void | 记录警告日志 |
| error | message: string, context?: object | void | 记录错误日志 |
| getLogs | - | LogEntry[] | 获取所有日志 |
| getLogsByLevel | level: LogLevel | LogEntry[] | 获取指定级别日志 |
| clearLogs | - | void | 清空日志 |
| exportLogs | - | string | 导出日志 JSON |

## 使用场景

### 场景 1: 用户认证流程

```tsx
// AuthContext.tsx
import { loggerService } from '../services/loggerService';

const login = async (username: string, password: string) => {
  loggerService.info('Login attempt started', { username });
  
  try {
    const response = await authService.login(username, password);
    loggerService.info('Login successful', {
      username,
      userId: response.user.id
    });
    return response;
  } catch (error) {
    loggerService.error('Login failed', {
      username,
      error: error.message,
      status: error.response?.status
    });
    throw error;
  }
};
```

### 场景 2: API 请求监控

```tsx
// apiClient.ts
import { loggerService } from '../services/loggerService';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api'
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    loggerService.debug('API request', {
      method: config.method,
      url: config.url,
      timestamp: Date.now()
    });
    return config;
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    loggerService.debug('API response', {
      url: response.config.url,
      status: response.status,
      duration: Date.now() - response.config.metadata?.startTime
    });
    return response;
  },
  error => {
    loggerService.error('API error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);
```

### 场景 3: 性能监控

```tsx
// 监控组件渲染性能
function MyComponent() {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      if (duration > 1000) {
        loggerService.warn('Component render duration exceeded', {
          component: 'MyComponent',
          duration: Math.round(duration)
        });
      }
    };
  }, []);
  
  return <div>...</div>;
}
```

### 场景 4: 错误追踪

```tsx
// ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  loggerService.error('Component error caught', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack
  });
}
```

## 配置示例

### 开发环境配置

```tsx
// main.tsx or App.tsx
if (import.meta.env.DEV) {
  loggerService.configure({
    enabled: true,
    minLevel: LogLevel.DEBUG, // 显示所有级别
    remote: false             // 不发送到远程
  });
}
```

### 生产环境配置

```tsx
// main.tsx or App.tsx
if (import.meta.env.PROD) {
  loggerService.configure({
    enabled: true,
    minLevel: LogLevel.WARN,  // 只记录警告和错误
    remote: true,             // 发送到远程服务器
    remoteEndpoint: '/api/logs'
  });
}
```

### 自定义配置

```tsx
loggerService.configure({
  enabled: !import.meta.env.TEST, // 测试环境禁用
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  remote: import.meta.env.PROD,
  remoteEndpoint: import.meta.env.VITE_LOG_ENDPOINT
});
```

## 最佳实践

### 1. 合理使用日志级别

```tsx
// ✅ 好的实践
loggerService.debug('Fetching user data', { userId });     // 调试信息
loggerService.info('User profile updated', { userId });   // 重要操作
loggerService.warn('Cache miss', { key });                // 潜在问题
loggerService.error('Database query failed', { error });  // 严重错误

// ❌ 不好的实践
loggerService.error('Button clicked');  // 应该用 debug
loggerService.debug('Payment failed'); // 应该用 error
```

### 2. 提供有用的上下文

```tsx
// ✅ 好的实践
loggerService.error('API request failed', {
  endpoint: '/api/users',
  method: 'GET',
  status: 500,
  error: error.message,
  userId: currentUser?.id,
  timestamp: Date.now()
});

// ❌ 不好的实践
loggerService.error('Error occurred');
```

### 3. 避免敏感信息

```tsx
// ❌ 危险 - 不要记录敏感信息
loggerService.info('User logged in', {
  password: password,  // 绝对不要！
  creditCard: cardNumber
});

// ✅ 安全
loggerService.info('User logged in', {
  userId: user.id,
  username: user.username
});
```

### 4. 使用结构化日志

```tsx
// ✅ 结构化日志便于查询和分析
loggerService.error('Payment processing failed', {
  paymentId: 'pay_123',
  amount: 99.99,
  currency: 'USD',
  errorCode: 'INSUFFICIENT_FUNDS',
  userId: user.id
});

// ❌ 非结构化日志难以分析
loggerService.error(`Payment ${paymentId} failed for user ${userId}`);
```

## 与远程服务集成

### 后端 API 示例

```typescript
// Express.js 示例
app.post('/api/logs', (req, res) => {
  const { level, message, timestamp, context } = req.body;
  
  // 存储到数据库或日志服务
  await LogModel.create({
    level,
    message,
    timestamp,
    context,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  
  res.status(200).send({ success: true });
});
```

### 与第三方服务集成

```tsx
// 集成 Sentry
import * as Sentry from '@sentry/react';

class CustomLoggerService extends LoggerService {
  error(message: string, context?: Record<string, unknown>): void {
    super.error(message, context);
    
    // 同时发送到 Sentry
    Sentry.captureMessage(message, {
      level: 'error',
      extra: context
    });
  }
}
```

## 调试工具

### 在控制台查看日志

```tsx
// 在浏览器控制台执行
window.loggerService = loggerService;

// 查看所有日志
console.table(loggerService.getLogs());

// 查看错误日志
console.table(loggerService.getLogsByLevel('error'));

// 导出日志
console.log(loggerService.exportLogs());
```

### 下载日志文件

```tsx
function downloadLogs() {
  const logs = loggerService.exportLogs();
  const blob = new Blob([logs], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `logs-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

## 性能考虑

### 1. 日志限制

服务自动限制内存中只保存最近 1000 条日志，避免内存溢出。

### 2. 生产环境优化

```tsx
// 生产环境只记录重要日志
if (import.meta.env.PROD) {
  loggerService.configure({
    minLevel: LogLevel.WARN  // 跳过 DEBUG 和 INFO
  });
}
```

### 3. 批量上报

```tsx
// 避免频繁的网络请求
let logBuffer = [];

setInterval(() => {
  if (logBuffer.length > 0) {
    fetch('/api/logs/batch', {
      method: 'POST',
      body: JSON.stringify(logBuffer)
    });
    logBuffer = [];
  }
}, 30000); // 每30秒批量发送
```

## 故障排查

### 日志不显示

检查配置和日志级别：

```tsx
// 检查日志是否启用
console.log(loggerService.getConfig());

// 临时降低日志级别
loggerService.configure({ minLevel: LogLevel.DEBUG });
```

### 远程日志失败

检查网络和端点配置：

```tsx
// 查看浏览器 Network 标签
// 检查端点是否正确
loggerService.configure({
  remoteEndpoint: '/api/logs' // 确认路径正确
});
```

## 版本历史

- **v1.0.0** (2025-10-07) - 初始版本
  - 支持四个日志级别
  - 内存缓存 1000 条日志
  - 可选的远程日志推送
  - 完整的配置选项
