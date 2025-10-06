# 动画和交互设计规范

## Animation & Interaction Design Specification

### 1. 动画原则与理念

#### 1.1 核心原则

- **有意义性**：每个动画都有明确的功能目的
- **一致性**：相似操作使用相同的动画模式
- **性能优先**：保持 60fps 的流畅体验
- **可访问性**：支持减少动画的用户偏好设置
- **品牌一致性**：体现技术专业性和现代感

#### 1.2 动画层级

```typescript
// 动画优先级系统
enum AnimationPriority {
  CRITICAL = 1, // 关键交互反馈
  IMPORTANT = 2, // 重要状态变化
  NORMAL = 3, // 常规页面过渡
  SUBTLE = 4 // 微动效和装饰
}

// 动画复杂度等级
enum AnimationComplexity {
  SIMPLE = 'simple', // 简单过渡
  MODERATE = 'moderate', // 中等复杂度
  COMPLEX = 'complex' // 复杂动画序列
}
```

### 2. Framer Motion 配置

#### 2.1 动画配置系统

```typescript
// 动画配置文件
export const motionConfig = {
  // 全局配置
  transition: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1], // Material Design 缓动曲线
    duration: 0.3
  },

  // 预设动画时长
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8
  },

  // 缓动函数
  easing: {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    // Material Design 3
    emphasized: [0.2, 0, 0, 1],
    emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
    emphasizedAccelerate: [0.3, 0, 0.8, 0.15],
    standard: [0.2, 0, 0, 1],
    standardDecelerate: [0, 0, 0, 1],
    standardAccelerate: [0.3, 0, 1, 1]
  },

  // 弹簧配置
  spring: {
    bouncy: { type: 'spring', damping: 10, stiffness: 100 },
    smooth: { type: 'spring', damping: 20, stiffness: 300 },
    gentle: { type: 'spring', damping: 25, stiffness: 400 }
  }
};

// 动画变体预设
export const variants = {
  // 入场动画
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },

  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  slideInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },

  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
};
```

#### 2.2 自定义动画钩子

```typescript
// 滚动触发动画钩子
export const useScrollAnimation = (
  ref: RefObject<HTMLElement>,
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!options.triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options.threshold, options.rootMargin, options.triggerOnce]);

  return isVisible;
};

// 视差滚动钩子
export const useParallax = (ref: RefObject<HTMLElement>, speed: number = 0.5) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffsetY(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, speed]);

  return offsetY;
};

// 鼠标跟随动画钩子
export const useMouseFollow = (ref: RefObject<HTMLElement>, sensitivity: number = 0.1) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * sensitivity;
        const deltaY = (e.clientY - centerY) * sensitivity;

        setPosition({ x: deltaX, y: deltaY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [ref, sensitivity]);

  return position;
};
```

### 3. 页面转场动画

#### 3.1 路由转场

```typescript
// 页面转场组件
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: motionConfig.duration.normal,
            ease: motionConfig.easing.emphasizedDecelerate,
          },
        },
        exit: {
          opacity: 0,
          y: -20,
          transition: {
            duration: motionConfig.duration.fast,
            ease: motionConfig.easing.emphasizedAccelerate,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

// 路由配置
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <PageTransition>
            <Home />
          </PageTransition>
        ),
      },
      {
        path: "blog",
        element: (
          <PageTransition>
            <Blog />
          </PageTransition>
        ),
      },
      {
        path: "blog/:id",
        element: (
          <PageTransition>
            <BlogPost />
          </PageTransition>
        ),
      },
      // ... 其他路由
    ],
  },
]);
```

#### 3.2 模态框动画

```typescript
// 模态框背景动画
const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionConfig.duration.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: motionConfig.duration.fast },
  },
};

// 模态框内容动画
const modalContentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 400,
      duration: motionConfig.duration.normal,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: motionConfig.duration.fast,
      ease: motionConfig.easing.emphasizedAccelerate,
    },
  },
};

// 模态框组件
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  size = "md",
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={modalBackdropVariants}
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            className={cn(
              "relative z-10 w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl",
              {
                "max-w-sm": size === "sm",
                "max-w-lg": size === "lg",
                "max-w-2xl": size === "xl",
                "max-w-full mx-4": size === "full",
              }
            )}
            variants={modalContentVariants}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 4. 交互动画

#### 4.1 按钮动画

```typescript
// 按钮变体
const buttonVariants = {
  idle: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 400,
    },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  loading: {
    scale: 1,
    transition: { duration: 0.2 },
  },
};

