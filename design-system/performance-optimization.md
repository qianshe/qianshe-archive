# 性能优化与 Cloudflare Workers 适配策略

## Performance Optimization & CF Workers Adaptation

### 1. Cloudflare Workers 环境分析

#### 1.1 环境限制与特点

```typescript
// Cloudflare Workers 环境限制
interface CFWConstraints {
  // 内存限制
  memoryLimit: '128MB';

  // 执行时间限制
  executionTimeout: '50ms for free, 30 seconds for paid';

  // 包大小限制
  bundleSizeLimit: '1MB compressed';

  // 不支持的API
  unsupportedAPIs: [
    'Node.js APIs',
    'File System Access',
    'Database Connections',
    'Heavy DOM Manipulation'
  ];

  // 支持的现代特性
  supportedFeatures: ['ES2020+', 'Web Crypto API', 'Fetch API', 'Streams API', 'WebAssembly'];
}
```

#### 1.2 性能优化目标

- **首次内容绘制 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **首次输入延迟 (FID)**: < 100ms
- **累积布局偏移 (CLS)**: < 0.1
- **包大小**: < 500KB (gzipped)
- **运行时内存**: < 50MB

### 2. 包大小优化策略

#### 2.1 依赖分析与优化

```typescript
// 依赖优化配置
export const dependencyOptimization = {
  // Tree-shaking 配置
  treeshaking: {
    enabled: true,
    mode: 'strict',
    sideEffects: false
  },

  // 代码分割策略
  codeSplitting: {
    strategy: 'route-based',
    chunks: 'all',
    maxInitialRequests: 25,
    maxAsyncRequests: 25
  },

  // 依赖替换
  replacements: {
    // 用轻量级库替换重型库
    moment: 'date-fns',
    lodash: 'lodash-es',
    axios: 'fetch-api',

    // 使用原生API
    'query-string': 'URLSearchParams',
    uuid: 'crypto.randomUUID'
  },

  // 动态导入
  dynamicImports: ['framer-motion', 'react-markdown', 'recharts', 'react-syntax-highlighter']
};

// Vite 配置优化
export const viteOptimization = {
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', '@radix-ui/react-*'],
          utils: ['date-fns', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@types/react']
  }
};
```

#### 2.2 字体优化策略

```typescript
// 字体优化配置
export const fontOptimization = {
  // 字体预加载
  preloads: [
    {
      href: '/fonts/inter-subset.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ],

  // 字体子集化
  subsets: {
    latin: 'common latin characters',
    chinese: 'common chinese characters'
  },

  // 字体显示策略
  fontDisplay: 'swap',

  // 关键字体内联
  criticalFonts: {
    family: 'Inter',
    weight: '400',
    fallback: 'system-ui, sans-serif'
  }
};

// 字体加载优化
export const FontOptimization: React.FC = () => {
  useEffect(() => {
    // 字体预加载
    const preloadFont = (url: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    };

    // 预加载关键字体
    preloadFont('/fonts/inter-subset.woff2');
  }, []);

  return null;
};
```

### 3. 组件性能优化

#### 3.1 React 性能优化

