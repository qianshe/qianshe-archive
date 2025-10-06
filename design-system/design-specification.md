# 个人博客和作品集网站设计规范

## Design Specification for Personal Blog & Portfolio Website

### 1. 设计哲学

**核心理念**：技术驱动的极简主义，突出内容价值和个人品牌特色

- **内容为王**：设计服务于内容，突出技术博客和作品展示
- **专业可信**：体现技术专业性，建立个人品牌信任度
- **体验优先**：流畅的交互体验，降低用户认知负担
- **可扩展性**：模块化设计，支持未来功能扩展

### 2. 色彩系统

#### 主色调 (Dark Theme)

```css
/* 基础色彩 */
--color-primary: #58a6ff; /* 主高亮色 */
--color-secondary: #1f6feb; /* 次要蓝色 */
--color-accent: #2da44e; /* 强调色（成功状态） */
--color-warning: #d29922; /* 警告色 */
--color-error: #f85149; /* 错误色 */

/* 背景层次 */
--color-bg-primary: #0d1117; /* 主背景 */
--color-bg-secondary: #161b22; /* 次要背景 */
--color-bg-tertiary: #21262d; /* 第三层背景 */
--color-bg-elevated: #30363d; /* 浮层背景 */

/* 文字色彩 */
--color-text-primary: #f0f6fc; /* 主要文字 */
--color-text-secondary: #8b949e; /* 次要文字 */
--color-text-tertiary: #6e7681; /* 第三层文字 */
--color-text-disabled: #484f58; /* 禁用文字 */

/* 边框和分割线 */
--color-border-primary: #30363d; /* 主要边框 */
--color-border-secondary: #21262d; /* 次要边框 */
--color-border-muted: #6e768166; /* 弱化边框 */
```

#### 渐变和光效

```css
/* 主色调渐变 */
--gradient-primary: linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%);
--gradient-accent: linear-gradient(135deg, #2da44e 0%, #1a7f37 100%);

/* 光晕效果 */
--shadow-glow: 0 0 20px rgba(88, 166, 255, 0.3);
--shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.15);
--shadow-hard: 0 12px 32px rgba(0, 0, 0, 0.2);
```

### 3. 字体系统

#### 字体栈

```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-family-display: 'Inter', sans-serif;
```

#### 字号层级

```css
/* Display */
--font-size-display-1: 3.5rem; /* 56px */
--font-size-display-2: 3rem; /* 48px */
--font-size-display-3: 2.5rem; /* 40px */

/* Headings */
--font-size-h1: 2rem; /* 32px */
--font-size-h2: 1.5rem; /* 24px */
--font-size-h3: 1.25rem; /* 20px */
--font-size-h4: 1.125rem; /* 18px */
--font-size-h5: 1rem; /* 16px */
--font-size-h6: 0.875rem; /* 14px */

/* Body */
--font-size-body-large: 1.125rem; /* 18px */
--font-size-body-medium: 1rem; /* 16px */
--font-size-body-small: 0.875rem; /* 14px */
--font-size-body-xsmall: 0.75rem; /* 12px */

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

#### 字重设置

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### 4. 间距系统

#### 基础间距单位

```css
--spacing-unit: 8px; /* 基础单位 */

/* 小间距 */
--spacing-xs: calc(var(--spacing-unit) * 0.5); /* 4px */
--spacing-sm: var(--spacing-unit); /* 8px */
--spacing-md: calc(var(--spacing-unit) * 1.5); /* 12px */
--spacing-lg: calc(var(--spacing-unit) * 2); /* 16px */

/* 大间距 */
--spacing-xl: calc(var(--spacing-unit) * 3); /* 24px */
--spacing-2xl: calc(var(--spacing-unit) * 4); /* 32px */
--spacing-3xl: calc(var(--spacing-unit) * 6); /* 48px */
--spacing-4xl: calc(var(--spacing-unit) * 8); /* 64px */
--spacing-5xl: calc(var(--spacing-unit) * 12); /* 96px */
```

### 5. 圆角系统

```css
--radius-xs: 4px; /* 极小圆角 */
--radius-sm: 6px; /* 小圆角 */
--radius-md: 8px; /* 中圆角 */
--radius-lg: 12px; /* 大圆角 */
--radius-xl: 16px; /* 超大圆角 */
--radius-2xl: 20px; /* 特大圆角 */
--radius-full: 9999px; /* 完全圆形 */
```

### 6. 断点系统

```css
/* 断点定义 */
--breakpoint-mobile: 640px; /* 移动端 */
--breakpoint-tablet: 768px; /* 平板 */
--breakpoint-desktop: 1024px; /* 桌面 */
--breakpoint-wide: 1280px; /* 宽屏 */
--breakpoint-ultrawide: 1536px; /* 超宽屏 */

/* 容器宽度 */
--container-max-width: 1200px; /* 最大容器宽度 */
--container-padding: 1rem; /* 容器内边距 */
```

### 7. 动画时长

```css
--duration-fast: 150ms; /* 快速动画 */
--duration-normal: 300ms; /* 正常动画 */
--duration-slow: 500ms; /* 慢速动画 */
--duration-extra-slow: 1000ms; /* 超慢动画 */

/* 缓动函数 */
--easing-linear: linear;
--easing-ease: ease;
--easing-ease-in: ease-in;
--easing-ease-out: ease-out;
--easing-ease-in-out: ease-in-out;
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

### 8. 阴影系统

```css
/* 层级阴影 */
--shadow-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
--shadow-2: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
--shadow-3: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
--shadow-4: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
--shadow-5: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);

/* 彩色阴影 */
--shadow-primary: 0 0 20px rgba(88, 166, 255, 0.3);
--shadow-accent: 0 0 20px rgba(45, 164, 78, 0.3);
--shadow-warning: 0 0 20px rgba(210, 153, 34, 0.3);
--shadow-error: 0 0 20px rgba(248, 81, 73, 0.3);
```

### 9. Z-Index层级系统

```css
--z-index-dropdown: 1000; /* 下拉菜单 */
--z-index-sticky: 1020; /* 粘性定位 */
--z-index-fixed: 1030; /* 固定定位 */
--z-index-modal-backdrop: 1040; /* 模态框背景 */
--z-index-modal: 1050; /* 模态框 */
--z-index-popover: 1060; /* 弹出提示 */
--z-index-tooltip: 1070; /* 工具提示 */
--z-index-toast: 1080; /* 消息提示 */
```

### 10. 设计原则

#### 视觉层次

1. **对比度原则**：确保文字和背景有足够的对比度
2. **间距原则**：使用8px网格系统确保视觉一致性
3. **对齐原则**：左对齐文本，居中布局组件
4. **重复原则**：重复使用设计元素建立品牌识别

#### 交互原则

1. **即时反馈**：用户操作后立即提供视觉反馈
2. **渐进披露**：复杂功能分层展示，避免信息过载
3. **容错设计**：提供撤销功能和确认对话框
4. **一致性**：相同功能在不同页面保持一致的交互模式

#### 性能原则

1. **懒加载**：图片和组件按需加载
2. **代码分割**：按路由和功能分割代码包
3. **缓存策略**：合理使用浏览器缓存
4. **资源优化**：图片压缩、字体优化