// 动画按钮组件
export const AnimatedButton: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled && !loading ? "hover" : "idle"}
      whileTap={!disabled && !loading ? "tap" : "idle"}
      animate={loading ? "loading" : "idle"}
      disabled={disabled}
      {...props}
    >
      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </span>

      {/* 悬停效果 */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </motion.button>
  );
};
```

#### 4.2 卡片动画

```typescript
// 卡片悬停动画
const cardVariants = {
  idle: {
    y: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateX: 5,
    rotateY: 5,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// 动画卡片组件
export const AnimatedCard: React.FC<CardProps> = ({
  children,
  hoverable = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-card p-6 shadow-lg",
        hoverable && "cursor-pointer"
      )}
      variants={cardVariants}
      initial="idle"
      whileHover={hoverable ? "hover" : "idle"}
      whileTap={hoverable && onClick ? "tap" : "idle"}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
```

#### 4.3 列表项动画

```typescript
// 列表项交错动画
export const AnimatedList: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
}> = ({ children, staggerDelay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 400,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

### 5. 滚动动画

#### 5.1 滚动触发动画

```typescript
// 滚动触发容器
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  threshold?: number;
}> = ({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(ref, { threshold });

  const getVariants = () => {
    const base = { opacity: 0 };
    const visible = { opacity: 1 };

    switch (direction) {
      case "up":
        return {
          hidden: { ...base, y: 50 },
          visible: { ...visible, y: 0 },
        };
      case "down":
        return {
          hidden: { ...base, y: -50 },
          visible: { ...visible, y: 0 },
        };
      case "left":
        return {
          hidden: { ...base, x: -50 },
          visible: { ...visible, x: 0 },
        };
      case "right":
        return {
          hidden: { ...base, x: 50 },
          visible: { ...visible, x: 0 },
        };
      default:
        return {
          hidden: base,
          visible,
        };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{
        duration: motionConfig.duration.normal,
        delay,
        ease: motionConfig.easing.emphasizedDecelerate,
      }}
    >
      {children}
    </motion.div>
  );
};
```

#### 5.2 视差滚动

```typescript
// 视差背景组件
export const ParallaxBackground: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
}> = ({ children, speed = 0.5, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const offsetY = useParallax(ref, speed);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offsetY}px)`,
      }}
    >
      {children}
    </motion.div>
  );
};

// 视差英雄区域
export const ParallaxHero: React.FC<{
  title: string;
  subtitle: string;
  backgroundImage: string;
}> = ({ title, subtitle, backgroundImage }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 视差背景 */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10" />

      {/* 内容 */}
      <motion.div
        className="relative z-20 text-center text-white max-w-4xl mx-auto px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease: motionConfig.easing.emphasizedDecelerate,
        }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-white/80"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </section>
  );
};
```

### 6. 加载动画

#### 6.1 骨架屏动画

```typescript
// 骨架屏组件
export const Skeleton: React.FC<{
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}> = ({ className, variant = "text", width, height }) => {
  const variants = {
    text: {
      hidden: { opacity: 0 },
      visible: {
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
    circular: {
      hidden: { opacity: 0 },
      visible: {
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
    rectangular: {
      hidden: { opacity: 0 },
      visible: {
        opacity: [0.5, 0.8, 0.5],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    },
  };

  const baseClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <motion.div
      className={cn(
        "bg-muted",
        baseClasses[variant],
        className
      )}
      style={{ width, height }}
      variants={variants[variant]}
      initial="hidden"
      animate="visible"
    />
  );
};

// 文章卡片骨架屏
export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-lg">
      <div className="flex gap-4">
        <Skeleton variant="circular" width={60} height={60} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton height={16} />
        <Skeleton height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    </div>
  );
};
```

#### 6.2 进度动画

```typescript
// 进度条组件
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  animated?: boolean;
}> = ({ value, max = 100, className, animated = true }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: animated ? 0.5 : 0,
          ease: motionConfig.easing.emphasizedDecelerate,
        }}
      />
    </div>
  );
};