```typescript
// 性能优化的组件模式
export const OptimizedComponent = {
  // 1. memo 包装
  Memoized: React.memo(({ data, onUpdate }) => {
    return (
      <div>
        {data.map(item => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    );
  }, (prevProps, nextProps) => {
    // 自定义比较函数
    return prevProps.data.length === nextProps.data.length &&
           prevProps.data.every(item =>
             nextProps.data.some(nextItem => nextItem.id === item.id)
           );
  }),

  // 2. useMemo 优化
  Computed: ({ items, filter }) => {
    const filteredItems = useMemo(() => {
      return items.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
      );
    }, [items, filter]);

    return <List items={filteredItems} />;
  },

  // 3. useCallback 优化
  EventHandler: ({ onItemSelect }) => {
    const handleItemClick = useCallback((item: Item) => {
      onItemSelect(item);
    }, [onItemSelect]);

    return <ItemList onItemClick={handleItemClick} />;
  },

  // 4. 虚拟化长列表
  VirtualizedList: ({ items }) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

    const visibleItems = useMemo(() => {
      return items.slice(visibleRange.start, visibleRange.end);
    }, [items, visibleRange]);

    const handleScroll = useCallback((e: React.UIEvent) => {
      const scrollTop = e.currentTarget.scrollTop;
      const itemHeight = 60;
      const visibleCount = Math.ceil(window.innerHeight / itemHeight);
      const start = Math.floor(scrollTop / itemHeight);
      const end = start + visibleCount + 5; // buffer

      setVisibleRange({ start, end });
    }, []);

    return (
      <div className="h-96 overflow-auto" onScroll={handleScroll}>
        <div style={{ height: items.length * 60 }}>
          <div style={{ transform: `translateY(${visibleRange.start * 60}px)` }}>
            {visibleItems.map(item => (
              <div key={item.id} style={{ height: 60 }}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};
```

#### 3.2 图片优化策略

```typescript
// 图片优化组件
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  className?: string;
}> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  className,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // 懒加载观察器
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // 响应式图片URL生成
  const generateResponsiveUrl = (originalSrc: string) => {
    // Cloudflare Image Resizing
    if (originalSrc.includes('cloudinary.com')) {
      return {
        src: originalSrc,
        srcSet: `
          ${originalSrc}?w=400 400w,
          ${originalSrc}?w=800 800w,
          ${originalSrc}?w=1200 1200w
        `,
        sizes: '(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px',
      };
    }

    return {
      src: originalSrc,
      srcSet: undefined,
      sizes: undefined,
    };
  };

  const { src: optimizedSrc, srcSet, sizes } = generateResponsiveUrl(src);

  return (
    <div ref={imgRef} className={cn("relative", className)}>
      {/* 占位符 */}
      {placeholder === 'blur' && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      {/* 主图片 */}
      {isInView && (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

// Progressive Web App 缓存策略
export const imageCacheStrategy = {
  // Service Worker 缓存配置
  cacheName: 'blog-images-v1',
  cacheStrategy: 'CacheFirst',

  // 图片预缓存
  precacheImages: [
    '/images/hero-bg.webp',
    '/images/logo.svg',
    '/images/avatar.webp',
  ],

  // 动态缓存规则
  cacheRules: [
    {
      urlPattern: /^https?:\/\/.*\.(jpg|jpeg|png|webp|avif)$/,
      strategy: 'CacheFirst',
      cacheName: 'images',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
    },
  ],
};
```

### 4. 数据获取优化

#### 4.1 数据缓存策略

```typescript
// 智能缓存 Hook
export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // 缓存时间 (ms)
    staleWhileRevalidate?: boolean;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;

  useEffect(() => {
    const fetchData = async () => {
      // 检查缓存
      const cached = localStorage.getItem(`cache_${key}`);

      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < ttl) {
          setData(cachedData);
          return;
        }

        if (staleWhileRevalidate) {
          setData(cachedData); // 显示过期数据
        }
      }

      try {
        setLoading(true);
        const freshData = await fetcher();

        // 更新缓存
        localStorage.setItem(
          `cache_${key}`,
          JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          })
        );

        setData(freshData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetcher, ttl, staleWhileRevalidate]);

  const mutate = useCallback(async () => {
    try {
      const freshData = await fetcher();
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        })
      );
      setData(freshData);
    } catch (err) {
      setError(err as Error);
    }
  }, [key, fetcher]);

  return { data, loading, error, mutate };
};

// 预取策略
export const usePrefetch = () => {
  const prefetchCache = useRef(new Set<string>());

  const prefetch = useCallback(async (url: string) => {
    if (prefetchCache.current.has(url)) return;

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);

      prefetchCache.current.add(url);
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }, []);

  return { prefetch };
};

// 智能预取 Hook
export const useSmartPrefetch = (baseUrl: string) => {
  const { prefetch } = usePrefetch();
  const [userIntent, setUserIntent] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const href = target.getAttribute('href');

      if (href && href.startsWith(baseUrl)) {
        setUserIntent(href);
        prefetch(href);
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [baseUrl, prefetch]);

  return { userIntent };
};
```

