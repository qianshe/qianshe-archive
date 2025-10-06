# 管理端界面设计规范

## Admin Interface Design Specification

### 1. 管理端设计理念

#### 1.1 设计原则

- **效率优先**：减少操作步骤，提高工作流程效率
- **信息密度**：在有限空间内展示更多有用信息
- **一致性**：与展示端保持视觉一致性，但有明确的功能区分
- **安全性**：重要操作需要确认，数据安全提示明确
- **可扩展性**：支持未来功能扩展的灵活架构

#### 1.2 视觉差异化

- **色调区分**：使用更深的背景色和更强烈的对比度
- **功能性强调**：突出操作按钮和数据展示区域
- **状态明确**：清晰的状态指示器和反馈机制
- **专业感**：体现后台管理的专业性和权威性

### 2. 管理端色彩系统

#### 2.1 扩展色彩调色板

```css
/* 管理端专属色彩 */
:root {
  /* 更深的背景层次 */
  --admin-bg-primary: #090c10; /* 管理端主背景 */
  --admin-bg-secondary: #0f1419; /* 管理端次要背景 */
  --admin-bg-tertiary: #161b22; /* 管理端第三层背景 */
  --admin-bg-elevated: #1c2128; /* 管理端浮层背景 */

  /* 功能性色彩 */
  --admin-success: #2da44e; /* 成功状态 */
  --admin-warning: #d29922; /* 警告状态 */
  --admin-error: #f85149; /* 错误状态 */
  --admin-info: #58a6ff; /* 信息状态 */

  /* 交互状态 */
  --admin-hover: #1f6feb20; /* 悬停状态 */
  --admin-active: #1f6feb30; /* 激活状态 */
  --admin-selected: #1f6feb15; /* 选中状态 */

  /* 边框系统 */
  --admin-border-light: #30363d; /* 浅边框 */
  --admin-border-medium: #21262d; /* 中等边框 */
  --admin-border-dark: #161b22; /* 深边框 */

  /* 文字层次 */
  --admin-text-primary: #f0f6fc; /* 主要文字 */
  --admin-text-secondary: #8b949e; /* 次要文字 */
  --admin-text-muted: #6e7681; /* 弱化文字 */
  --admin-text-disabled: #484f58; /* 禁用文字 */
}
```

#### 2.2 状态色彩系统

```css
/* 状态色彩 */
.status-success {
  color: var(--admin-success);
  background: rgba(45, 164, 78, 0.1);
  border: 1px solid rgba(45, 164, 78, 0.2);
}

.status-warning {
  color: var(--admin-warning);
  background: rgba(210, 153, 34, 0.1);
  border: 1px solid rgba(210, 153, 34, 0.2);
}

.status-error {
  color: var(--admin-error);
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.2);
}

.status-info {
  color: var(--admin-info);
  background: rgba(88, 166, 255, 0.1);
  border: 1px solid rgba(88, 166, 255, 0.2);
}

.status-pending {
  color: var(--admin-warning);
  background: rgba(210, 153, 34, 0.05);
  border: 1px solid rgba(210, 153, 34, 0.1);
}
```

### 3. 管理端布局架构

#### 3.1 整体布局结构

```typescript
// 管理端布局组件
export const AdminLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-admin-bg-primary text-admin-text-primary">
      {/* 顶部导航栏 */}
      <AdminHeader
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        {/* 侧边栏 */}
        <AdminSidebar collapsed={sidebarCollapsed} />

        {/* 主内容区 */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          {/* 面包屑导航 */}
          <AdminBreadcrumb />

          {/* 页面内容 */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

#### 3.2 侧边栏导航

```typescript
// 管理端侧边栏
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: <DashboardIcon />,
    href: '/admin',
  },
  {
    id: 'content',
    label: '内容管理',
    icon: <ContentIcon />,
    children: [
      { id: 'posts', label: '文章管理', icon: <PostIcon />, href: '/admin/posts' },
      { id: 'projects', label: '项目管理', icon: <ProjectIcon />, href: '/admin/projects' },
      { id: 'categories', label: '分类管理', icon: <CategoryIcon />, href: '/admin/categories' },
    ],
  },
  {
    id: 'comments',
    label: '评论管理',
    icon: <CommentIcon />,
    href: '/admin/comments',
    badge: 5,
  },
  {
    id: 'analytics',
    label: '数据分析',
    icon: <AnalyticsIcon />,
    href: '/admin/analytics',
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: <SettingsIcon />,
    href: '/admin/settings',
  },
];

