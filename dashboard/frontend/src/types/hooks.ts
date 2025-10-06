// Dashboard管理端Hook相关类型定义

// useQuery Hook配置类型
export interface UseQueryConfig<T = any, E = Error> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  retry?: boolean | number;
  retryDelay?: number | ((attemptIndex: number) => number);
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number | false;
  select?: (data: T) => any;
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | undefined, error: E | null) => void;
}

// useMutation Hook配置类型
export interface UseMutationConfig<T = any, V = any, E = Error> {
  mutationFn: (variables: V) => Promise<T>;
  onMutate?: (variables: V) => Promise<any> | any;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: E, variables: V) => void;
  onSettled?: (data: T | undefined, error: E | null, variables: V) => void;
  retry?: boolean | number;
  retryDelay?: number | ((attemptIndex: number) => number);
}

// useInfiniteQuery Hook配置类型
export interface UseInfiniteQueryConfig<T = any> {
  queryKey: string[];
  queryFn: ({ pageParam }: { pageParam: unknown }) => Promise<T>;
  enabled?: boolean;
  getNextPageParam?: (lastPage: T, allPages: T[]) => unknown;
  getPreviousPageParam?: (firstPage: T, allPages: T[]) => unknown;
  retry?: boolean | number;
  retryDelay?: number | ((attemptIndex: number) => number);
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  select?: (data: { pages: T[]; pageParams: unknown[] }) => any;
}

// Hook返回值类型
export interface QueryResult<T = any, E = Error> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: E | null;
  refetch: () => void;
}

export interface MutationResult<T = unknown, E = Error, V = Record<string, unknown>> {
  data: T | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: E | null;
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  reset: () => void;
}

export interface InfiniteQueryResult<T = unknown, E = Error> {
  data: { pages: T[]; pageParams: unknown[] } | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: E | null;
  hasNextPage: boolean | undefined;
  hasPreviousPage: boolean | undefined;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  refetch: () => void;
}

// 表单Hook相关类型
export interface UseFormConfig<T extends Record<string, unknown>> {
  initialValues: T;
  validationSchema?: unknown; // Yup or Zod schema
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

export interface UseFormResult<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent) => void;
  handleBlur: (field: keyof T) => (e: React.FocusEvent) => void;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  resetForm: () => void;
  validateForm: () => Promise<boolean>;
  validateField: (field: keyof T) => Promise<boolean>;
}

// 表格Hook相关类型
export interface UseTableConfig<T> {
  data: T[];
  columns: TableColumnConfig<T>[];
  pagination?: {
    pageSize: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  selection?: {
    type: 'checkbox' | 'radio';
    onSelect?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  };
  sorting?: {
    sortDirections?: ('ascend' | 'descend')[];
    onSort?: (field: keyof T, direction: 'ascend' | 'descend') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilter?: (filters: Record<string, any>) => void;
  };
  searching?: {
    searchable?: boolean;
    searchableFields?: (keyof T)[];
    onSearch?: (query: string) => void;
  };
}

export interface TableColumnConfig<T> {
  key: keyof T;
  title: string;
  dataIndex?: keyof T;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
  width?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: Array<{ text: string; value: string | number | boolean }>;
  filterMultiple?: boolean;
  filterDropdown?: React.ReactNode;
  ellipsis?: boolean;
  hidden?: boolean;
}

export interface UseTableResult<T> {
  data: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
    onShowSizeChange: (current: number, size: number) => void;
  };
  selection: {
    selectedRowKeys: string[];
    selectedRows: T[];
    onSelect: (record: T, selected: boolean, selectedRows: T[]) => void;
    onSelectAll: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
    clearSelection: () => void;
  };
  sorting: {
    field?: keyof T;
    direction?: 'ascend' | 'descend';
    onSort: (field: keyof T, direction?: 'ascend' | 'descend') => void;
  };
  filtering: {
    filters: Record<string, any>;
    onFilter: (filters: Record<string, any>) => void;
    clearFilters: () => void;
  };
  searching: {
    query: string;
    onSearch: (query: string) => void;
    clearSearch: () => void;
  };
  loading: boolean;
  error: string | null;
  refresh: () => void;
  reset: () => void;
}

// 模态框Hook相关类型
export interface UseModalConfig {
  title?: string;
  content?: React.ReactNode;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
  footer?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  afterClose?: () => void;
}

export interface UseModalResult {
  visible: boolean;
  showModal: () => void;
  hideModal: () => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// 通知Hook相关类型
export interface UseNotificationConfig {
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
  maxCount?: number;
  rtl?: boolean;
}

export interface UseNotificationResult {
  info: (message: string, description?: string, options?: NotificationOptions) => void;
  success: (message: string, description?: string, options?: NotificationOptions) => void;
  warning: (message: string, description?: string, options?: NotificationOptions) => void;
  error: (message: string, description?: string, options?: NotificationOptions) => void;
  loading: (message: string, description?: string, options?: NotificationOptions) => void;
  open: (config: NotificationConfig) => void;
  destroy: (key?: string) => void;
  destroyAll: () => void;
}

export interface NotificationOptions {
  duration?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  key?: string;
  style?: React.CSSProperties;
  className?: string;
}

export interface NotificationConfig {
  message: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading';
  duration?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  key?: string;
  style?: React.CSSProperties;
  className?: string;
}

// 权限Hook相关类型
export interface UsePermissionConfig {
  role?: string | string[];
  permissions?: string | string[];
  requireAll?: boolean;
}

export interface UsePermissionResult {
  hasRole: (role: string) => boolean;
  hasRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasPermissions: (permissions: string[]) => boolean;
  can: (action: string, resource: string) => boolean;
  isAuthorized: boolean;
}

// 主题Hook相关类型
export interface UseThemeConfig {
  defaultTheme?: 'light' | 'dark' | 'auto';
  storageKey?: string;
}

export interface UseThemeResult {
  theme: 'light' | 'dark' | 'auto';
  isDark: boolean;
  isLight: boolean;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
  resetTheme: () => void;
}

// 响应式Hook相关类型
export interface UseResponsiveConfig {
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
}

export interface UseResponsiveResult {
  screen: {
    xs: boolean;
    sm: boolean;
    md: boolean;
    lg: boolean;
    xl: boolean;
    xxl: boolean;
  };
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

// 导出Hook相关类型
export interface UseExportConfig<T> {
  data: T[];
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: keyof T;
    render?: (value: T[keyof T], record: T) => string | number;
  }>;
  filename?: string;
  type?: 'csv' | 'excel' | 'json';
}

export interface UseExportResult<T = unknown> {
  export: (config?: Partial<UseExportConfig<T>>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// 批量操作Hook相关类型
export interface UseBatchOperationConfig<T> {
  items: T[];
  getKey?: (item: T) => string;
  onSelectionChange?: (selectedItems: T[], selectedKeys: string[]) => void;
}

export interface UseBatchOperationResult<T> {
  selectedItems: T[];
  selectedKeys: string[];
  isSelected: (item: T) => boolean;
  toggleSelection: (item: T) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectSome: (items: T[]) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectionCount: number;
  toggleAll: () => void;
}