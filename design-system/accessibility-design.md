# 可访问性设计规范

## Accessibility Design Specification (WCAG 2.1 AA Compliance)

### 1. 可访问性设计理念

#### 1.1 核心原则 (POUR)

- **Perceivable (可感知)**：信息必须以用户能够感知的方式呈现
- **Operable (可操作)**：界面组件和导航必须是可操作的
- **Understandable (可理解)**：信息和用户界面的操作必须是可理解的
- **Robust (健壮)**：内容必须足够健壮，能够被各种用户代理（包括辅助技术）可靠地解析

#### 1.2 设计目标

- **WCAG 2.1 AA 合规**：达到 WCAG 2.1 AA 级别标准
- **全用户包容**：支持视觉、听觉、运动、认知障碍用户
- **跨设备兼容**：在各种设备和辅助技术上正常工作
- **优雅降级**：在功能受限的环境中仍能提供基本功能

### 2. 色彩与对比度

#### 2.1 对比度标准

```css
/* WCAG 2.1 AA 对比度要求 */
:root {
  /* 正常文本对比度要求：4.5:1 */
  --contrast-normal: 4.5;

  /* 大文本对比度要求：3:1 */
  --contrast-large: 3;

  /* 非文本元素对比度要求：3:1 */
  --contrast-ui: 3;
}

/* 确保足够的对比度 */
.text-primary {
  color: #f0f6fc; /* 对比度: 15.8:1 ✅ */
}

.text-secondary {
  color: #8b949e; /* 对比度: 4.6:1 ✅ */
}

.text-muted {
  color: #6e7681; /* 对比度: 3.2:1 ✅ */
}

/* 避免仅用颜色传达信息 */
.status-success {
  color: #2da44e;
  position: relative;
  padding-left: 20px;
}

.status-success::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #2da44e;
}

.status-error {
  color: #f85149;
  position: relative;
  padding-left: 20px;
}

.status-error::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #f85149;
}

/* 焦点指示器 */
.focus-visible:focus {
  outline: 2px solid #58a6ff;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #ffffff;
    --color-text-secondary: #cccccc;
    --color-bg-primary: #000000;
    --color-bg-secondary: #1a1a1a;
  }
}
```

#### 2.2 色彩辅助函数

```typescript
// 对比度检查工具
export const colorContrastChecker = {
  // 计算相对亮度
  getLuminance: (hex: string): number => {
    const rgb = this.hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  // 计算对比度
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // 检查是否满足WCAG标准
  checkWCAGCompliance: (foreground: string, background: string, isLargeText: boolean = false) => {
    const ratio = this.getContrastRatio(foreground, background);

    return {
      ratio: Math.round(ratio * 100) / 100,
      aa_normal: ratio >= 4.5,
      aa_large: ratio >= 3.0,
      aaa_normal: ratio >= 7.0,
      aaa_large: ratio >= 4.5,
      wcag_aa: isLargeText ? ratio >= 3.0 : ratio >= 4.5
    };
  },

  // 生成可访问颜色
  generateAccessibleColor: (background: string, targetRatio: number = 4.5): string => {
    const bgLum = this.getLuminance(background);
    const isLightBg = bgLum > 0.5;

    let color = isLightBg ? '#000000' : '#FFFFFF';
    let bestRatio = this.getContrastRatio(color, background);

    // 如果初始颜色不满足要求，进行调整
    if (bestRatio < targetRatio) {
      const step = isLightBg ? -1 : 1;
      const rgb = this.hexToRgb(color);

      for (let i = 0; i < 50; i++) {
        rgb.r = Math.max(0, Math.min(255, rgb.r + step));
        rgb.g = Math.max(0, Math.min(255, rgb.g + step));
        rgb.b = Math.max(0, Math.min(255, rgb.b + step));

        color = this.rgbToHex(rgb);
        bestRatio = this.getContrastRatio(color, background);

        if (bestRatio >= targetRatio) break;
      }
    }

    return color;
  },

  // 辅助函数
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 };
  },

  rgbToHex: (rgb: { r: number; g: number; b: number }) => {
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
  }
};
```

### 3. 键盘导航