// 圆形进度指示器
export const CircularProgress: React.FC<{
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      initial={{ rotate: -90 }}
      animate={{ rotate: -90 }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* 进度圆 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.5,
            ease: motionConfig.easing.emphasizedDecelerate,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{Math.round(percentage)}%</span>
      </div>
    </motion.div>
  );
};
```

### 7. 微交互设计

#### 7.1 悬停效果

```typescript
// 磁性按钮效果
export const MagneticButton: React.FC<ButtonProps> = ({
  children,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * 0.2;
      const deltaY = (e.clientY - centerY) * 0.2;

      setPosition({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className="relative rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", damping: 25, stiffness: 400 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
};
```

#### 7.2 光标跟随效果

```typescript
// 自定义光标
export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 20,
        y: mousePosition.y - 20,
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 400,
      }}
    >
      <div className="w-10 h-10 bg-white rounded-full" />
    </motion.div>
  );
};
```

### 8. 性能优化

#### 8.1 动画性能配置

```typescript
// 性能优化的动画配置
export const performanceConfig = {
  // 使用 will-change 优化
  willChange: {
    transform: true,
    opacity: true,
  },

  // GPU 加速属性
  gpuAccelerated: [
    "transform",
    "opacity",
    "filter",
  ],

  // 避免的属性
  avoidProperties: [
    "width",
    "height",
    "padding",
    "margin",
    "left",
    "top",
  ],

  // 降低动画配置（用于低端设备）
  reducedMotion: {
    transition: { duration: 0 },
    whileHover: undefined,
    whileTap: undefined,
  },
};

// 检测用户动画偏好
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

// 条件动画组件
export const ConditionalAnimation: React.FC<{
  children: React.ReactNode;
  animation?: any;
}> = ({ children, animation }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return <motion.div {...animation}>{children}</motion.div>;
};
```

### 9. 可访问性考虑

#### 9.1 动画可访问性

```typescript
// 可访问的动画配置
export const accessibleAnimationConfig = {
  // 尊重用户的动画偏好
  respectPrefersReducedMotion: true,

  // 提供静态替代方案
  provideStaticAlternative: true,

  // 避免闪烁内容
  avoidFlashingContent: true,

  // 适当的动画时长
  appropriateDuration: {
    max: 5, // 最大 5 秒
    recommended: 0.3, // 推荐 0.3 秒
  },
};

// 动画暂停控制
export const AnimationControl: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [animationsPaused, setAnimationsPaused] = useState(false);

  useEffect(() => {
    // 检测用户偏好
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setAnimationsPaused(prefersReducedMotion);
  }, []);

  return (
    <div
      className={animationsPaused ? "animations-paused" : ""}
      style={{
        animationPlayState: animationsPaused ? "paused" : "running",
      }}
    >
      {children}
    </div>
  );
};
```

### 10. 动画测试策略

#### 10.1 动画测试工具

```typescript
// 动画测试工具
export const AnimationDebugger: React.FC = () => {
  const [isDebugging, setIsDebugging] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsDebugging(!isDebugging)}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {isDebugging ? "Hide" : "Show"} Animation Debug
      </button>

      {isDebugging && (
        <div className="bg-white text-black p-4 rounded mt-2 shadow-lg">
          <h3>Animation Debug Info</h3>
          <p>FPS: <span id="fps">60</span></p>
          <p>Active Animations: <span id="active-animations">0</span></p>
          <p>Performance Score: <span id="performance-score">100</span></p>
        </div>
      )}
    </div>
  );
};
```

这个动画和交互设计规范为您的个人博客和作品集网站提供了完整的动画系统，包括页面转场、交互动画、滚动效果、加载状态等各个方面，同时注重性能优化和可访问性。
