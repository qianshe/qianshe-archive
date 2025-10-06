// Dashboard管理端React相关类型定义

// 用户基础类型
export interface User {
  id: string | number;
  username: string;
  email?: string;
  avatar?: string;
  role: string;
  name?: string;
  display_name?: string;
  createdAt?: string;
  updatedAt?: string;
}

// React组件Props类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Context类型定义
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User | null }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REFRESH_TOKEN'; payload: User };

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Theme Context类型
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
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

// 表格Props基础类型
export interface BaseTableProps<T> extends BaseComponentProps {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
    fixed?: 'left' | 'right';
  }>;
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (record: T, index: number) => void;
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
  };
}

// 表单Props基础类型
export interface BaseFormProps<T = Record<string, unknown>> extends BaseComponentProps {
  initialValues?: T;
  onSubmit: (values: T) => void | Promise<void>;
  onReset?: () => void;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'inline';
  validateOnChange?: boolean;
}

// 下拉选择Props基础类型
export interface BaseSelectProps<T> extends BaseComponentProps {
  value?: T;
  options: Array<{
    value: T;
    label: string;
    disabled?: boolean;
    group?: string;
  }>;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: string;
  multiple?: boolean;
  maxTagCount?: number;
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
  loading?: boolean;
}

// 分页Props基础类型
export interface BasePaginationProps extends BaseComponentProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize?: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  simple?: boolean;
}

// 标签页Props基础类型
export interface BaseTabsProps extends BaseComponentProps {
  activeKey: string;
  onChange: (key: string) => void;
  items: Array<{
    key: string;
    label: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    closable?: boolean;
  }>;
  size?: 'small' | 'middle' | 'large';
  type?: 'line' | 'card' | 'editable-card';
}

// 统计卡片Props类型
export interface StatCardProps extends BaseComponentProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
  error?: string;
  color?: string;
  icon?: React.ReactNode;
}

// 数据表格Props类型
export interface DataTableProps<T> extends BaseTableProps<T> {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchableFields?: (keyof T)[];
  filters?: Array<{
    key: keyof T;
    label: string;
    options: Array<{
      label: string;
      value: string | number | boolean;
    }>;
  }>;
  actions?: Array<{
    label: string;
    key: string;
    onClick: (record: T) => void;
    danger?: boolean;
    icon?: React.ReactNode;
  }>;
  bulkActions?: Array<{
    label: string;
    key: string;
    onClick: (selectedRows: T[]) => void;
    danger?: boolean;
    icon?: React.ReactNode;
  }>;
}

// 侧边栏Props类型
export interface SidebarProps extends BaseComponentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  items: Array<{
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    href?: string;
    children?: Array<{
      key: string;
      label: React.ReactNode;
      icon?: React.ReactNode;
      href?: string;
    }>;
    roles?: string[];
  }>;
  activeKey?: string;
  openKeys?: string[];
  onOpenChange?: (keys: string[]) => void;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
}

// 页面头Props类型
export interface PageHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{
    title: string;
    href?: string;
  }>;
  extra?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  ghost?: boolean;
}

// 通知Props类型
export interface NotificationProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  showProgress?: boolean;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

// 文件类型定义
export interface UploadFile {
  name: string;
  url: string;
  size: number;
  type: string;
  status: 'uploading' | 'done' | 'error';
  originFileObj?: File;
  response?: unknown;
}

// 上传请求选项
export interface UploadRequestOptions {
  action: string;
  file: File;
  filename: string;
  headers?: Record<string, string>;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: unknown) => void;
  onError?: (error: Error) => void;
}

// 文件上传Props类型
export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  disabled?: boolean;
  loading?: boolean;
  fileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => void;
  customRequest?: (options: UploadRequestOptions) => void;
}

// 富文本编辑器Props类型
export interface RichTextEditorProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  toolbar?: string[];
  disabled?: boolean;
  height?: number;
  minHeight?: number;
  maxLength?: number;
  showCharCount?: boolean;
}

// 日期选择器Props类型
export interface DatePickerProps extends BaseComponentProps {
  value?: string | Date;
  onChange?: (value: string | Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: string;
  showTime?: boolean;
  disabledDate?: (date: Date) => boolean;
  ranges?: Record<string, [Date, Date]>;
}

// 树节点类型
export interface TreeNode {
  title: string;
  key: string;
  value: string;
  children?: TreeNode[];
  disabled?: boolean;
  checkable?: boolean;
}

// 树形选择器Props类型
export interface TreeSelectProps extends BaseComponentProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  treeData: TreeNode[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  showCheckedStrategy?: 'SHOW_CHILD' | 'SHOW_PARENT';
}

// 验证规则类型
export interface ValidationRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  validator?: (value: unknown) => boolean | string | Promise<boolean | string>;
}

// 表单字段Props类型
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  rules?: ValidationRule[];
  tooltip?: string;
  extra?: string;
  colon?: boolean;
}

// 数据导出Props类型
export interface ExportProps extends BaseComponentProps {
  data: any[];
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: string;
    render?: (value: any, record: any) => any;
  }>;
  filename?: string;
  type?: 'csv' | 'excel' | 'json';
  disabled?: boolean;
  loading?: boolean;
  onExport?: () => void;
}