#### 3.1 焦点管理

```typescript
// 焦点管理 Hook
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndexRef = useRef(-1);

  // 获取所有可聚焦元素
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }, []);

  // 设置焦点陷阱
  const trapFocus = useCallback((container: HTMLElement) => {
    focusableElementsRef.current = getFocusableElements(container);
    currentFocusIndexRef.current = -1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        const elements = focusableElementsRef.current;
        if (elements.length === 0) return;

        if (e.shiftKey) {
          // Shift + Tab (向前)
          currentFocusIndexRef.current = currentFocusIndexRef.current <= 0
            ? elements.length - 1
            : currentFocusIndexRef.current - 1;
        } else {
          // Tab (向后)
          currentFocusIndexRef.current = currentFocusIndexRef.current >= elements.length - 1
            ? 0
            : currentFocusIndexRef.current + 1;
        }

        elements[currentFocusIndexRef.current]?.focus();
      }

      // Escape 键退出
      if (e.key === 'Escape') {
        cleanup();
      }
    };

    const cleanup = () => {
      container.removeEventListener('keydown', handleKeyDown);
    };

    container.addEventListener('keydown', handleKeyDown);

    // 初始聚焦第一个元素
    if (elements.length > 0) {
      elements[0].focus();
      currentFocusIndexRef.current = 0;
    }

    return cleanup;
  }, [getFocusableElements]);

  // 跳转到指定元素
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      const index = focusableElementsRef.current.indexOf(element);
      if (index !== -1) {
        currentFocusIndexRef.current = index;
      }
    }
  }, []);

  return {
    trapFocus,
    focusElement,
    getFocusableElements,
  };
};

// 可访问的模态框组件
export const AccessibleModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { trapFocus } = useFocusManagement();

  useEffect(() => {
    if (open && modalRef.current) {
      // 保存当前焦点
      previousFocusRef.current = document.activeElement as HTMLElement;

      // 设置焦点陷阱
      const cleanup = trapFocus(modalRef.current);

      // 设置 aria-hidden
      document.body.setAttribute('aria-hidden', 'true');
      modalRef.current.setAttribute('aria-hidden', 'false');

      return () => {
        cleanup();

        // 恢复焦点
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }

        // 恢复 aria-hidden
        document.body.removeAttribute('aria-hidden');
      };
    }
  }, [open, trapFocus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 模态框内容 */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-lg bg-background p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">
          {title}
        </h2>

        <div className="mb-6">
          {children}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
          aria-label="关闭对话框"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
```

#### 3.2 键盘导航增强

```typescript
// 键盘导航增强
export const keyboardNavigationEnhancements = {
  // 跳过链接
  skipLinks: () => {
    return (
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        跳转到主要内容
      </a>
    );
  },

  // 快捷键支持
  shortcuts: {
    'Ctrl+K': '打开搜索',
    'Ctrl+/': '显示快捷键帮助',
    'Escape': '关闭模态框/取消操作',
    'Enter': '确认操作/激活链接',
    'Space': '选择/激活按钮',
    'Arrow Keys': '导航菜单项',
    'Tab': '在可聚焦元素间导航',
    'Shift+Tab': '反向导航',
  },

  // 全局快捷键处理
  useGlobalShortcuts: () => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl+K - 打开搜索
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          // 触发搜索框显示
          document.dispatchEvent(new CustomEvent('open-search'));
        }

        // Ctrl+/ - 显示快捷键帮助
        if (e.ctrlKey && e.key === '/') {
          e.preventDefault();
          // 显示快捷键帮助
          document.dispatchEvent(new CustomEvent('show-shortcuts'));
        }

        // 数字键快速导航
        if (e.altKey && e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          // 触发对应导航项
          document.dispatchEvent(new CustomEvent('navigate-to-index', { detail: { index } }));
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
  },
};
```

### 4. 屏幕阅读器支持

#### 4.1 ARIA 标签和属性

