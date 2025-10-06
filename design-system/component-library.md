# 组件库设计方案

## Component Library Design

### 1. 组件架构概览

#### 组件分层结构

```
src/
├── components/
│   ├── foundation/          # 基础组件
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Tooltip/
│   │   └── Badge/
│   ├── layout/             # 布局组件
│   │   ├── Container/
│   │   ├── Grid/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   ├── content/            # 内容组件
│   │   ├── ArticleCard/
│   │   ├── ProjectCard/
│   │   ├── TagList/
│   │   ├── CommentSection/
│   │   └── SearchBar/
│   ├── navigation/         # 导航组件
│   │   ├── Navbar/
│   │   ├── Breadcrumb/
│   │   ├── Pagination/
│   │   └── TabNavigation/
│   ├── forms/              # 表单组件
│   │   ├── FormField/
│   │   ├── Textarea/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   ├── RadioGroup/
│   │   └── FileUpload/
│   └── admin/              # 管理端组件
│       ├── DataTable/
│       ├── MarkdownEditor/
│       ├── FileManager/
│       ├── AnalyticsCard/
│       └── BulkActions/
```

### 2. 基础组件设计

#### 2.1 Button 组件

**功能描述**：支持多种样式和状态的按钮组件

**API设计**：

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  onClick?: () => void;
  children: ReactNode;
}
```

**使用场景**：

- 文章发布/编辑
- 搜索和筛选
- 模态框操作
- 导航菜单项

#### 2.2 Card 组件

**功能描述**：内容卡片容器，支持多种布局模式

**API设计**：

```typescript
interface CardProps {
  variant: 'default' | 'outlined' | 'elevated' | 'glass';
  padding: 'none' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  image?: string;
  badge?: string;
  onClick?: () => void;
  children: ReactNode;
}
```

**使用场景**：

- 博客文章预览
- 项目展示卡片
- 评论卡片
- 统计数据展示

#### 2.3 Input 组件

**功能描述**：多种类型的输入框组件

**API设计**：

```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'search' | 'url';
  size: 'sm' | 'md' | 'lg';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: string;
  helper?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}
```

#### 2.4 Modal 组件

**功能描述**：模态框容器，支持多种尺寸和关闭方式

**API设计**：

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}
```

### 3. 布局组件设计

#### 3.1 Container 组件

**功能描述**：响应式容器，确保内容居中且有最大宽度限制

**API设计**：

```typescript
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean | 'sm' | 'md' | 'lg';
  centered?: boolean;
  fluid?: boolean;
  children: ReactNode;
}
```

#### 3.2 Grid 组件

**功能描述**：响应式栅格系统

**API设计**：

```typescript
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  children: ReactNode;
}
```

#### 3.3 Header 组件

**功能描述**：页面头部，包含导航和用户信息

**API设计**：

```typescript
interface HeaderProps {
  transparent?: boolean;
  sticky?: boolean;
  showSearch?: boolean;
  userMenu?: boolean;
  navigation?: NavigationItem[];
  logo?: string;
  theme?: 'light' | 'dark';
}
```

### 4. 内容组件设计

#### 4.1 ArticleCard 组件

**功能描述**：博客文章预览卡片

**API设计**：

```typescript
interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    cover?: string;
    publishedAt: string;
    readingTime: number;
    tags: string[];
    author: {
      name: string;
      avatar?: string;
    };
    stats?: {
      views: number;
      likes: number;
      comments: number;
    };
  };
  variant: 'default' | 'compact' | 'featured';
  showMeta?: boolean;
  showStats?: boolean;
  onClick?: (id: string) => void;
}
```

#### 4.2 ProjectCard 组件

**功能描述**：项目展示卡片

**API设计**：

```typescript
interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    technologies: string[];
    status: 'completed' | 'in-progress' | 'planned';
    links: {
      demo?: string;
      github?: string;
      docs?: string;
    };
  };
  variant: 'default' | 'detailed' | 'minimal';
  showTechnologies?: boolean;
  showLinks?: boolean;
}
```

#### 4.3 CommentSection 组件

**功能描述**：评论系统组件

**API设计**：

```typescript
interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  onCommentSubmit: (comment: NewComment) => void;
  onReply: (parentId: string, comment: NewComment) => void;
  onLike: (commentId: string) => void;
  loading?: boolean;
  allowNested?: boolean;
  maxDepth?: number;
}
```

### 5. 导航组件设计

#### 5.1 Navbar 组件

**功能描述**：主导航栏，支持响应式折叠

**API设计**：