export const AdminSidebar: React.FC<{
  collapsed: boolean;
}> = ({ collapsed }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-16 h-full bg-admin-bg-secondary border-r border-admin-border-dark transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      <nav className="p-4 space-y-2">
        {sidebarItems.map(item => (
          <SidebarItemComponent
            key={item.id}
            item={item}
            collapsed={collapsed}
            isExpanded={expandedItems.includes(item.id)}
            isActive={location.pathname === item.href}
            onToggleExpand={() => toggleExpanded(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
};

// 侧边栏项组件
const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  collapsed: boolean;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: () => void;
}> = ({ item, collapsed, isExpanded, isActive, onToggleExpand }) => {
  if (item.children) {
    return (
      <div>
        <button
          onClick={onToggleExpand}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            "hover:bg-admin-hover",
            isActive && "bg-admin-active text-admin-info"
          )}
        >
          {item.icon}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronIcon
                className={cn(
                  "w-4 h-4 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </>
          )}
        </button>

        {!collapsed && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map(child => (
              <Link
                key={child.id}
                to={child.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-admin-hover",
                  location.pathname === child.href && "bg-admin-active text-admin-info"
                )}
              >
                {child.icon}
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-admin-hover",
        isActive && "bg-admin-active text-admin-info"
      )}
    >
      {item.icon}
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="bg-admin-error text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};
```

### 4. 数据表格组件

#### 4.1 增强型数据表格

```typescript
// 数据表格接口
interface DataTableColumn<T> {
  key: keyof T;
  title: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
  };
  actions?: {
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: (record: T) => void;
    danger?: boolean;
  }[];
  onRowClick?: (record: T) => void;
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  actions,
  onRowClick,
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // 排序处理
  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 过滤处理
  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 数据处理
  const processedData = useMemo(() => {
    let result = [...data];

    // 排序
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 过滤
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item =>
          String(item[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return result;
  }, [data, sortConfig, filters]);

  return (
    <div className="bg-admin-bg-secondary rounded-xl border border-admin-border-medium overflow-hidden">
      {/* 表格头部 */}
      <div className="p-4 border-b border-admin-border-medium flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selection && (
            <Checkbox
              checked={selection.selectedRowKeys.length === data.length}
              onChange={(checked) => {
                if (checked) {
                  selection.onChange(data.map(item => item.id));
                } else {
                  selection.onChange([]);
                }
              }}
            />
          )}
          <span className="text-admin-text-secondary">
            {selection?.selectedRowKeys.length || 0} 项已选择
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions && selection?.selectedRowKeys.length > 0 && (
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  批量操作 <ChevronDownIcon className="w-4 h-4" />
                </Button>
              }
            >
              {actions.map(action => (
                <DropdownItem
                  key={action.key}
                  onClick={() => {
                    // 批量操作逻辑
                  }}
                  className={action.danger ? "text-admin-error" : ""}
                >
                  {action.icon}
                  {action.label}
                </DropdownItem>
              ))}
            </Dropdown>
          )}

          <Button variant="outline" size="sm" icon={<RefreshIcon />}>
            刷新
          </Button>
        </div>
      </div>

      {/* 表格内容 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border-medium">
              {selection && (
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selection.selectedRowKeys.length === data.length}
                    onChange={(checked) => {
                      if (checked) {
                        selection.onChange(data.map(item => item.id));
                      } else {
                        selection.onChange([]);
                      }
                    }}
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-admin-text-secondary font-medium"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="text-admin-text-muted hover:text-admin-text-secondary"
                      >
                        <SortIcon
                          className={cn(
                            "w-4 h-4",
                            sortConfig?.key === column.key && "text-admin-info"
                          )}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">操作</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-admin-border-medium">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <Skeleton height={20} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // 数据行
              processedData.map((record, index) => (
                <tr
                  key={record.id}
                  className={cn(
                    "border-b border-admin-border-medium hover:bg-admin-hover cursor-pointer transition-colors",
                    selection?.selectedRowKeys.includes(record.id) && "bg-admin-selected"
                  )}
                  onClick={() => onRowClick?.(record)}
                >
                  {selection && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selection.selectedRowKeys.includes(record.id)}
                        onChange={(checked) => {
                          if (checked) {
                            selection.onChange([...selection.selectedRowKeys, record.id]);
                          } else {
                            selection.onChange(
                              selection.selectedRowKeys.filter(id => id !== record.id)
                            );
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={String(column.key)} className="px-4 py-3">
                      {column.render
                        ? column.render(record[column.key], record)
                        : record[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" icon={<MoreIcon />} />
                          }
                        >
                          {actions.map(action => (
                            <DropdownItem
                              key={action.key}
                              onClick={() => action.onClick(record)}
                              className={action.danger ? "text-admin-error" : ""}
                            >
                              {action.icon}
                              {action.label}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="p-4 border-t border-admin-border-medium flex items-center justify-between">
          <div className="text-admin-text-secondary text-sm">
            显示 {((pagination.current - 1) * pagination.pageSize) + 1} -{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条
          </div>

          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={pagination.onChange}
          />
        </div>
      )}
    </div>
  );
};
```

### 5. Markdown 编辑器

#### 5.1 富文本编辑器

````typescript
// Markdown 编辑器组件
export const MarkdownEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  preview?: boolean;
  toolbar?: boolean;
  imageUpload?: (file: File) => Promise<string>;
}> = ({
  value,
  onChange,
  placeholder = "开始写作...",
  height = "400px",
  preview = false,
  toolbar = true,
  imageUpload,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(preview);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 工具栏操作
  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // 图片上传处理
  const handleImageUpload = async (files: FileList) => {
    if (!imageUpload) return;

    const file = files[0];
    if (file) {
      try {
        const url = await imageUpload(file);
        insertText(`![${file.name}](${url})`);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  // 工具栏按钮
  const toolbarButtons = [
    { icon: <BoldIcon />, action: () => insertText("**", "**"), title: "粗体" },
    { icon: <ItalicIcon />, action: () => insertText("*", "*"), title: "斜体" },
    { icon: <CodeIcon />, action: () => insertText("`", "`"), title: "行内代码" },
    { icon: <LinkIcon />, action: () => insertText("[", "](url)"), title: "链接" },
    { icon: <ImageIcon />, action: () => {}, title: "图片", type: "upload" },
    { icon: <ListIcon />, action: () => insertText("- "), title: "无序列表" },
    { icon: <OrderedListIcon />, action: () => insertText("1. "), title: "有序列表" },
    { icon: <QuoteIcon />, action: () => insertText("> "), title: "引用" },
    { icon: <CodeBlockIcon />, action: () => insertText("```\n", "\n```"), title: "代码块" },
  ];

  return (
    <div className={cn(
      "bg-admin-bg-secondary border border-admin-border-medium rounded-xl overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none"
    )}>
      {/* 工具栏 */}
      {toolbar && (
        <div className="flex items-center justify-between p-3 border-b border-admin-border-medium bg-admin-bg-tertiary">
          <div className="flex items-center gap-2">
            {toolbarButtons.map((button, index) => (
              <button
                key={index}
                onClick={() => {
                  if (button.type === "upload") {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleImageUpload(files);
                    };
                    input.click();
                  } else {
                    button.action();
                  }
                }}
                className="p-2 rounded hover:bg-admin-hover transition-colors"
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={cn(
                "p-2 rounded transition-colors",
                isPreviewMode ? "bg-admin-active text-admin-info" : "hover:bg-admin-hover"
              )}
              title="预览"
            >
              <EyeIcon />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded hover:bg-admin-hover transition-colors"
              title="全屏"
            >
              <FullscreenIcon />
            </button>
          </div>
        </div>
      )}

      {/* 编辑区域 */}
      <div className="flex" style={{ height: isFullscreen ? "calc(100vh - 60px)" : height }}>
        {!isPreviewMode ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-4 bg-transparent border-none resize-none outline-none text-admin-text-primary font-mono text-sm leading-relaxed"
            style={{ minHeight: "200px" }}
          />
        ) : (
          <div className="flex-1 p-4 overflow-auto">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
````

### 6. 文件管理器

#### 6.1 文件上传和管理

```typescript
// 文件管理器组件
export const FileManager: React.FC<{
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (fileId: string) => void;
  files: UploadedFile[];
}> = ({
  accept,
  multiple = true,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  onUpload,
  onRemove,
  files,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // 拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // 文件处理
  const handleFiles = async (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      // 文件类型检查
      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        console.warn(`文件类型不支持: ${file.type}`);
        return false;
      }

      // 文件大小检查
      if (file.size > maxSize) {
        console.warn(`文件过大: ${file.name}`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // 检查文件数量限制
    if (!multiple) {
      validFiles.splice(1);
    }

    if (files.length + validFiles.length > maxFiles) {
      console.warn(`文件数量超过限制: ${maxFiles}`);
      return;
    }

    try {
      // 模拟上传进度
      const uploadPromises = validFiles.map(async (file) => {
        const fileId = `${Date.now()}-${file.name}`;

        // 模拟进度更新
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        return file;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      await onUpload(uploadedFiles);

      // 清除进度
      const newProgress = { ...uploadProgress };
      validFiles.forEach(file => {
        const fileId = `${Date.now()}-${file.name}`;
        delete newProgress[fileId];
      });
      setUploadProgress(newProgress);
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
          dragActive
            ? "border-admin-info bg-admin-hover"
            : "border-admin-border-medium hover:border-admin-border-light"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadIcon className="w-12 h-12 mx-auto mb-4 text-admin-text-muted" />

        <div className="mb-4">
          <p className="text-admin-text-primary font-medium mb-2">
            拖拽文件到这里上传
          </p>
          <p className="text-admin-text-secondary text-sm">
            或者
          </p>
        </div>

        <label className="inline-block">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button as="span" variant="outline">
            选择文件
          </Button>
        </label>

        <div className="mt-4 text-xs text-admin-text-muted">
          {multiple && `最多 ${maxFiles} 个文件，`}
          每个文件最大 {Math.round(maxSize / 1024 / 1024)}MB
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-admin-text-primary font-medium">已上传文件</h4>

          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 bg-admin-bg-tertiary rounded-lg"
            >
              {/* 文件图标 */}
              <div className="flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FileIcon className="w-12 h-12 text-admin-text-muted" />
                )}
              </div>

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-admin-text-primary font-medium truncate">
                  {file.name}
                </p>
                <p className="text-admin-text-secondary text-sm">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* 上传进度 */}
              {uploadProgress[file.id] !== undefined && (
                <div className="flex-1 max-w-xs">
                  <ProgressBar value={uploadProgress[file.id]} />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<CopyIcon />}
                  onClick={() => navigator.clipboard.writeText(file.url)}
                >
                  复制链接
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={<TrashIcon />}
                  onClick={() => onRemove(file.id)}
                  className="text-admin-error"
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 7. 数据可视化

#### 7.1 分析卡片

```typescript
// 分析卡片组件
export const AnalyticsCard: React.FC<{
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  chart?: {
    type: 'line' | 'bar' | 'area';
    data: { x: string; y: number }[];
  };
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}> = ({
  title,
  value,
  change,
  chart,
  icon,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("bg-admin-bg-secondary rounded-xl p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton width={100} height={20} />
          <Skeleton width={40} height={40} variant="circular" />
        </div>
        <Skeleton height={32} width={150} className="mb-2" />
        <Skeleton width={120} height={16} />
        {chart && <Skeleton height={60} className="mt-4" />}
      </div>
    );
  }

  return (
    <div className={cn("bg-admin-bg-secondary rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-admin-text-secondary font-medium">{title}</h3>
        {icon && (
          <div className="p-2 bg-admin-hover rounded-lg text-admin-info">
            {icon}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-admin-text-primary mb-2">
          {value}
        </div>

        {change && (
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change.type === 'increase' ? 'text-admin-success' : 'text-admin-error'
            )}>
              {change.type === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(change.value)}%</span>
            </div>
            <span className="text-admin-text-muted text-sm">
              vs {change.period}
            </span>
          </div>
        )}
      </div>

      {chart && chart.data.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'line' && (
              <LineChart data={chart.data}>
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#58A6FF"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}

            {chart.type === 'bar' && (
              <BarChart data={chart.data}>
                <Bar dataKey="y" fill="#58A6FF" />
              </BarChart>
            )}

            {chart.type === 'area' && (
              <AreaChart data={chart.data}>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#58A6FF"
                  fill="#58A6FF"
                  fillOpacity={0.3}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// 分析仪表板
export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // 模拟数据获取
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData({
          pageViews: { value: "12,543", change: { value: 12.5, type: 'increase', period: '上周' } },
          visitors: { value: "3,421", change: { value: 8.2, type: 'increase', period: '上周' } },
          bounceRate: { value: "42.3%", change: { value: 3.1, type: 'decrease', period: '上周' } },
          avgDuration: { value: "3m 24s", change: { value: 15.2, type: 'increase', period: '上周' } },
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-admin-text-primary">数据分析</h2>

        <div className="flex items-center gap-2">
          {['1d', '7d', '30d', '90d'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '1d' && '今天'}
              {range === '7d' && '7天'}
              {range === '30d' && '30天'}
              {range === '90d' && '90天'}
            </Button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="页面浏览量"
          value={data?.pageViews.value}
          change={data?.pageViews.change}
          icon={<EyeIcon />}
          loading={loading}
        />

        <AnalyticsCard
          title="访问者"
          value={data?.visitors.value}
          change={data?.visitors.change}
          icon={<UsersIcon />}
          loading={loading}
        />

        <AnalyticsCard
          title="跳出率"
          value={data?.bounceRate.value}
          change={data?.bounceRate.change}
          icon={<ChartIcon />}
          loading={loading}
        />

        <AnalyticsCard
          title="平均停留时间"
          value={data?.avgDuration.value}
          change={data?.avgDuration.change}
          icon={<ClockIcon />}
          loading={loading}
        />
      </div>

      {/* 详细图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 流量趋势 */}
        <div className="bg-admin-bg-secondary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
            流量趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="date" stroke="#8B949E" />
                <YAxis stroke="#8B949E" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2128',
                    border: '1px solid #30363D',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#58A6FF"
                  strokeWidth={2}
                  name="页面浏览量"
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#2DA44E"
                  strokeWidth={2}
                  name="访问者"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 设备分布 */}
        <div className="bg-admin-bg-secondary rounded-xl p-6">
          <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
            设备分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockDeviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockDeviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2128',
                    border: '1px solid #30363D',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {mockDeviceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-admin-text-secondary">{item.name}</span>
                </div>
                <span className="text-admin-text-primary font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 8. 批量操作组件

#### 8.1 批量选择和操作

```typescript
// 批量操作组件
export const BulkActions: React.FC<{
  selectedItems: string[];
  actions: BulkAction[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  totalItems: number;
}> = ({
  selectedItems,
  actions,
  onSelectAll,
  onClearSelection,
  totalItems,
}) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: BulkAction | null;
  }>({ open: false, action: null });

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmDialog({ open: true, action });
    } else {
      action.onExecute(selectedItems);
      setIsActionMenuOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.action) {
      confirmDialog.action.onExecute(selectedItems);
      setConfirmDialog({ open: false, action: null });
      setIsActionMenuOpen(false);
    }
  };

  return (
    <>
      {/* 批量操作栏 */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-admin-bg-elevated border border-admin-border-medium rounded-xl shadow-2xl p-4 flex items-center gap-4">
              {/* 选择信息 */}
              <div className="flex items-center gap-3">
                <span className="text-admin-text-primary font-medium">
                  已选择 {selectedItems.length} 项
                </span>
                <button
                  onClick={selectedItems.length === totalItems ? onClearSelection : onSelectAll}
                  className="text-admin-info hover:underline text-sm"
                >
                  {selectedItems.length === totalItems ? '取消全选' : '全选'}
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <Dropdown
                  open={isActionMenuOpen}
                  onOpenChange={setIsActionMenuOpen}
                  trigger={
                    <Button variant="primary" size="sm">
                      批量操作
                      <ChevronUpIcon
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isActionMenuOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  }
                >
                  {actions.map(action => (
                    <DropdownItem
                      key={action.key}
                      onClick={() => handleActionClick(action)}
                      className={cn(
                        action.danger && "text-admin-error",
                        action.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={action.disabled}
                    >
                      {action.icon}
                      <div className="flex-1">
                        <div className="font-medium">{action.label}</div>
                        {action.description && (
                          <div className="text-xs text-admin-text-muted">
                            {action.description}
                          </div>
                        )}
                      </div>
                    </DropdownItem>
                  ))}
                </Dropdown>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                >
                  清除选择
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 确认对话框 */}
      <Modal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        title="确认操作"
      >
        <div className="space-y-4">
          <p className="text-admin-text-secondary">
            确定要对选中的 {selectedItems.length} 项执行 "
            <span className="text-admin-text-primary font-medium">
              {confirmDialog.action?.label}
            </span>
            " 操作吗？
          </p>

          {confirmDialog.action?.warningMessage && (
            <div className="p-3 bg-admin-error/10 border border-admin-error/20 rounded-lg">
              <p className="text-admin-error text-sm">
                {confirmDialog.action.warningMessage}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, action: null })}
            >
              取消
            </Button>
            <Button
              variant={confirmDialog.action?.danger ? 'danger' : 'primary'}
              onClick={handleConfirmAction}
            >
              确认
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// 批量操作类型定义
interface BulkAction {
  key: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  onExecute: (selectedItems: string[]) => void | Promise<void>;
  requiresConfirmation?: boolean;
  warningMessage?: string;
  danger?: boolean;
  disabled?: boolean;
}
```

### 9. 状态指示器

#### 9.1 多种状态指示器

```typescript
// 状态指示器组件
export const StatusIndicator: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'loading';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'badge' | 'pill';
  className?: string;
}> = ({
  status,
  text,
  size = 'md',
  variant = 'dot',
  className,
}) => {
  const statusConfig = {
    success: {
      color: 'text-admin-success',
      bg: 'bg-admin-success/10',
      border: 'border-admin-success/20',
      icon: <CheckCircleIcon />,
    },
    warning: {
      color: 'text-admin-warning',
      bg: 'bg-admin-warning/10',
      border: 'border-admin-warning/20',
      icon: <AlertTriangleIcon />,
    },
    error: {
      color: 'text-admin-error',
      bg: 'bg-admin-error/10',
      border: 'border-admin-error/20',
      icon: <XCircleIcon />,
    },
    info: {
      color: 'text-admin-info',
      bg: 'bg-admin-info/10',
      border: 'border-admin-info/20',
      icon: <InfoIcon />,
    },
    pending: {
      color: 'text-admin-warning',
      bg: 'bg-admin-warning/10',
      border: 'border-admin-warning/20',
      icon: <ClockIcon />,
    },
    loading: {
      color: 'text-admin-info',
      bg: 'bg-admin-info/10',
      border: 'border-admin-info/20',
      icon: <LoadingSpinner />,
    },
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'w-2 h-2 text-xs',
    md: 'w-3 h-3 text-sm',
    lg: 'w-4 h-4 text-base',
  };

  if (variant === 'dot') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            config.color,
            status === 'loading' && 'animate-spin'
          )}
        >
          {config.icon}
        </div>
        {text && (
          <span className={cn("text-admin-text-secondary", sizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-2 py-1 rounded-md border",
          config.bg,
          config.border,
          config.color,
          className
        )}
      >
        <span className={sizeClasses[size]}>{config.icon}</span>
        {text && <span className="text-sm font-medium">{text}</span>}
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
          config.bg,
          config.border,
          config.color,
          className
        )}
      >
        <span className={sizeClasses[size]}>{config.icon}</span>
        {text && <span className="text-sm font-medium">{text}</span>}
      </div>
    );
  }

  return null;
};

// 系统状态监控组件
export const SystemStatus: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    database: 'success',
    server: 'success',
    cdn: 'warning',
    storage: 'success',
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟状态检查
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-admin-bg-secondary rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-admin-text-primary">
          系统状态
        </h3>
        <div className="flex items-center gap-2 text-admin-text-muted text-sm">
          <ClockIcon className="w-4 h-4" />
          最后更新: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(systemStatus).map(([service, status]) => (
          <div
            key={service}
            className="flex items-center justify-between p-3 bg-admin-bg-tertiary rounded-lg"
          >
            <div className="flex items-center gap-3">
              <StatusIndicator
                status={status}
                variant="dot"
                size="md"
              />
              <span className="text-admin-text-primary font-medium capitalize">
                {service}
              </span>
            </div>

            <div className="text-admin-text-secondary text-sm">
              {status === 'success' && '运行正常'}
              {status === 'warning' && '性能下降'}
              {status === 'error' && '服务异常'}
              {status === 'pending' && '启动中'}
              {status === 'loading' && '检查中'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-admin-border-medium">
        <div className="flex items-center justify-between">
          <span className="text-admin-text-secondary text-sm">
            整体状态
          </span>
          <StatusIndicator
            status={Object.values(systemStatus).every(s => s === 'success') ? 'success' : 'warning'}
            text={
              Object.values(systemStatus).every(s => s === 'success') ? '所有服务正常' : '部分服务异常'
            }
            variant="badge"
          />
        </div>
      </div>
    </div>
  );
};
```

### 10. 管理端总结

这个管理端界面设计规范提供了：

1. **专业的视觉设计**：深色主题、功能性色彩、清晰的信息层次
2. **高效的交互模式**：批量操作、快捷键、智能搜索
3. **强大的数据管理**：数据表格、文件管理、内容编辑
4. **直观的数据分析**：可视化图表、实时监控、趋势分析
5. **完善的状态反馈**：加载状态、错误处理、成功提示

这个设计确保了管理功能的专业性和易用性，同时与展示端保持品牌一致性。
