# 代码规范指南

## 📋 目录

- [编码风格](#编码风格)
- [命名规范](#命名规范)
- [代码组织](#代码组织)
- [错误处理](#错误处理)
- [注释规范](#注释规范)
- [性能优化](#性能优化)
- [安全规范](#安全规范)
- [测试规范](#测试规范)
- [提交规范](#提交规范)

## 🎨 编码风格

### JavaScript/TypeScript

#### 基本规则
- 使用2个空格缩进
- 使用单引号
- 语句结尾使用分号
- 最大行长度：100字符
- 对象、数组的最后一个元素不加逗号

```typescript
// ✅ 推荐
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

// ❌ 避免
const user = {
    id: 1,
    name: "John",
    email: "john@example.com",
}
```

#### 变量声明
- 优先使用 `const`，其次是 `let`
- 避免使用 `var`
- 变量名使用驼峰命名法

```typescript
// ✅ 推荐
const userName = 'John';
let userAge = 25;
const MAX_RETRIES = 3;

// ❌ 避免
var username = "John";
var UserAge = 25;
var max_retries = 3;
```

#### 函数声明
- 使用箭头函数
- 函数名使用驼峰命名法
- 参数和返回值要有明确的类型

```typescript
// ✅ 推荐
interface User {
  id: number;
  name: string;
}

const getUserById = (id: number): User => {
  return {
    id,
    name: 'John Doe'
  };
};

// ❌ 避免
function getUserById(id) {
  return {
    id: id,
    name: "John Doe"
  };
}
```

#### 组件规范（React）
- 组件名使用帕斯卡命名法
- 使用函数组件和hooks
- 明确的props类型定义

```typescript
// ✅ 推荐
interface UserCardProps {
  user: User;
  onClick?: () => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick, className }) => {
  return (
    <div className={`user-card ${className}`} onClick={onClick}>
      <h3>{user.name}</h3>
      <p>ID: {user.id}</p>
    </div>
  );
};

// ❌ 避免
function UserCard(props) {
  return (
    <div className="user-card" onClick={props.onClick}>
      <h3>{props.user.name}</h3>
    </div>
  );
}
```

### CSS/SCSS

#### 命名规范
- 使用kebab-case命名类名
- 使用BEM命名规范
- 避免使用ID选择器

```scss
// ✅ 推荐
.user-card {
  padding: 16px;
  border-radius: 8px;

  &__title {
    font-size: 18px;
    font-weight: bold;
  }

  &--active {
    background-color: #e3f2fd;
  }
}

// ❌ 避免
.userCard {
  padding: 16px;
}

#userCardTitle {
  font-size: 18px;
}
```

#### 响应式设计
- 使用移动优先的断点
- 使用相对单位（rem, em, %）

```scss
// ✅ 推荐
.container {
  width: 100%;
  padding: 1rem;

  @media (min-width: 768px) {
    max-width: 1200px;
    margin: 0 auto;
  }
}

// ❌ 避免
.container {
  width: 1200px;
  margin: 0 auto;

  @media (max-width: 767px) {
    width: 100%;
  }
}
```

## 📝 命名规范

### 文件命名
- 组件文件：`PascalCase.tsx` 或 `PascalCase.jsx`
- 工具函数：`camelCase.ts` 或 `camelCase.js`
- 常量文件：`constants.ts`
- 类型定义：`types.ts` 或 `*.types.ts`

```
// ✅ 推荐
components/
├── UserCard.tsx
├── Button.tsx
├── Form/
│   ├── Input.tsx
│   ├── Select.tsx
│   └── Form.types.ts
utils/
├── formatDate.ts
├── validateEmail.ts
└── constants.ts

// ❌ 避免
components/
├── usercard.tsx
├── button.js
├── Form/
│   ├── input.tsx
│   ├── select.tsx
```

### 变量和函数命名
- 变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 函数：`camelCase`
- 类：`PascalCase`
- 私有成员：`_camelCase`

```typescript
// ✅ 推荐
const MAX_CONNECTIONS = 10;
const apiUrl = 'https://api.example.com';

class UserService {
  private _userRepository: UserRepository;

  public getUserById(id: number): User {
    return this._userRepository.findById(id);
  }

  private validateUser(user: User): boolean {
    return !!user.id;
  }
}

// ❌ 避免
const max_connections = 10;
const API_URL = 'https://api.example.com';

class userService {
  userRepository: UserRepository;

  GetUserById(id) {
    return this.userRepository.FindById(id);
  }
}
```

## 🗂️ 代码组织

### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── layout/         # 布局组件
│   └── forms/          # 表单组件
├── pages/              # 页面组件
├── hooks/              # 自定义hooks
├── utils/              # 工具函数
├── types/              # 类型定义
├── services/           # API服务
├── store/              # 状态管理
├── styles/             # 样式文件
└── constants/          # 常量定义
```

### 导入顺序
```typescript
// ✅ 推荐的导入顺序
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 第三方库
import { Button } from 'antd';
import axios from 'axios';

// 内部组件和工具
import { UserCard } from '@/components/ui/UserCard';
import { formatDate } from '@/utils/formatDate';
import { API_BASE_URL } from '@/constants';

// 类型定义
import type { User } from '@/types';

// 样式文件
import './UserPage.module.scss';
```

### 组件结构
```typescript
// ✅ 推荐的组件结构
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  useEffect(() => {
    // Side effects
  }, [user.id]);

  // 事件处理函数
  const handleEdit = () => {
    onEdit?.(user);
  };

  // 渲染逻辑
  return (
    <div className={`user-profile ${className}`}>
      <div className="user-profile__header">
        <h2>{user.name}</h2>
        <button onClick={handleEdit}>编辑</button>
      </div>
      <div className="user-profile__content">
        <p>Email: {user.email}</p>
        <p>加入时间: {formatDate(user.createdAt)}</p>
      </div>
    </div>
  );
};

export default UserProfile;
```

## 🚨 错误处理

### 异步操作
```typescript
// ✅ 推荐的错误处理
const fetchUserData = async (userId: number): Promise<User> => {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 处理HTTP错误
      throw new Error(`Failed to fetch user: ${error.response?.data?.message}`);
    }
    // 处理其他错误
    throw new Error('Network error occurred');
  }
};

// 使用示例
const loadUser = async () => {
  try {
    const user = await fetchUserData(1);
    setUser(user);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

### 边界条件检查
```typescript
// ✅ 推荐的边界条件检查
const processUserData = (user: User | null | undefined): ProcessedUser => {
  // 检查null或undefined
  if (!user) {
    throw new Error('User data is required');
  }

  // 检查必需字段
  if (!user.id || !user.email) {
    throw new Error('User ID and email are required');
  }

  // 检查数据类型
  if (typeof user.age !== 'number' || user.age < 0) {
    throw new Error('Invalid user age');
  }

  return {
    ...user,
    displayName: `${user.firstName} ${user.lastName}`,
    isAdult: user.age >= 18
  };
};
```

## 💬 注释规范

### 什么时候添加注释
- 解释复杂业务逻辑
- 说明算法的实现思路
- 标记已知问题或TODO
- 解释为什么选择某种实现方式

```typescript
// ✅ 推荐的注释方式

/**
 * 根据用户ID获取用户信息
 *
 * 该函数会从缓存中查找用户信息，如果缓存不存在，
 * 则从API获取并更新缓存。缓存有效期为5分钟。
 *
 * @param userId - 用户ID
 * @returns Promise<User> 用户信息
 * @throws {Error} 当用户不存在或网络错误时抛出异常
 */
const getUserWithCache = async (userId: number): Promise<User> => {
  const cacheKey = `user_${userId}`;
  const cached = cache.get(cacheKey);

  if (cached && !isCacheExpired(cached.timestamp)) {
    return cached.data;
  }

  // TODO: 添加重试逻辑，提高网络请求的可靠性
  const user = await fetchUserFromAPI(userId);
  cache.set(cacheKey, {
    data: user,
    timestamp: Date.now()
  });

  return user;
};

// 算法说明
// 使用快速排序算法对用户数组进行排序
// 时间复杂度: O(n log n)
// 空间复杂度: O(log n)
const sortUsers = (users: User[], sortBy: keyof User): User[] => {
  if (users.length <= 1) return users;

  const pivot = users[0];
  const left = users.slice(1).filter(user => user[sortBy] < pivot[sortBy]);
  const right = users.slice(1).filter(user => user[sortBy] >= pivot[sortBy]);

  return [...sortUsers(left, sortBy), pivot, ...sortUsers(right, sortBy)];
};
```

### 避免的注释
```typescript
// ❌ 避免的注释方式

// 不必要的注释
const name = 'John'; // 设置name为John

// 代码即文档的情况
// 如果变量名和函数名足够清晰，不需要注释
const getUserData = (userId: number) => {
  return api.get('/users/' + userId); // 获取用户数据
};
```

## ⚡ 性能优化

### 组件优化
```typescript
// ✅ 使用React.memo避免不必要的重渲染
const UserCard = React.memo(({ user, onClick }: UserCardProps) => {
  return (
    <div className="user-card" onClick={onClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// ✅ 使用useCallback缓存函数引用
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleEdit = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return (
    <UserCard user={user} onClick={handleEdit} />
  );
};

// ✅ 使用useMemo缓存计算结果
const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  const activeUsers = useMemo(() => {
    return users.filter(user => user.isActive);
  }, [users]);

  return (
    <div>
      {activeUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

### 代码分割
```typescript
// ✅ 使用React.lazy进行代码分割
const UserProfile = React.lazy(() => import('./UserProfile'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile />
    </Suspense>
  );
};
```

## 🔒 安全规范

### 输入验证
```typescript
// ✅ 输入验证和清理
const sanitizeInput = (input: string): string => {
  // 移除HTML标签
  return input.replace(/<[^>]*>/g, '');
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const processFormSubmit = (formData: FormData) => {
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!validateEmail(email)) {
    throw new Error('Invalid email address');
  }

  const sanitizedMessage = sanitizeInput(message);

  // 处理表单提交
  submitForm({
    email,
    message: sanitizedMessage
  });
};
```

### API安全
```typescript
// ✅ 使用HTTPS和安全的HTTP头
const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// ✅ 避免在代码中硬编码敏感信息
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// ❌ 避免
const API_KEY = 'sk-1234567890abcdef';
const DATABASE_URL = 'postgresql://user:password@localhost:5432/db';
```

## 🧪 测试规范

### 单元测试
```typescript
// ✅ 使用Jest和React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };

  const mockOnClick = jest.fn();

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<UserCard user={mockUser} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnClick).toHaveBeenCalledWith(mockUser);
  });

  it('applies custom className', () => {
    render(<UserCard user={mockUser} className="custom-class" />);

    const card = screen.getByText('John Doe').closest('.user-card');
    expect(card).toHaveClass('custom-class');
  });
});
```

### 集成测试
```typescript
// ✅ 测试组件间的交互
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from './UserList';
import { UserService } from '../services/UserService';

jest.mock('../services/UserService');

describe('UserList Integration', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(() => {
    (UserService.getUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  it('loads and displays users', async () => {
    render(<UserList />);

    // 初始加载状态
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    (UserService.getUsers as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });
});
```

## 📝 提交规范

### Git提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```bash
# ✅ 好的提交信息
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(ui): resolve button styling issue on mobile"
git commit -m "docs(api): update API documentation"
git commit -m "test(user): add unit tests for user service"

# ❌ 避免的提交信息
git commit -m "fix bug"
git commit -m "update"
git commit -m "working on feature"
```

### 提交前检查
```bash
# 运行所有质量检查
npm run quality-check

# 或者单独运行
npm run lint
npm run format
npm run type-check-all
npm run test
```

## 🛠️ 工具配置

### ESLint规则说明
- `no-unused-vars`: 禁止未使用的变量
- `no-console`: 限制console使用（允许warn和error）
- `prefer-const`: 优先使用const声明
- `react-hooks/rules-of-hooks`: 确保hooks使用规则
- `@typescript-eslint/no-explicit-any`: 避免使用any类型

### Prettier配置
- 使用单引号
- 2空格缩进
- 最大行长度100字符
- 对象/数组末尾不加逗号

### Pre-commit Hooks
项目配置了pre-commit hooks，确保每次提交前都运行：
- ESLint检查
- Prettier格式化
- TypeScript类型检查
- 单元测试
- 构建检查

## 📚 参考资料

- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [React官方文档](https://react.dev/)
- [ESLint文档](https://eslint.org/docs/latest/)
- [Prettier文档](https://prettier.io/docs/)
- [Jest测试框架](https://jestjs.io/docs/getting-started)

---

**注意**: 本规范文档会根据项目发展和技术演进进行更新。团队成员应定期查阅最新版本。