#### 4.2 API 优化

```typescript
// API 响应优化
export const apiOptimization = {
  // 响应压缩
  compression: {
    enabled: true,
    algorithms: ['gzip', 'brotli'],
    threshold: 1024 // 压缩阈值
  },

  // 分页优化
  pagination: {
    defaultSize: 20,
    maxSize: 100,
    strategy: 'cursor-based' // cursor-based vs offset-based
  },

  // 字段选择
  fieldSelection: {
    enabled: true,
    defaultFields: ['id', 'title', 'excerpt', 'publishedAt'],
    availableFields: [
      'id',
      'title',
      'content',
      'excerpt',
      'publishedAt',
      'author',
      'tags',
      'category',
      'views',
      'likes'
    ]
  },

  // 条件请求
  conditionalRequests: {
    enabled: true,
    etag: true,
    lastModified: true
  }
};

// 优化的 API 客户端
export const optimizedApiClient = {
  // 带缓存的 GET 请求
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = `GET_${url}`;

    // 检查缓存
    const cached = await caches.open('api-cache');
    const cachedResponse = await cached.match(cacheKey);

    if (cachedResponse && !options.force) {
      const etag = cachedResponse.headers.get('etag');

      // 条件请求
      if (etag) {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'If-None-Match': etag
          }
        });

        if (response.status === 304) {
          return cachedResponse.json();
        }

        // 更新缓存
        await cached.put(cacheKey, response.clone());
        return response.json();
      }

      return cachedResponse.json();
    }

    // 正常请求
    const response = await fetch(url, options);

    // 缓存响应
    if (response.ok) {
      await cached.put(cacheKey, response.clone());
    }

    return response.json();
  },

  // 批量请求
  async batch<T>(requests: Array<{ url: string; options?: RequestInit }>): Promise<T[]> {
    const promises = requests.map(req => this.get<T>(req.url, req.options));
    return Promise.all(promises);
  },

  // 并发请求限制
  async concurrent<T>(
    requests: Array<{ url: string; options?: RequestInit }>,
    limit: number = 5
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += limit) {
      const batch = requests.slice(i, i + limit);
      const batchResults = await Promise.all(batch.map(req => this.get<T>(req.url, req.options)));
      results.push(...batchResults);
    }

    return results;
  }
};
```

### 5. 运行时优化

#### 5.1 JavaScript 优化

```typescript
// 防抖和节流工具
export const optimizationUtils = {
  // 防抖函数
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // 节流函数
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  // requestAnimationFrame 节流
  rafThrottle<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void {
    let rafId: number;

    return (...args: Parameters<T>) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = 0;
      });
    };
  },

  // 空闲时间执行
  runWhenIdle<T extends (...args: any[]) => any>(func: T, timeout: number = 5000): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => func(), { timeout });
    } else {
      setTimeout(func, 1);
    }
  }
};

// 事件监听器优化
export const useOptimizedEventListener = () => {
  const listenersRef = useRef<Map<string, EventListener>>(new Map());

  const addListener = useCallback(
    (
      element: HTMLElement | Window,
      event: string,
      handler: EventListener,
      options?: AddEventListenerOptions
    ) => {
      // 移除旧的监听器
      const key = `${element.constructor.name}_${event}`;
      const oldHandler = listenersRef.current.get(key);
      if (oldHandler) {
        element.removeEventListener(event, oldHandler);
      }

      // 添加新监听器
      const optimizedHandler = optimizationUtils.rafThrottle(handler);
      element.addEventListener(event, optimizedHandler, options);
      listenersRef.current.set(key, optimizedHandler);
    },
    []
  );

  const removeListener = useCallback((element: HTMLElement | Window, event: string) => {
    const key = `${element.constructor.name}_${event}`;
    const handler = listenersRef.current.get(key);
    if (handler) {
      element.removeEventListener(event, handler);
      listenersRef.current.delete(key);
    }
  }, []);

  useEffect(() => {
    // 清理所有监听器
    return () => {
      listenersRef.current.forEach((handler, key) => {
        const [elementName, event] = key.split('_');
        // 这里需要根据实际情况获取元素引用
      });
      listenersRef.current.clear();
    };
  }, []);

  return { addListener, removeListener };
};
```

