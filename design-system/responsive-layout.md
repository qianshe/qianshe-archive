# 响应式布局策略

## Responsive Layout Strategy

### 1. 断点系统设计

#### 1.1 断点定义

```css
/* 断点系统 */
$breakpoints: (
  'mobile': 640px,
  /* 手机竖屏 */ 'tablet': 768px,
  /* 平板竖屏 */ 'desktop': 1024px,
  /* 小型桌面 */ 'wide': 1280px,
  /* 标准桌面 */ 'ultrawide': 1536px /* 大型桌面 */
);

/* 媒体查询工具类 */
@mixin mobile {
  @media (max-width: #{$breakpoints['mobile'] - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoints['mobile']}) and (max-width: #{$breakpoints['tablet'] - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoints['tablet']}) {
    @content;
  }
}

@mixin wide {
  @media (min-width: #{$breakpoints['desktop']}) {
    @content;
  }
}

@mixin ultrawide {
  @media (min-width: #{$breakpoints['wide']}) {
    @content;
  }
}
```

#### 1.2 容器系统

```css
/* 响应式容器 */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--container-padding, 1rem);
  max-width: var(--container-max-width, 1200px);
}

.container-sm {
  max-width: 640px;
}
.container-md {
  max-width: 768px;
}
.container-lg {
  max-width: 1024px;
}
.container-xl {
  max-width: 1280px;
}
.container-2xl {
  max-width: 1536px;
}
.container-fluid {
  max-width: none;
}

/* 流体布局 */
.container-fluid {
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

@include mobile {
  .container-fluid {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}
```

### 2. 栅格系统

#### 2.1 基础栅格

```css
/* 12列栅格系统 */
.grid {
  display: grid;
  gap: var(--grid-gap, var(--spacing-lg));
}

.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}
.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
.grid-cols-6 {
  grid-template-columns: repeat(6, 1fr);
}
.grid-cols-12 {
  grid-template-columns: repeat(12, 1fr);
}

/* 响应式栅格 */
@include mobile {
  .grid-cols-mobile-1 {
    grid-template-columns: repeat(1, 1fr);
  }
  .grid-cols-mobile-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include tablet {
  .grid-cols-tablet-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-cols-tablet-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@include desktop {
  .grid-cols-desktop-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .grid-cols-desktop-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 自适应栅格 */
.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.grid-auto-sm {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.grid-auto-lg {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}
```

#### 2.2 Flexbox布局

```css
/* Flex容器 */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.flex-row {
  flex-direction: row;
}
.flex-wrap {
  flex-wrap: wrap;
}
.flex-nowrap {
  flex-wrap: nowrap;
}

/* 对齐方式 */
.justify-start {
  justify-content: flex-start;
}
.justify-center {
  justify-content: center;
}
.justify-end {
  justify-content: flex-end;
}
.justify-between {
  justify-content: space-between;
}
.justify-around {
  justify-content: space-around;
}
.justify-evenly {
  justify-content: space-evenly;
}

.items-start {
  align-items: flex-start;
}
.items-center {
  align-items: center;
}
.items-end {
  align-items: flex-end;
}
.items-stretch {
  align-items: stretch;
}

/* 响应式Flex */
@include mobile {
  .mobile-col {
    flex-direction: column;
  }
  .mobile-center {
    justify-content: center;
  }
}
```

### 3. 页面布局策略

#### 3.1 首页布局

```css
/* 首页响应式布局 */
.home-layout {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
}

/* Hero区域 */
.hero-section {
  padding: var(--spacing-5xl) 0;
  text-align: center;

  @include mobile {
    padding: var(--spacing-3xl) 0;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 特色内容区 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  padding: var(--spacing-4xl) 0;

  @include mobile {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    padding: var(--spacing-3xl) 0;
  }
}

/* 最新文章区 */
.recent-articles {
  padding: var(--spacing-4xl) 0;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-2xl);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
}
```

#### 3.2 博客列表页布局

```css
/* 博客列表布局 */
.blog-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-3xl);
  padding: var(--spacing-3xl) 0;

  @include desktop {
    grid-template-columns: 250px 1fr;
  }

  @include tablet {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }
}

/* 侧边栏 */
.blog-sidebar {
  position: sticky;
  top: var(--spacing-lg);
  height: fit-content;

  @include tablet {
    position: static;
    order: 2;
  }
}

.sidebar-section {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

/* 文章列表 */
.blog-main {
  @include tablet {
    order: 1;
  }
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.article-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--easing-smooth);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-3);
  }

  @include mobile {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
```

#### 3.3 博客详情页布局

```css
/* 博客详情布局 */
.post-layout {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

/* 文章头部 */
.post-header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;

  @include mobile {
    margin-bottom: var(--spacing-2xl);
  }
}

.post-title {
  font-size: var(--font-size-display-3);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-lg);

  @include mobile {
    font-size: var(--font-size-h1);
  }
}

.post-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--color-text-secondary);

  @include mobile {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* 文章内容 */
.post-content {
  font-size: var(--font-size-body-large);
  line-height: var(--line-height-relaxed);

  @include mobile {
    font-size: var(--font-size-body-medium);
  }
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl) 0;
}

/* 文章导航 */
.post-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-4xl);
  padding-top: var(--spacing-3xl);
  border-top: 1px solid var(--color-border-primary);

  @include mobile {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
```