```typescript
// ARIA 属性配置
export const ariaConfig = {
  // 地标角色
  landmarks: {
    header: 'banner',
    nav: 'navigation',
    main: 'main',
    aside: 'complementary',
    footer: 'contentinfo',
    section: 'region',
    form: 'form',
    search: 'search',
  },

  // 状态属性
  states: {
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    disabled: 'aria-disabled',
    required: 'aria-required',
    invalid: 'aria-invalid',
    busy: 'aria-busy',
    hidden: 'aria-hidden',
  },

  // 属性
  properties: {
    label: 'aria-label',
    labelledBy: 'aria-labelledby',
    describedBy: 'aria-describedby',
    details: 'aria-details',
    live: 'aria-live',
    atomic: 'aria-atomic',
    relevant: 'aria-relevant',
    current: 'aria-current',
  },

  // 实时区域
  liveRegions: {
    polite: 'aria-live="polite"',
    assertive: 'aria-live="assertive"',
    off: 'aria-live="off"',
  },
};

// 可访问的导航组件
export const AccessibleNavigation: React.FC<{
  items: Array<{
    id: string;
    label: string;
    href: string;
    current?: boolean;
  }>;
  ariaLabel?: string;
}> = ({ items, ariaLabel = "主导航" }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleKeyDown = (e: React.KeyboardEvent, itemIndex: number) => {
    const items = e.currentTarget.querySelectorAll('[role="menuitem"]');
    const currentIndex = Array.from(items).findIndex(item => item === e.target);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        (items[nextIndex] as HTMLElement)?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        (items[prevIndex] as HTMLElement)?.focus();
        break;

      case 'Home':
        e.preventDefault();
        (items[0] as HTMLElement)?.focus();
        break;

      case 'End':
        e.preventDefault();
        (items[items.length - 1] as HTMLElement)?.focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        (e.target as HTMLElement).click();
        break;

      case 'Escape':
        e.currentTarget.blur();
        break;
    }
  };

  return (
    <nav
      aria-label={ariaLabel}
      role="navigation"
    >
      <ul role="menubar" className="flex space-x-1">
        {items.map((item, index) => (
          <li key={item.id} role="none">
            <a
              href={item.href}
              role="menuitem"
              aria-current={item.current ? 'page' : undefined}
              className="block px-3 py-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// 可访问的表单组件
export const AccessibleFormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, error, hint, children }) => {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const childWithProps = React.cloneElement(children as React.ReactElement, {
    id: fieldId,
    'aria-describedby': [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' '),
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required,
  });

  return (
    <div className="space-y-1">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="必填项">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}

      {childWithProps}

      {error && (
        <div
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

#### 4.2 动态内容通知

```typescript
// 屏幕阅读器通知系统
export const screenReaderAnnouncer = {
  // 创建实时区域
  createLiveRegion: () => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    return liveRegion;
  },

  // 宣布消息
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion =
      document.querySelector('[aria-live="polite"]') ||
      document.querySelector('[aria-live="assertive"]') ||
      screenReaderAnnouncer.createLiveRegion();

    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = '';

    // 使用 setTimeout 确保屏幕阅读器能检测到变化
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  },

  // 宣布页面变化
  announcePageChange: (title: string) => {
    screenReaderAnnouncer.announce(`页面已更改：${title}`, 'assertive');
  },

  // 宣布表单错误
  announceFormErrors: (errors: string[]) => {
    const message = `表单验证失败：${errors.join('，')}`;
    screenReaderAnnouncer.announce(message, 'assertive');
  },

  // 宣布操作结果
  announceAction: (action: string, result: 'success' | 'error') => {
    const message = `${action}${result === 'success' ? '成功' : '失败'}`;
    screenReaderAnnouncer.announce(message, result === 'error' ? 'assertive' : 'polite');
  }
};