#### 5.2 内存管理

```typescript
// 内存优化工具
export const memoryOptimization = {
  // 弱引用缓存
  createWeakCache<K extends object, V>(): WeakMap<K, V> {
    return new WeakMap();
  },

  // 大对象清理
  cleanupLargeObjects: {
    images: () => {
      // 清理不在视口中的图片
      document.querySelectorAll('img[data-src]').forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight + 1000 || rect.bottom < -1000) {
          (img as HTMLImageElement).src = '';
        }
      });
    },

    dom: () => {
      // 清理隐藏的DOM元素
      const hiddenElements = document.querySelectorAll('[style*="display: none"]');
      hiddenElements.forEach(el => {
        if (el.parentElement?.children.length === 1) {
          el.parentElement?.remove();
        }
      });
    }
  },

  // 内存监控
  monitorMemory: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }
};

// 内存优化 Hook
export const useMemoryOptimization = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const info = memoryOptimization.monitorMemory();
      setMemoryInfo(info);

      // 内存使用过高时进行清理
      if (info && info.used / info.limit > 0.8) {
        memoryOptimization.cleanupLargeObjects.images();
        memoryOptimization.cleanupLargeObjects.dom();
      }
    }, 30000); // 每30秒检查一次

    return () => clearInterval(interval);
  }, []);

  const forceCleanup = useCallback(() => {
    memoryOptimization.cleanupLargeObjects.images();
    memoryOptimization.cleanupLargeObjects.dom();

    // 强制垃圾回收（如果支持）
    if ('gc' in window) {
      (window as any).gc();
    }
  }, []);

  return { memoryInfo, forceCleanup };
};
```

### 6. Cloudflare Workers 特定优化

#### 6.1 Edge Computing 优化

```typescript
// Cloudflare Workers 优化策略
export const cfWorkersOptimization = {
  // 边缘缓存策略
  edgeCaching: {
    // 静态资源缓存
    staticAssets: {
      ttl: 31536000, // 1年
      cacheKey: 'url',
      browserTTL: 86400 // 1天
    },

    // API 响应缓存
    apiResponses: {
      ttl: 300, // 5分钟
      cacheKey: 'url+headers',
      varyBy: ['Authorization', 'Accept']
    },

    // HTML 缓存
    pages: {
      ttl: 60, // 1分钟
      cacheKey: 'url',
      staleWhileRevalidate: 86400 // 1天
    }
  },

  // 压缩策略
  compression: {
    enabled: true,
    algorithms: ['brotli', 'gzip'],
    minimumSize: 1024,
    excludedTypes: ['image/*', 'video/*']
  },

  // 图片优化
  imageOptimization: {
    enabled: true,
    format: 'auto', // auto, webp, avif
    quality: 80,
    resizing: {
      enabled: true,
      maxWidth: 1920,
      maxHeight: 1080
    }
  }
};

// Workers Service Worker
export const cfWorkerScript = `
// Cloudflare Workers Service Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 静态资源缓存
  if (isStaticAsset(url.pathname)) {
    return cacheFirst(request);
  }
  
  // API 请求缓存
  if (url.pathname.startsWith('/api/')) {
    return staleWhileRevalidate(request);
  }
  
  // HTML 页面缓存
  if (isPageRequest(url.pathname)) {
    return networkFirst(request);
  }
  
  // 图片优化
  if (isImageRequest(url.pathname)) {
    return optimizeImage(request);
  }
  
  return fetch(request);
}