#### 3.4 作品集页面布局

```css
/* 作品集布局 */
.projects-layout {
  padding: var(--spacing-3xl) 0;
}

/* 筛选器 */
.projects-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-3xl);
}

.filter-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-normal);

  &:hover,
  &.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
}

/* 项目网格 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-2xl);

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.project-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-smooth);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-4);
  }
}

.project-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: var(--color-bg-tertiary);
}

.project-content {
  padding: var(--spacing-lg);
}

.project-title {
  font-size: var(--font-size-h3);
  margin-bottom: var(--spacing-sm);
}

.project-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-lg);
}

.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tech-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);
}
```

### 4. 导航系统

#### 4.1 主导航栏

```css
/* 主导航栏 */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-sticky);
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(10px);
  transition: all var(--duration-normal);

  &.scrolled {
    background: var(--color-bg-primary);
    box-shadow: var(--shadow-2);
  }
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.nav-logo {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);

  @include tablet {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    max-width: 400px;
    height: 100vh;
    background: var(--color-bg-primary);
    flex-direction: column;
    justify-content: flex-start;
    padding: var(--spacing-3xl) var(--spacing-lg);
    transition: right var(--duration-normal);

    &.open {
      right: 0;
    }
  }
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-normal);

  &:hover,
  &.active {
    color: var(--color-primary);
  }

  @include tablet {
    font-size: var(--font-size-h5);
    padding: var(--spacing-lg) 0;
  }
}

/* 移动端菜单按钮 */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;

  @include tablet {
    display: flex;
  }
}

.menu-line {
  width: 100%;
  height: 2px;
  background: var(--color-text-primary);
  transition: all var(--duration-normal);

  .mobile-menu-toggle.active & {
    background: var(--color-primary);
  }

  .mobile-menu-toggle.active &:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .mobile-menu-toggle.active &:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-toggle.active &:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
}
```

#### 4.2 面包屑导航

```css
/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) 0;
  font-size: var(--font-size-body-small);
  color: var(--color-text-secondary);

  @include mobile {
    padding: var(--spacing-md) 0;
    font-size: var(--font-size-body-xsmall);
  }
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.breadcrumb-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-normal);

  &:hover {
    color: var(--color-primary);
  }
}

.breadcrumb-separator {
  color: var(--color-text-tertiary);
}

.breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}
```

### 5. 表单布局

#### 5.1 响应式表单

```css
/* 表单容器 */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-3xl);

  @include mobile {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
}

/* 表单网格 */
.form-grid {
  display: grid;
  gap: var(--spacing-lg);

  &.cols-2 {
    grid-template-columns: 1fr 1fr;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  &.cols-3 {
    grid-template-columns: repeat(3, 1fr);

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
  }
}

/* 表单字段 */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &.horizontal {
    flex-direction: row;
    align-items: center;

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

.form-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);

  .form-field.horizontal & {
    min-width: 120px;

    @include mobile {
      min-width: auto;
    }
  }
}

.form-input {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-body-medium);
  transition: all var(--duration-normal);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
  }

  &.error {
    border-color: var(--color-error);
  }
}

/* 表单操作区 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);

  @include mobile {
    flex-direction: column;
  }
}

.form-button {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal);

  &.primary {
    background: var(--color-primary);
    color: white;

    &:hover {
      background: var(--color-secondary);
    }
  }

  &.secondary {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);

    &:hover {
      background: var(--color-bg-elevated);
    }
  }

  @include mobile {
    width: 100%;
  }
}
```

### 6. 特殊布局模式

#### 6.1 全屏布局

```css
/* 全屏布局 */
.fullscreen-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.fullscreen-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-3xl);
}
```

#### 6.2 瀑布流布局

```css
/* 瀑布流布局 */
.masonry-layout {
  column-count: 3;
  column-gap: var(--spacing-xl);

  @include desktop {
    column-count: 2;
  }

  @include mobile {
    column-count: 1;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: var(--spacing-xl);
}
```

#### 6.3 视差滚动布局

```css
/* 视差滚动 */
.parallax-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  transform: translateY(0);
  will-change: transform;
}

.parallax-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: var(--spacing-3xl);
}
```

### 7. 响应式测试策略

#### 7.1 测试断点

- **320px**：最小手机屏幕
- **375px**：iPhone SE
- **414px**：iPhone Pro
- **640px**：大手机竖屏
- **768px**：iPad 竖屏
- **1024px**：iPad 横屏/小桌面
- **1280px**：标准桌面
- **1536px**：大桌面

#### 7.2 性能考虑

- 使用 CSS Grid 优先于 Flexbox
- 避免过度使用媒体查询
- 优化图片加载策略
- 使用相对单位 (rem, em, %)
- 合理使用 CSS 变量

#### 7.3 可访问性

- 确保触摸目标最小 44px
- 保持足够的对比度
- 支持键盘导航
- 提供跳转链接
- 使用语义化 HTML5 标签