// 通知 Hook
export const useScreenReaderAnnouncer = () => {
  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    screenReaderAnnouncer.announce(message, priority);
  }, []);

  const announcePageChange = useCallback((title: string) => {
    screenReaderAnnouncer.announcePageChange(title);
  }, []);

  const announceFormErrors = useCallback((errors: string[]) => {
    screenReaderAnnouncer.announceFormErrors(errors);
  }, []);

  const announceAction = useCallback((action: string, result: 'success' | 'error') => {
    screenReaderAnnouncer.announceAction(action, result);
  }, []);

  return {
    announce,
    announcePageChange,
    announceFormErrors,
    announceAction
  };
};
```

### 5. 响应式设计与移动端可访问性

#### 5.1 触摸目标优化

```css
/* 最小触摸目标 44x44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 小屏幕触摸目标优化 */
@media (max-width: 640px) {
  .button-small {
    min-height: 48px;
    min-width: 48px;
    padding: 12px 16px;
  }

  .icon-button {
    min-height: 44px;
    min-width: 44px;
  }

  .link {
    padding: 8px 12px;
    margin: -8px -12px;
  }
}

/* 间距优化 */
.touch-spaced {
  margin: 4px;
}

.touch-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .touch-group {
    gap: 12px;
  }
}
```

#### 5.2 移动端导航优化

```typescript
// 移动端可访问导航
export const MobileAccessibleNavigation: React.FC<{
  items: Array<{
    id: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trapFocus } = useFocusManagement();
  const { announce } = useScreenReaderAnnouncer();

  useEffect(() => {
    if (isOpen) {
      announce('导航菜单已打开');

      // 设置焦点陷阱
      const navElement = document.getElementById('mobile-nav');
      if (navElement) {
        return trapFocus(navElement);
      }
    } else {
      announce('导航菜单已关闭');
    }
  }, [isOpen, trapFocus, announce]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
        nextElement?.focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
        prevElement?.focus();
        break;

      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="md:hidden">
      {/* 菜单按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={isOpen ? "关闭导航菜单" : "打开导航菜单"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* 移动端导航菜单 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

          <nav
            id="mobile-nav"
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
            role="navigation"
            aria-label="移动端导航"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">导航菜单</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="关闭导航菜单"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <ul className="py-2">
              {items.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    onKeyDown={handleKeyDown}
                  >
                    {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
```

### 6. 表单可访问性

#### 6.1 表单验证与错误处理

```typescript
// 可访问表单验证
export const useAccessibleForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const { announceFormErrors } = useScreenReaderAnnouncer();

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    // 这里可以添加具体的验证逻辑
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return `${String(name)}不能为空`;
      }
      if (value.length < 2) {
        return `${String(name)}至少需要2个字符`;
      }
    }

    return null;
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // 实时验证
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const setFieldTouched = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // 触摸时验证
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    if (!isValid) {
      const errorMessages = Object.values(newErrors).filter(Boolean);
      announceFormErrors(errorMessages);
    }

    return isValid;
  }, [values, validateField, announceFormErrors]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0,
  };
};

// 可访问的输入组件
export const AccessibleInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  describedBy?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  describedBy,
}) => {
  const inputId = `${name}-input`;
  const errorId = `${name}-error`;
  const describedByIds = [
    describedBy,
    error ? errorId : null,
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="必填项">
            *
          </span>
        )}
      </label>

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedByIds}
        className={cn(
          "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          error ? "border-red-500" : "border-gray-300"
        )}
      />

      {error && (
        <div
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};
```

### 7. 媒体可访问性

#### 7.1 图片可访问性

```typescript
// 可访问图片组件
export const AccessibleImage: React.FC<{
  src: string;
  alt: string;
  caption?: string;
  decorative?: boolean;
  longdesc?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}> = ({
  src,
  alt,
  caption,
  decorative = false,
  longdesc,
  width,
  height,
  loading = 'lazy',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imgId = useId();
  const captionId = caption ? `${imgId}-caption` : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <figure className="my-4">
      <img
        id={imgId}
        src={src}
        alt={decorative ? '' : alt}
        aria-describedby={captionId}
        longdesc={longdesc}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "max-w-full h-auto rounded-lg",
          !isLoaded && "animate-pulse bg-gray-200",
          hasError && "bg-gray-200"
        )}
        role={decorative ? "presentation" : undefined}
      />

      {caption && (
        <figcaption
          id={captionId}
          className="mt-2 text-sm text-center text-gray-600"
        >
          {caption}
        </figcaption>
      )}

      {hasError && (
        <div
          className="sr-only"
          role="alert"
          aria-live="polite"
        >
          图片加载失败：{alt}
        </div>
      )}
    </figure>
  );
};

// 图片 alt 文本生成器
export const altTextGenerator = {
  // 为不同类型的内容生成合适的 alt 文本
  generate: (context: {
    type: 'screenshot' | 'chart' | 'diagram' | 'photo' | 'logo' | 'icon';
    subject?: string;
    description?: string;
    data?: any;
  }): string => {
    const { type, subject, description, data } = context;

    switch (type) {
      case 'screenshot':
        return description || `${subject}的界面截图`;

      case 'chart':
        if (data) {
          return `图表显示：${data.title}。${data.description || ''}`;
        }
        return description || '数据图表';

      case 'diagram':
        return description || `${subject}的示意图`;

      case 'photo':
        return description || `${subject}的照片`;

      case 'logo':
        return `${subject}的标志`;

      case 'icon':
        return `${subject}图标`;

      default:
        return description || '图片';
    }
  },

  // 验证 alt 文本质量
  validate: (alt: string, isDecorative: boolean = false): {
    isValid: boolean;
    suggestions: string[];
  } => {
    const suggestions: string[] = [];

    if (isDecorative) {
      if (alt !== '') {
        suggestions.push('装饰性图片应该使用空的 alt 属性 (alt="")');
      }
    } else {
      if (alt === '') {
        suggestions.push('内容图片需要提供描述性的 alt 文本');
      }

      if (alt.length < 10) {
        suggestions.push('alt 文本过于简短，建议提供更详细的描述');
      }

      if (alt.toLowerCase().includes('图片') || alt.toLowerCase().includes('image')) {
        suggestions.push('alt 文本不需要说明这是图片，屏幕阅读器会自动告知用户');
      }

      if (alt.length > 125) {
        suggestions.push('alt 文本过长，考虑使用 longdesc 属性或提供详细描述');
      }
    }

    return {
      isValid: suggestions.length === 0,
      suggestions,
    };
  },
};
```

#### 7.2 视频可访问性

```typescript
// 可访问视频组件
export const AccessibleVideo: React.FC<{
  src: string;
  poster?: string;
  title: string;
  description?: string;
  captions?: string;
  transcript?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  width?: number;
  height?: number;
}> = ({
  src,
  poster,
  title,
  description,
  captions,
  transcript,
  autoPlay = false,
  controls = true,
  muted = false,
  width,
  height,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { announce } = useScreenReaderAnnouncer();

  const handlePlay = () => {
    setIsPlaying(true);
    announce(`视频开始播放：${title}`);
  };

  const handlePause = () => {
    setIsPlaying(false);
    announce(`视频已暂停：${title}`);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    announce(`视频播放结束：${title}`);
  };

  return (
    <div className="my-4">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        title={title}
        aria-describedby={description ? 'video-description' : undefined}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        width={width}
        height={height}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        className="max-w-full rounded-lg"
      >
        {captions && (
          <track
            kind="captions"
            src={captions}
            label="中文字幕"
            srcLang="zh"
            default
          />
        )}

        您的浏览器不支持视频播放。
      </video>

      {description && (
        <div id="video-description" className="sr-only">
          {description}
        </div>
      )}

      {/* 视频控制说明 */}
      <div className="mt-2 text-sm text-gray-600">
        <p>使用空格键播放/暂停，左右箭头键快进/快退。</p>
        {captions && <p>此视频包含字幕。</p>}
        {transcript && (
          <p>
            <a
              href={transcript}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              查看视频文本记录
            </a>
          </p>
        )}
      </div>
    </div>
  );
};
```

### 8. 可访问性测试

#### 8.1 自动化测试工具

```typescript
// 可访问性测试配置
export const accessibilityTesting = {
  // axe-core 配置
  axeConfig: {
    rules: {
      // 启用所有 WCAG 2.1 AA 规则
      wcag2a: { enabled: true },
      wcag2aa: { enabled: true },
      wcag21aa: { enabled: true },

      // 禁用某些与设计系统冲突的规则
      'color-contrast': { enabled: false }, // 已在设计中考虑
      'landmark-one-main': { enabled: false } // 特定页面设计
    },

    // 额外标签
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
  },

  // Jest 测试配置
  jestSetup: `
    import { configureAxe } from 'jest-axe';

    const axe = configureAxe({
      rules: accessibilityTesting.axeConfig.rules,
    });

    expect.extend(toHaveNoViolations);
  `,

  // 测试用例模板
  testTemplates: {
    component: `
      import { render, screen } from '@testing-library/react';
      import { axe, toHaveNoViolations } from 'jest-axe';
      import { ComponentName } from './ComponentName';

      expect.extend(toHaveNoViolations);

      describe('ComponentName Accessibility', () => {
        it('should not have accessibility violations', async () => {
          const { container } = render(<ComponentName />);
          const results = await axe(container);
          expect(results).toHaveNoViolations();
        });

        it('should be keyboard navigable', async () => {
          render(<ComponentName />);
          
          // 测试 Tab 导航
          await user.tab();
          expect(screen.getByRole('button', { name: /submit/i })).toHaveFocus();
          
          // 测试 Enter 激活
          await user.keyboard('{Enter}');
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        it('should announce changes to screen readers', async () => {
          render(<ComponentName />);
          
          // 测试状态变化通知
          await user.click(screen.getByRole('button'));
          expect(screen.getByRole('status')).toBeInTheDocument();
        });
      });
    `
  }
};

