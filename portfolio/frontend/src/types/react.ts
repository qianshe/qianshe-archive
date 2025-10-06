// React相关类型定义

// React组件Props类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 带有ID的组件Props
export interface ComponentWithId extends BaseComponentProps {
  id: string;
}

// 表单输入Props基础类型
export interface BaseInputProps extends BaseComponentProps {
  name: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
}

// 按钮Props基础类型
export interface BaseButtonProps extends BaseComponentProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  href?: string;
  target?: string;
}

// 模态框Props基础类型
export interface BaseModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

// 卡片Props基础类型
export interface BaseCardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// 列表Props基础类型
export interface BaseListProps<T> extends BaseComponentProps {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  empty?: React.ReactNode;
  error?: string;
  onRetry?: () => void;
}

// 分页Props基础类型
export interface BasePaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
}

// 搜索框Props基础类型
export interface BaseSearchProps extends BaseComponentProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  suggestions?: string[];
  showSuggestions?: boolean;
}

// 下拉选择Props基础类型
export interface BaseSelectProps<T> extends BaseComponentProps {
  value?: T;
  options: Array<{
    value: T;
    label: string;
    disabled?: boolean;
  }>;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: string;
}

// 图片Props基础类型
export interface BaseImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
  fallback?: string;
  onClick?: () => void;
}

// 链接Props基础类型
export interface BaseLinkProps extends BaseComponentProps {
  href: string;
  external?: boolean;
  prefetch?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  underlined?: boolean;
}

// 表格Props基础类型
export interface BaseTableProps<T> extends BaseComponentProps {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    render?: (value: unknown, record: T, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
  }>;
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: BasePaginationProps;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (record: T, index: number) => void;
}

// 通知/Toast Props基础类型
export interface BaseToastProps extends BaseComponentProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  showProgress?: boolean;
}

// 加载器Props基础类型
export interface BaseLoaderProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  overlay?: boolean;
  text?: string;
}

// 工具提示Props基础类型
export interface BaseTooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  arrow?: boolean;
}

// 标签页Props基础类型
export interface BaseTabsProps extends BaseComponentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    key: string;
    label: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  variant?: 'default' | 'pills' | 'underline';
}

// 面包屑Props基础类型
export interface BaseBreadcrumbProps extends BaseComponentProps {
  items: Array<{
    label: React.ReactNode;
    href?: string;
    active?: boolean;
  }>;
  separator?: React.ReactNode;
}

// 评分组件Props基础类型
export interface BaseRatingProps extends BaseComponentProps {
  value: number;
  max?: number;
  readonly?: boolean;
  precision?: number;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
  color?: string;
}