```typescript
interface NavbarProps {
  items: NavigationItem[];
  logo?: string;
  transparent?: boolean;
  sticky?: boolean;
  mobileMenu?: boolean;
  searchEnabled?: boolean;
  user?: User;
  onMenuToggle?: () => void;
}
```

#### 5.2 TabNavigation 组件

**功能描述**：标签页导航

**API设计**：

```typescript
interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant: 'default' | 'underline' | 'pills';
  size?: 'sm' | 'md' | 'lg';
}
```

### 6. 表单组件设计

#### 6.1 FormField 组件

**功能描述**：表单字段容器，包含标签、输入和错误提示

**API设计**：

```typescript
interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: string;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}
```

#### 6.2 MarkdownEditor 组件

**功能描述**：Markdown编辑器，支持实时预览

**API设计**：

```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  preview?: boolean;
  toolbar?: boolean;
  height?: string;
  placeholder?: string;
  imageUpload?: (file: File) => Promise<string>;
}
```

#### 6.3 FileUpload 组件

**功能描述**：文件上传组件，支持拖拽和多文件

**API设计**：

```typescript
interface FileUploadProps {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  dragDrop?: boolean;
  preview?: boolean;
  onUpload: (files: File[]) => void;
  onProgress?: (progress: number) => void;
}
```

### 7. 管理端组件设计

#### 7.1 DataTable 组件

**功能描述**：数据表格，支持排序、筛选和分页

**API设计**：

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRows: T[];
    onSelectionChange: (rows: T[]) => void;
  };
  actions?: ActionItem<T>[];
  sortable?: boolean;
  filterable?: boolean;
}
```

#### 7.2 AnalyticsCard 组件

**功能描述**：分析数据卡片

**API设计**：

```typescript
interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  chart?: {
    type: 'line' | 'bar' | 'area';
    data: ChartDataPoint[];
  };
  icon?: ReactNode;
  loading?: boolean;
}
```

### 8. 复合组件设计

#### 8.1 BlogList 组件

**功能描述**：博客文章列表，包含筛选和搜索

**API设计**：

```typescript
interface BlogListProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  selectedCategory?: string;
  selectedTags?: string[];
  searchQuery?: string;
  sortBy?: 'date' | 'popularity' | 'title';
  sortOrder?: 'asc' | 'desc';
  loading?: boolean;
  onFilterChange: (filters: BlogFilters) => void;
  onArticleClick: (id: string) => void;
}
```

#### 8.2 ProjectGallery 组件

**功能描述**：项目展示画廊

**API设计**：

```typescript
interface ProjectGalleryProps {
  projects: Project[];
  filter: {
    technologies: string[];
    status: string[];
    sortBy: string;
  };
  viewMode: 'grid' | 'list' | 'masonry';
  loading?: boolean;
  onFilterChange: (filter: ProjectFilter) => void;
  onProjectClick: (id: string) => void;
}
```

### 9. 组件状态管理

#### 9.1 状态类型

```typescript
// 组件通用状态
type ComponentState = 'idle' | 'loading' | 'success' | 'error';

// 异步操作状态
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// 分页状态
type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
```

#### 9.2 事件处理

```typescript
// 通用事件处理器
interface EventHandler {
  onClick?: (event: MouseEvent) => void;
  onChange?: (value: any) => void;
  onSubmit?: (data: any) => void;
  onError?: (error: Error) => void;
}

// 自定义事件
interface CustomEvents {
  onFilter?: (filters: FilterOptions) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
}
```

### 10. 组件复用策略

#### 10.1 设计模式

- **组合模式**：基础组件组合成复杂组件
- **渲染属性模式**：灵活的内容渲染
- **高阶组件模式**：功能增强和复用
- **Context模式**：跨组件状态共享

#### 10.2 主题系统

```typescript
interface Theme {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  borderRadius: BorderRadiusSystem;
  shadows: ShadowSystem;
  animations: AnimationSystem;
}

// 主题提供者
const ThemeProvider: React.FC<{
  theme: Theme;
  children: ReactNode;
}>;
```

#### 10.3 组件文档

每个组件都需要包含：

- API文档
- 使用示例
- 设计指导
- 可访问性说明
- 性能注意事项

### 11. 性能优化考虑

#### 11.1 代码分割

- 按路由分割组件
- 懒加载重型组件
- 动态导入第三方库

#### 11.2 渲染优化

- React.memo包装纯组件
- useMemo缓存计算结果
- useCallback缓存函数引用
- 虚拟化长列表

#### 11.3 包大小优化

- Tree-shaking未使用代码
- 外部依赖优化
- 图片资源优化
- 字体子集化