function isStaticAsset(pathname) {
  return /\\.(css|js|woff2|png|jpg|jpeg|webp|avif|svg|ico)$/i.test(pathname);
}

function isPageRequest(pathname) {
  return !isStaticAsset(pathname) && !pathname.startsWith('/api/') && !pathname.startsWith('/admin/');
}

function isImageRequest(pathname) {
  return /\\.(jpg|jpeg|png|webp|avif)$/i.test(pathname);
}

async function cacheFirst(request) {
  const cache = caches.default;
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    const responseToCache = response.clone();
    await cache.put(request, responseToCache);
  }
  
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = caches.default;
  const cached = await cache.match(request);
  
  // 异步更新缓存
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }
    return response;
  });
  
  // 返回缓存版本（如果存在）
  if (cached) {
    return cached;
  }
  
  // 否则等待网络请求
  return fetchPromise;
}

async function networkFirst(request) {
  const cache = caches.default;
  const cached = await cache.match(request);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    // 网络失败时返回缓存
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

async function optimizeImage(request) {
  const url = new URL(request.url);
  
  // 添加图片优化参数
  const optimizedUrl = \`https://images.workers.dev?url=\${encodeURIComponent(url.href)}&format=auto&quality=80\`;
  
  const response = await fetch(optimizedUrl);
  
  // 缓存优化后的图片
  if (response.ok) {
    const cache = caches.default;
    await cache.put(request, response.clone());
  }
  
  return response;
}
`;
```

#### 6.2 边缘函数优化

```typescript
// 边缘函数配置
export const edgeFunctions = {
  // 地理位置路由
  geoRouting: {
    enabled: true,
    rules: [
      {
        countries: ['CN', 'HK', 'TW'],
        endpoint: 'https://asia.blog.example.com'
      },
      {
        countries: ['US', 'CA'],
        endpoint: 'https://us.blog.example.com'
      },
      {
        default: 'https://global.blog.example.com'
      }
    ]
  },

  // A/B 测试
  abTesting: {
    enabled: true,
    experiments: [
      {
        name: 'homepage-variant',
        traffic: 0.5, // 50% 流量
        variants: [
          { name: 'control', weight: 0.5 },
          { name: 'variant-a', weight: 0.5 }
        ]
      }
    ]
  },

  // 个性化
  personalization: {
    enabled: true,
    features: ['content-recommendations', 'personalized-layout', 'dynamic-pricing']
  }
};

// 边缘计算示例
export const edgeComputingExamples = {
  // 内容推荐
  contentRecommendation: `
async function getContentRecommendations(userId, userAgent) {
  const visitorId = getOrCreateVisitorId(request);
  const preferences = await getUserPreferences(visitorId);
  
  // 基于用户偏好推荐内容
  const recommendations = await fetchRecommendations(preferences);
  
  return new Response(JSON.stringify(recommendations), {
    headers: { 'Content-Type': 'application/json' }
  });
}
  `,

  // 动态定价
  dynamicPricing: `
async function getDynamicPricing(product, location, device) {
  const basePrice = product.basePrice;
  const locationMultiplier = getLocationMultiplier(location);
  const deviceMultiplier = getDeviceMultiplier(device);
  
  const finalPrice = basePrice * locationMultiplier * deviceMultiplier;
  
  return new Response(JSON.stringify({ price: finalPrice }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
  `,

  // 智能缓存
  intelligentCaching: `
async function smartCaching(request) {
  const url = new URL(request.url);
  const cacheKey = generateCacheKey(request);
  
  // 检查缓存
  const cached = await CACHE.get(cacheKey);
  if (cached) {
    const data = await cached.json();
    
    // 检查数据新鲜度
    if (isDataFresh(data)) {
      return new Response(JSON.stringify(data.body), data.headers);
    }
    
    // 后台更新
    updateCacheInBackground(request, cacheKey);
    
    return new Response(JSON.stringify(data.body), data.headers);
  }
  
  // 获取新数据
  const response = await fetch(request);
  const responseData = await response.json();
  
  // 存储到缓存
  await CACHE.put(cacheKey, JSON.stringify({
    body: responseData,
    headers: Object.fromEntries(response.headers),
    timestamp: Date.now()
  }));
  
  return new Response(JSON.stringify(responseData), {
    headers: response.headers
  });
}
  `
};
```

### 7. 性能监控

#### 7.1 性能指标监控

```typescript
// 性能监控配置
export const performanceMonitoring = {
  // Core Web Vitals
  coreWebVitals: {
    enabled: true,
    thresholds: {
      LCP: 2500, // Largest Contentful Paint
      FID: 100, // First Input Delay
      CLS: 0.1 // Cumulative Layout Shift
    },
    sampleRate: 0.1 // 10% 采样率
  },

  // 自定义指标
  customMetrics: {
    enabled: true,
    metrics: [
      'time-to-interactive',
      'first-contentful-paint',
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'first-input-delay'
    ]
  },

  // 错误监控
  errorTracking: {
    enabled: true,
    sampleRate: 1.0,
    includeStackTrace: true,
    includeUserAgent: true
  }
};

// 性能监控 Hook
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // 监控 Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

    // 监控页面加载性能
    const handleLoad = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      const pageMetrics = {
        // 页面加载时间
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

        // 网络性能
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        sslConnect:
          navigation.secureConnectionStart > 0
            ? navigation.connectEnd - navigation.secureConnectionStart
            : 0,
        ttfb: navigation.responseStart - navigation.requestStart,

        // 处理性能
        domParse: navigation.domComplete - navigation.domLoading,
        resourceLoad: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
      };

      setMetrics(prev => ({ ...prev, ...pageMetrics }));

      // 发送到分析服务
      sendMetrics(pageMetrics);
    };

    window.addEventListener('load', handleLoad);

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // 监控长任务
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            // 长任务阈值: 50ms
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });

            // 发送长任务报告
            reportLongTask(entry);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // 某些浏览器不支持 longtask
        console.warn('Long task monitoring not supported');
      }

      return () => observer.disconnect();
    }
  }, []);

  const sendMetrics = useCallback((metrics: any) => {
    // 发送性能指标到分析服务
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Failed to send metrics:', err));
    }
  }, []);

  const reportLongTask = useCallback((entry: PerformanceEntry) => {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/long-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name,
          url: window.location.href,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Failed to report long task:', err));
    }
  }, []);

  return { metrics };
};
```

### 8. 性能预算工具

#### 8.1 性能预算配置

```typescript
// 性能预算配置
export const performanceBudget = {
  // 资源大小预算
  budgets: {
    javascript: 250, // KB
    css: 50, // KB
    images: 500, // KB
    fonts: 100, // KB
    total: 1000 // KB
  },

  // 性能指标预算
  metrics: {
    'first-contentful-paint': 1500, // ms
    'largest-contentful-paint': 2500, // ms
    'speed-index': 3400, // ms
    'time-to-interactive': 5000 // ms
  },

  // 请求数量预算
  requests: {
    total: 50,
    javascript: 10,
    css: 5,
    images: 20,
    fonts: 3
  }
};