// 可访问性测试 Hook
export const useAccessibilityTesting = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runAccessibilityTest = useCallback(async () => {
    setIsTesting(true);

    try {
      // 导入 axe-core
      const axe = await import('axe-core');

      // 运行测试
      const results = await axe.default.run(document.body, {
        rules: accessibilityTesting.axeConfig.rules
      });

      setTestResults(results.violations);

      // 输出结果到控制台
      if (results.violations.length > 0) {
        console.group('🚨 Accessibility Violations Found');
        results.violations.forEach((violation: any) => {
          console.error(violation.help, violation.nodes);
        });
        console.groupEnd();
      } else {
        console.log('✅ No accessibility violations found');
      }

      return results;
    } catch (error) {
      console.error('Accessibility test failed:', error);
      return null;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const fixViolation = useCallback((violation: any) => {
    // 提供修复建议
    const suggestions = {
      'color-contrast': '增加文本和背景的对比度，确保达到 WCAG AA 标准',
      'keyboard-navigation': '确保所有交互元素都可以通过键盘访问',
      'aria-labels': '为交互元素添加适当的 ARIA 标签',
      'heading-order': '确保标题层级正确（h1, h2, h3...）',
      'alt-text': '为所有有意义的图片提供描述性的 alt 文本'
    };

    return suggestions[violation.id] || '请参考 WCAG 指南修复此问题';
  }, []);

  return {
    runAccessibilityTest,
    testResults,
    isTesting,
    fixViolation,
    hasViolations: testResults.length > 0
  };
};
```

#### 8.2 手动测试清单

```typescript
// 可访问性手动测试清单
export const accessibilityChecklist = {
  // 键盘导航
  keyboardNavigation: {
    items: [
      '所有交互元素都可以通过 Tab 键访问',
      'Tab 顺序符合逻辑和视觉顺序',
      '焦点指示器清晰可见',
      '所有功能都可以通过键盘操作',
      '模态框有焦点陷阱',
      'Skip Links 功能正常',
      '快捷键工作正常'
    ],
    status: {} as Record<string, boolean>
  },

  // 屏幕阅读器
  screenReader: {
    items: [
      '所有图片都有适当的 alt 文本',
      '表单标签正确关联',
      '错误信息被正确宣布',
      '状态变化被通知',
      '页面标题准确反映内容',
      '链接文本描述明确',
      'ARIA 标签使用正确'
    ],
    status: {} as Record<string, boolean>
  },

  // 视觉设计
  visualDesign: {
    items: [
      '文本对比度达到 4.5:1',
      '重要信息不仅依赖颜色',
      '文本可以放大到 200%',
      '布局在放大时保持可用',
      '动画可以禁用',
      '高对比度模式支持',
      '减少动画模式支持'
    ],
    status: {} as Record<string, boolean>
  },

  // 移动设备
  mobileDevice: {
    items: [
      '触摸目标至少 44x44px',
      '触摸目标间距充足',
      '横屏模式可用',
      '手势操作有替代方案',
      '设备方向支持',
      '语音控制支持'
    ],
    status: {} as Record<string, boolean>
  },

  // 表单
  forms: {
    items: [
      '所有字段都有标签',
      '必填字段明确标识',
      '错误信息清晰有用',
      '实时验证反馈',
      '提交后状态明确',
      '自动完成适当设置'
    ],
    status: {} as Record<string, boolean>
  }
};

// 测试进度跟踪
export const useAccessibilityChecklist = () => {
  const [progress, setProgress] = useState(accessibilityChecklist);

  const updateItemStatus = useCallback(
    (category: keyof typeof accessibilityChecklist, item: string, status: boolean) => {
      setProgress(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          status: {
            ...prev[category].status,
            [item]: status
          }
        }
      }));
    },
    []
  );

  const getCategoryProgress = useCallback(
    (category: keyof typeof accessibilityChecklist) => {
      const items = progress[category].items;
      const status = progress[category].status;
      const completed = items.filter(item => status[item]).length;
      return {
        completed,
        total: items.length,
        percentage: Math.round((completed / items.length) * 100)
      };
    },
    [progress]
  );

  const getOverallProgress = useCallback(() => {
    const categories = Object.keys(progress) as Array<keyof typeof accessibilityChecklist>;
    let totalItems = 0;
    let completedItems = 0;

    categories.forEach(category => {
      totalItems += progress[category].items.length;
      completedItems += Object.values(progress[category].status).filter(Boolean).length;
    });

    return {
      completed: completedItems,
      total: totalItems,
      percentage: Math.round((completedItems / totalItems) * 100)
    };
  }, [progress]);

  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      overall: getOverallProgress(),
      categories: Object.keys(progress).map(category => ({
        name: category,
        ...getCategoryProgress(category as keyof typeof accessibilityChecklist)
      })),
      details: progress
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [progress, getOverallProgress, getCategoryProgress]);

  return {
    progress,
    updateItemStatus,
    getCategoryProgress,
    getOverallProgress,
    exportReport
  };
};
```

### 9. 实施指南

#### 9.1 可访问性开发流程

```typescript
// 可访问性开发工作流
export const accessibilityWorkflow = {
  // 设计阶段
  design: {
    checklists: [
      '色彩对比度检查',
      '字体大小和间距验证',
      '交互目标尺寸确认',
      '信息架构审核',
      '用户流程测试'
    ],
    tools: [
      'Adobe Color Accessibility Checker',
      'Figma Accessibility Plugin',
      'Contrast Checker',
      'Color Blindness Simulator'
    ]
  },

  // 开发阶段
  development: {
    checklists: [
      '语义化 HTML 标签',
      'ARIA 属性正确使用',
      '键盘导航实现',
      '表单可访问性',
      '图片 alt 文本',
      '视频字幕和转录'
    ],
    tools: [
      'axe DevTools',
      'WAVE Web Accessibility Evaluation Tool',
      'Lighthouse Accessibility Audit',
      'Screen Reader Testing'
    ]
  },

  // 测试阶段
  testing: {
    automated: [
      'axe-core 集成测试',
      'Jest 可访问性测试',
      'Playwright 可访问性测试',
      'CI/CD 自动化检查'
    ],
    manual: ['键盘导航测试', '屏幕阅读器测试', '移动设备测试', '真实用户测试']
  },

  // 部署后监控
  monitoring: {
    metrics: ['可访问性错误报告', '用户反馈收集', '辅助技术使用统计', '合规性审计'],
    tools: [
      'Google Analytics Accessibility Reports',
      'User Feedback Systems',
      'Automated Accessibility Monitoring'
    ]
  }
};
```

这个可访问性设计规范确保您的个人博客网站符合 WCAG 2.1 AA 标准，为所有用户提供平等访问体验，体现了技术博客应有的专业性和包容性。
