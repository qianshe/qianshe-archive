// 通用工具类型定义

// 可选类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 必需类型
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// 深度可选
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 深度必需
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 可空类型
export type Nullable<T> = T | null;

// 非空类型
export type NonNullable<T> = T extends null | undefined ? never : T;

// 按值选择
export type PickByValue<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
>;

// 按值省略
export type OmitByValue<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? never : K }[keyof T]
>;

// 值类型
export type ValueOf<T> = T[keyof T];

// 数组元素类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 函数返回类型
export type ReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never;

// 函数参数类型
export type Parameters<T> = T extends (...args: infer P) => unknown ? P : never;

// 排除空值
export type NonNullish<T> = T extends null | undefined ? never : T;

// ID类型
export type ID = string | number;

// 时间戳类型
export type Timestamp = number | string | Date;

// URL类型
export type Url = string;

// 颜色类型
export type Color = string;

// 尺寸类型
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 方向类型
export type Direction = 'horizontal' | 'vertical';

// 对齐类型
export type Align = 'start' | 'center' | 'end' | 'stretch';

// 分布类型
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// 位置类型
export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

// 溢出类型
export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto';

// 显示类型
export type Display = 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';

// 光标类型
export type Cursor = 
  | 'default'
  | 'pointer'
  | 'move'
  | 'text'
  | 'wait'
  | 'help'
  | 'progress'
  | 'not-allowed'
  | 'crosshair'
  | 'grab'
  | 'grabbing';

// 事件处理器类型
export type EventHandler<T = Event> = (event: T) => void;
export type MouseEventHandler = EventHandler<React.MouseEvent>;
export type KeyboardEventHandler = EventHandler<React.KeyboardEvent>;
export type ChangeEventHandler = EventHandler<React.ChangeEvent>;
export type FocusEventHandler = EventHandler<React.FocusEvent>;

// 表单事件类型
export type FormEventHandler = EventHandler<React.FormEvent>;
export type SubmitEventHandler = EventHandler<React.FormEvent>;

// 拖拽事件类型
export type DragEventHandler = EventHandler<React.DragEvent>;

// 滚动事件类型
export type ScrollEventHandler = EventHandler<React.UIEvent>;

// 触摸事件类型
export type TouchEventHandler = EventHandler<React.TouchEvent>;

// 滚轮事件类型
export type WheelEventHandler = EventHandler<React.WheelEvent>;

// 异步操作状态类型
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

// 异步操作结果类型
export type AsyncResult<T, E = Error> = {
  status: AsyncStatus;
  data?: T;
  error?: E;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
};

// Promise类型
export type PromiseResult<T> = Promise<{
  data?: T;
  error?: Error;
  success: boolean;
}>;

// 键值对类型
export type KeyValuePair<K extends string | number = string, V = unknown> = {
  key: K;
  value: V;
};

// 选择器选项类型
export type SelectOption<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
};

// 树节点类型
export type TreeNode<T = unknown> = {
  id: string;
  label: string;
  value?: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  data?: Record<string, unknown>;
};

// 步骤类型
export type Step = {
  id: string;
  title: string;
  description?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
  icon?: React.ReactNode;
  disabled?: boolean;
};

// 面包屑项类型
export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
};

// 标签页项类型
export type TabItem = {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  icon?: React.ReactNode;
};