// 性能预算检查工具
export const budgetChecker = {
  // 检查资源大小
  checkResourceSize: (resources: PerformanceResourceTiming[]) => {
    const sizes = {
      javascript: 0,
      css: 0,
      images: 0,
      fonts: 0,
      total: 0
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      const url = resource.name;

      sizes.total += size;

      if (url.endsWith('.js')) {
        sizes.javascript += size;
      } else if (url.endsWith('.css')) {
        sizes.css += size;
      } else if (url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
        sizes.images += size;
      } else if (url.match(/\.(woff|woff2|ttf|eot)$/i)) {
        sizes.fonts += size;
      }
    });

    const violations = Object.entries(sizes)
      .filter(([key, size]) => size > performanceBudget.budgets[key as keyof typeof sizes] * 1024)
      .map(([key, size]) => ({
        type: key,
        actual: Math.round(size / 1024),
        budget: performanceBudget.budgets[key as keyof typeof sizes],
        exceeded: true
      }));

    return {
      sizes: Object.fromEntries(
        Object.entries(sizes).map(([key, size]) => [key, Math.round(size / 1024)])
      ),
      violations,
      withinBudget: violations.length === 0
    };
  },

  // 生成性能报告
  generateReport: async () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const resourceCheck = budgetChecker.checkResourceSize(resources);

    const metrics = {
      'first-contentful-paint':
        performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      'largest-contentful-paint': 0, // 需要使用 web-vitals 库
      'speed-index': 0, // 需要计算
      'time-to-interactive': navigation.domInteractive - navigation.fetchStart
    };

    const metricViolations = Object.entries(metrics)
      .filter(([key, value]) => value > performanceBudget.metrics[key as keyof typeof metrics])
      .map(([key, value]) => ({
        type: key,
        actual: Math.round(value),
        budget: performanceBudget.metrics[key as keyof typeof metrics],
        exceeded: true
      }));

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      resources: resourceCheck,
      metrics: {
        values: metrics,
        violations: metricViolations,
        withinBudget: metricViolations.length === 0
      },
      requests: {
        total: resources.length,
        byType: {
          javascript: resources.filter(r => r.name.endsWith('.js')).length,
          css: resources.filter(r => r.name.endsWith('.css')).length,
          images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i))
            .length,
          fonts: resources.filter(r => r.name.match(/\.(woff|woff2|ttf|eot)$/i)).length
        }
      }
    };
  }
};
```

### 9. 实施建议

#### 9.1 优化实施步骤

```typescript
// 性能优化实施计划
export const optimizationRoadmap = {
  // 第一阶段：基础优化 (1-2周)
  phase1: {
    goals: ['减少包大小', '优化图片', '启用压缩'],
    tasks: [
      '配置 Vite 打包优化',
      '实现图片懒加载',
      '启用 Gzip/Brotli 压缩',
      '配置 Service Worker 缓存',
      '移除未使用的依赖'
    ],
    expectedImprovements: {
      bundleSize: '-30%',
      loadTime: '-25%',
      lighthouse: '+20 points'
    }
  },

  // 第二阶段：高级优化 (2-3周)
  phase2: {
    goals: ['代码分割', '预加载策略', '边缘优化'],
    tasks: [
      '实现路由级别的代码分割',
      '配置智能预加载',
      '实施 Cloudflare Workers 边缘计算',
      '优化 API 响应',
      '实现数据库查询优化'
    ],
    expectedImprovements: {
      bundleSize: '-20%',
      loadTime: '-30%',
      cacheHitRate: '+40%'
    }
  },

  // 第三阶段：监控与迭代 (持续)
  phase3: {
    goals: ['性能监控', '持续优化', '用户体验'],
    tasks: ['部署性能监控系统', '设置性能预算', '实施 A/B 测试', '收集用户反馈', '定期性能审计'],
    expectedImprovements: {
      userSatisfaction: '+25%',
      conversionRate: '+15%',
      errorRate: '-50%'
    }
  }
};
```

这个性能优化策略专门针对 Cloudflare Workers 环境进行了定制，涵盖了从代码优化到边缘计算的各个方面，确保您的个人博客能够在边缘网络中提供最佳性能。
