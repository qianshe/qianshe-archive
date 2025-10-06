/**
 * 高级工具类型和辅助类型定义
 * 提供更强大的类型操作工具和实用的辅助类型
 */

// =============================================================================
// 高级类型操作工具
// =============================================================================

// 条件类型增强
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type Not<C extends boolean> = C extends true ? false : true;
export type And<A extends boolean, B extends boolean> = A extends true ? B : false;
export type Or<A extends boolean, B extends boolean> = A extends true ? true : B;
export type Xor<A extends boolean, B extends boolean> = And<Or<A, B>, Not<And<A, B>>>;

// 类型检查增强
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsUnknown<T> = unknown extends T ? true : false;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsEqual<T, U> = T extends U ? U extends T ? true : false : false;
export type IsExtends<T, U> = T extends U ? true : false;

// 数组类型增强
export type ArrayToUnion<T> = T extends (infer U)[] ? U : never;
export type UnionToArray<T, L = LastOf<T>> = [T] extends [never] ? [] : [...UnionToArray<Exclude<T, L>>, L];
export type Length<T> = T extends { length: infer L } ? L : never;
export type First<T> = T extends [infer F, ...any[]] ? F : never;
export type Last<T> = T extends [...any[], infer L] ? L : never;
export type Tail<T> = T extends [any, ...infer R] ? R : never;
export type Head<T> = T extends [...infer H, any] ? H : never;
export type Reverse<T> = T extends [...infer Rest, infer Last] ? [Last, ...Reverse<Rest>] : [];
export type Append<T, U> = T extends [...infer Rest] ? [...Rest, U] : never;
export type Prepend<T, U> = T extends [...infer Rest] ? [U, ...Rest] : never;

// 对象类型增强
export type KeysOf<T> = keyof T;
export type ValuesOf<T> = T[keyof T];
export type EntriesOf<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type PickKeys<T, K extends keyof T> = Pick<T, K>;
export type OmitKeys<T, K extends keyof T> = Omit<T, K>;
export type Overwrite<T, U> = { [K in keyof T]: K extends keyof U ? U[K] : T[K] };

// 函数类型增强
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type Arguments<T> = T extends (...args: infer P) => any ? P : never;
export type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
export type OmitThisParameter<T> = T extends (this: any, ...args: infer P) => infer R ? (...args: P) => R : T;

// 字符串类型增强
export type Split<S extends string, D extends string> = 
  S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];
export type Join<T extends string[], D extends string> = 
  T extends [infer F extends string, ...infer R extends string[]] 
    ? R extends [] 
      ? F 
      : `${F}${D}${Join<R, D>}` 
    : '';
export type Capitalize<T extends string> = T extends `${infer F}${infer R}` 
  ? `${Uppercase<F>}${R}` 
  : T;
export type Uncapitalize<T extends string> = T extends `${infer F}${infer R}` 
  ? `${Lowercase<F>}${R}` 
  : T;
export type TitleCase<T extends string> = T extends `${infer F}${infer R}` 
  ? `${Capitalize<F>}${TitleCase<R>}` 
  : T;
export type CamelCase<T extends string> = T extends `${infer P}_${infer S}` 
  ? `${P}${Capitalize<S>}` 
  : T;
export type PascalCase<T extends string> = Capitalize<CamelCase<T>>;
export type KebabCase<T extends string> = T extends `${infer C}${infer R}` 
  ? C extends Uppercase<C> 
    ? `_${Lowercase<C>}${KebabCase<R>}` 
    : `${C}${KebabCase<R>}` 
  : T;
export type SnakeCase<T extends string> = KebabCase<T>;

// 数字类型操作
export type Add<A extends number, B extends number> = 
  [...Tuple<A>, ...Tuple<B>]['length'] extends number 
    ? [...Tuple<A>, ...Tuple<B>]['length'] 
    : never;
export type Subtract<A extends number, B extends number> = 
  Tuple<A> extends [...infer Rest, ...Tuple<B>] 
    ? Rest['length'] 
    : never;
export type Multiply<A extends number, B extends number> = 
  Tuple<B> extends [infer First, ...infer Rest] 
    ? First extends 0 
      ? 0 
      : Add<Multiply<A, Rest['length'] extends number ? Rest['length'] : never>, A> 
    : 0;
export type Divide<A extends number, B extends number> = 
  Division<A, B>['result'] extends number 
    ? Division<A, B>['result'] 
    : never;
export type Mod<A extends number, B extends number> = 
  Division<A, B>['remainder'] extends number 
    ? Division<A, B>['remainder'] 
    : never;

type Tuple<T extends number, R extends readonly unknown[] = []> = 
  R['length'] extends T ? R : Tuple<T, [...R, unknown]>;

type Division<A extends number, B extends number, Q extends readonly unknown[] = [], R extends readonly unknown[] = []> = 
  B extends 0 
    ? { result: never; remainder: never } 
    : A extends infer Arr 
      ? Arr extends readonly unknown[] 
        ? Arr['length'] extends B 
          ? { result: Q['length']; remainder: R['length'] } 
          : Arr extends readonly [...infer Rest, unknown] 
            ? Division<Rest['length'], B, [...Q, unknown], [...R, unknown]> 
            : { result: Q['length']; remainder: R['length'] } 
        : { result: Q['length']; remainder: R['length'] } 
      : { result: Q['length']; remainder: R['length'] };

// 范围和区间类型
export type Range<T = number> = {
  start: T;
  end: T;
  inclusive?: boolean;
};

export type Interval<T = number> = {
  min: T;
  max: T;
};

export type BoundedNumber<T extends number, Min extends number, Max extends number> = 
  T extends Min 
    ? T extends Max 
      ? T 
      : `${T} is greater than maximum ${Max}` 
    : `${T} is less than minimum ${Min}`;

// =============================================================================
// 模式匹配类型
// =============================================================================

// 模式匹配接口
export interface Pattern<T, R> {
  when: <P extends T>(pattern: P, handler: (value: P) => R) => Pattern<T, R>;
  otherwise: (handler: (value: T) => R) => R;
}

// 创建模式匹配器
export function match<T, R = unknown>(value: T): Pattern<T, R> {
  const patterns: Array<{ check: (v: T) => boolean; handler: (v: T) => R }> = [];

  return {
    when<P extends T>(pattern: P, handler: (value: P) => R): Pattern<T, R> {
      patterns.push({
        check: (v: T): v is P => v === pattern,
        handler: handler as (v: T) => R
      });
      return match(value);
    },
    otherwise(handler: (value: T) => R): R {
      for (const { check, handler } of patterns) {
        if (check(value)) {
          return handler(value);
        }
      }
      return handler(value);
    }
  };
}

// 类型守卫模式匹配
export function typeMatch<T, R>(value: T): TypePatternMatcher<T, R> {
  return new TypePatternMatcher(value);
}

class TypePatternMatcher<T, R> {
  constructor(private value: T) {}

  is<P extends T>(typeGuard: (value: T) => value is P, handler: (value: P) => R): TypePatternMatcher<T, R> {
    if (typeGuard(this.value)) {
      return { value: handler(this.value), handled: true } as any;
    }
    return this;
  }

  otherwise(handler: (value: T) => R): R {
    return handler(this.value);
  }
}

// =============================================================================
// 异步类型工具
// =============================================================================

// Promise 类型增强
export type PromiseValue<T> = T extends PromiseLike<infer U> ? U : T;
export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
export type PromiseFulfilledResult<T> = { status: 'fulfilled'; value: T };
export type PromiseRejectedResult = { status: 'rejected'; reason: any };
export type PromiseSettledResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;

// 异步状态类型
export interface AsyncState<T = unknown, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
  lastUpdated: number | null;
}

export interface AsyncConfig<T = unknown> {
  initialData?: T;
  retryCount?: number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// 异步操作工厂
export interface AsyncOperation<T = unknown, P extends any[] = any[]> {
  (...args: P): Promise<T>;
  isLoading: () => boolean;
  getError: () => Error | null;
  getData: () => T | null;
  reset: () => void;
}

// 创建异步操作
export function createAsyncOperation<T, P extends any[]>(
  asyncFn: (...args: P) => Promise<T>,
  config?: AsyncConfig<T>
): AsyncOperation<T, P> {
  let loading = false;
  let error: Error | null = null;
  let data: T | null = config?.initialData || null;

  const operation = async (...args: P): Promise<T> => {
    loading = true;
    error = null;
    
    try {
      const result = await asyncFn(...args);
      data = result;
      config?.onSuccess?.(result);
      return result;
    } catch (err) {
      error = err as Error;
      config?.onError?.(err as Error);
      throw err;
    } finally {
      loading = false;
    }
  };

  return Object.assign(operation, {
    isLoading: () => loading,
    getError: () => error,
    getData: () => data,
    reset: () => {
      loading = false;
      error = null;
      data = config?.initialData || null;
    }
  });
}

// =============================================================================
// 状态管理类型
// =============================================================================

// 状态基础接口
export interface State<T = unknown> {
  get(): T;
  set(value: T | ((current: T) => T)): void;
  subscribe(listener: (value: T, previousValue: T) => void): () => void;
}

export interface WritableState<T> extends State<T> {
  update(updater: (current: T) => T): void;
  reset(): void;
}

export interface ReadableState<T> extends State<T> {
  readonly: true;
}

// 状态创建器
export function createState<T>(initialValue: T): WritableState<T> {
  let value = initialValue;
  const listeners = new Set<(value: T, previousValue: T) => void>();

  return {
    get: () => value,
    set: (newValue) => {
      const previousValue = value;
      value = typeof newValue === 'function' ? (newValue as (current: T) => T)(value) : newValue;
      listeners.forEach(listener => listener(value, previousValue));
    },
    update: (updater) => {
      value = updater(value);
      listeners.forEach(listener => listener(value, value));
    },
    reset: () => {
      value = initialValue;
      listeners.forEach(listener => listener(value, value));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function createReadableState<T>(value: T): ReadableState<T> {
  return {
    ...createState(value),
    readonly: true as const
  };
}

// 计算状态
export interface ComputedState<T = unknown, D extends readonly any[] = any[]> {
  get(): T;
  dependencies: D;
  readonly: true;
}

export function createComputedState<T, D extends readonly State<any>[]>(
  compute: (...dependencies: D) => T,
  dependencies: D
): ComputedState<T, D> {
  let cachedValue: T;
  let dirty = true;

  const getValue = (): T => {
    if (dirty) {
      cachedValue = compute(...dependencies.map(dep => dep.get()));
      dirty = false;
    }
    return cachedValue;
  };

  dependencies.forEach(dep => {
    dep.subscribe(() => {
      dirty = true;
    });
  });

  return {
    get: getValue,
    dependencies,
    readonly: true as const
  };
}

// =============================================================================
// 事件系统类型
// =============================================================================

// 事件基础接口
export interface Event<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  id?: string;
  source?: string;
  bubbles?: boolean;
  cancelable?: boolean;
  defaultPrevented?: boolean;
  propagationStopped?: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface EventHandler<T = unknown> {
  (event: Event<T>): void | Promise<void>;
  priority?: number;
  once?: boolean;
  passive?: boolean;
}

export interface EventEmitter<T = Record<string, any>> {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void;
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void;
  emit<K extends keyof T>(event: K, data: T[K]): Promise<void>;
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void;
  removeAllListeners<K extends keyof T>(event?: K): void;
  listenerCount<K extends keyof T>(event: K): number;
  eventNames(): (keyof T)[];
}

// 事件创建器
export function createEvent<T = unknown>(type: string, data: T): Event<T> {
  return {
    type,
    data,
    timestamp: Date.now(),
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    }
  };
}

// 事件发射器实现
export function createEventEmitter<T extends Record<string, any> = Record<string, any>>(): EventEmitter<T> {
  const listeners = new Map<keyof T, Set<EventHandler>>();
  const onceListeners = new Map<keyof T, Set<EventHandler>>();

  const on = <K extends keyof T>(event: K, handler: EventHandler<T[K]>): (() => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(handler);
    return () => off(event, handler);
  };

  const off = <K extends keyof T>(event: K, handler: EventHandler<T[K]>): void => {
    listeners.get(event)?.delete(handler);
    onceListeners.get(event)?.delete(handler);
  };

  const emit = async <K extends keyof T>(event: K, data: T[K]): Promise<void> => {
    const evt = createEvent(String(event), data);
    const allListeners = [
      ...(listeners.get(event) || []),
      ...(onceListeners.get(event) || [])
    ];

    // 按优先级排序
    allListeners.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const handler of allListeners) {
      if (handler.once) {
        onceListeners.get(event)?.delete(handler);
      }
      try {
        await handler(evt);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    }
  };

  const once = <K extends keyof T>(event: K, handler: EventHandler<T[K]>): (() => void) => {
    const wrappedHandler = { ...handler, once: true } as EventHandler<T[K]>;
    if (!onceListeners.has(event)) {
      onceListeners.set(event, new Set());
    }
    onceListeners.get(event)!.add(wrappedHandler);
    return () => off(event, wrappedHandler);
  };

  const removeAllListeners = <K extends keyof T>(event?: K): void => {
    if (event) {
      listeners.delete(event);
      onceListeners.delete(event);
    } else {
      listeners.clear();
      onceListeners.clear();
    }
  };

  const listenerCount = <K extends keyof T>(event: K): number => {
    return (listeners.get(event)?.size || 0) + (onceListeners.get(event)?.size || 0);
  };

  const eventNames = (): (keyof T)[] => {
    return Array.from(new Set([...listeners.keys(), ...onceListeners.keys()]));
  };

  return {
    on,
    off,
    emit,
    once,
    removeAllListeners,
    listenerCount,
    eventNames
  };
}

// =============================================================================
// 缓存系统类型
// =============================================================================

// 缓存接口
export interface Cache<K = any, V = any> {
  get(key: K): V | undefined;
  set(key: K, value: V, options?: CacheOptions): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size(): number;
  keys(): K[];
  values(): V[];
  entries(): Array<[K, V]>;
  forEach(callbackfn: (value: V, key: K, cache: Cache<K, V>) => void): void;
}

export interface CacheOptions {
  ttl?: number; // 生存时间（毫秒）
  priority?: number; // 优先级
  tags?: string[]; // 标签
  maxSize?: number; // 最大大小
  onEvict?: (key: any, value: any) => void;
}

// LRU 缓存实现
export function createLRUCache<K = any, V = any>(maxSize: number): Cache<K, V> {
  const cache = new Map<K, { value: V; expires?: number; priority?: number }>();

  const get = (key: K): V | undefined => {
    const item = cache.get(key);
    if (!item) return undefined;
    
    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      cache.delete(key);
      return undefined;
    }
    
    // 移动到最前面（LRU）
    cache.delete(key);
    cache.set(key, item);
    return item.value;
  };

  const set = (key: K, value: V, options?: CacheOptions): void => {
    // 如果缓存已满，删除最久未使用的项
    if (cache.size >= maxSize && !cache.has(key)) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    const item: any = { value };
    if (options?.ttl) {
      item.expires = Date.now() + options.ttl;
    }
    if (options?.priority) {
      item.priority = options.priority;
    }

    cache.set(key, item);
  };

  const has = (key: K): boolean => {
    const item = cache.get(key);
    if (!item) return false;
    
    if (item.expires && Date.now() > item.expires) {
      cache.delete(key);
      return false;
    }
    
    return true;
  };

  const deleteKey = (key: K): boolean => {
    return cache.delete(key);
  };

  const clear = (): void => {
    cache.clear();
  };

  const size = (): number => {
    return cache.size;
  };

  const keys = (): K[] => {
    return Array.from(cache.keys());
  };

  const values = (): V[] => {
    return Array.from(cache.values()).map(item => item.value);
  };

  const entries = (): Array<[K, V]> => {
    return Array.from(cache.entries()).map(([key, item]) => [key, item.value]);
  };

  const forEach = (callbackfn: (value: V, key: K, cache: Cache<K, V>) => void): void => {
    cache.forEach((item, key) => {
      callbackfn(item.value, key, { get, set, has, delete: deleteKey, clear, size, keys, values, entries, forEach } as Cache<K, V>);
    });
  };

  return {
    get,
    set,
    has,
    delete: deleteKey,
    clear,
    size,
    keys,
    values,
    entries,
    forEach
  };
}

// TTL 缓存实现
export function createTTLCache<K = any, V = any>(defaultTTL: number = 5 * 60 * 1000): Cache<K, V> {
  const cache = new Map<K, { value: V; expires: number }>();
  
  // 定期清理过期项
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now > item.expires) {
        cache.delete(key);
      }
    }
  }, 60 * 1000); // 每分钟清理一次

  const get = (key: K): V | undefined => {
    const item = cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expires) {
      cache.delete(key);
      return undefined;
    }
    
    return item.value;
  };

  const set = (key: K, value: V, options?: CacheOptions): void => {
    const expires = Date.now() + (options?.ttl || defaultTTL);
    cache.set(key, { value, expires });
  };

  const has = (key: K): boolean => {
    const item = cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      cache.delete(key);
      return false;
    }
    
    return true;
  };

  const deleteKey = (key: K): boolean => {
    return cache.delete(key);
  };

  const clear = (): void => {
    cache.clear();
    clearInterval(cleanup);
  };

  const size = (): number => {
    // 清理过期项后再返回大小
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now > item.expires) {
        cache.delete(key);
      }
    }
    return cache.size;
  };

  const keys = (): K[] => {
    const now = Date.now();
    const validKeys: K[] = [];
    for (const [key, item] of cache.entries()) {
      if (now <= item.expires) {
        validKeys.push(key);
      }
    }
    return validKeys;
  };

  const values = (): V[] => {
    const now = Date.now();
    const validValues: V[] = [];
    for (const [key, item] of cache.entries()) {
      if (now <= item.expires) {
        validValues.push(item.value);
      }
    }
    return validValues;
  };

  const entries = (): Array<[K, V]> => {
    const now = Date.now();
    const validEntries: Array<[K, V]> = [];
    for (const [key, item] of cache.entries()) {
      if (now <= item.expires) {
        validEntries.push([key, item.value]);
      }
    }
    return validEntries;
  };

  const forEach = (callbackfn: (value: V, key: K, cache: Cache<K, V>) => void): void => {
    const now = Date.now();
    cache.forEach((item, key) => {
      if (now <= item.expires) {
        callbackfn(item.value, key, { get, set, has, delete: deleteKey, clear, size, keys, values, entries, forEach } as Cache<K, V>);
      }
    });
  };

  return {
    get,
    set,
    has,
    delete: deleteKey,
    clear,
    size,
    keys,
    values,
    entries,
    forEach
  };
}

// =============================================================================
// 性能优化类型
// =============================================================================

// 防抖和节流类型
export interface DebounceOptions {
  delay: number;
  immediate?: boolean;
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottleOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  options: DebounceOptions
): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;
  let result: ReturnType<T>;

  const invokeFunc = (time: number): ReturnType<T> => {
    const args = lastArgs!;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const leadingEdge = (time: number): ReturnType<T> => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, options.delay);
    return options.leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number): number => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = options.delay - timeSinceLastCall;
    return options.maxWait !== undefined
      ? Math.min(timeWaiting, options.maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number): boolean => {
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (lastCallTime === undefined || 
            (timeSinceLastCall >= options.delay) || 
            (timeSinceLastCall < 0) || 
            (options.maxWait !== undefined && timeSinceLastInvoke >= options.maxWait));
  };

  const timerExpired = (): void => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number): ReturnType<T> => {
    timeoutId = undefined;
    
    if (options.trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  };

  const cancel = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = undefined;
  };

  const flush = (): ReturnType<T> => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  const pending = (): boolean => {
    return timeoutId !== undefined;
  };

  const debounced = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (options.maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, options.delay);
        return invokeFunc(lastCallTime);
      }
    }
    
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, options.delay);
    }
    
    return result;
  } as T;

  (debounced as any).cancel = cancel;
  (debounced as any).flush = flush;
  (debounced as any).pending = pending;

  return debounced;
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  options: ThrottleOptions
): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;
  let lastInvokeTime = 0;
  let result: ReturnType<T>;

  const invokeFunc = (time: number): ReturnType<T> => {
    const args = lastArgs!;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const leadingEdge = (time: number): void => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, options.delay);
  };

  const remainingWait = (time: number): number => {
    const timeSinceLastInvoke = time - lastInvokeTime;
    return options.delay - timeSinceLastInvoke;
  };

  const timerExpired = (): void => {
    const time = Date.now();
    if (remainingWait(time) <= 0) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number): void => {
    timeoutId = undefined;
    
    if (options.trailing && lastArgs) {
      invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
  };

  const throttled = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const time = Date.now();
    const isInvoking = time - lastInvokeTime >= options.delay;
    
    lastArgs = args;
    lastThis = this;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(time);
      }
      timeoutId = setTimeout(timerExpired, options.delay);
      return invokeFunc(time);
    }
    
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, options.delay);
    }
    
    return result;
  } as T;

  return throttled;
}

// 记忆化函数
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => any
): T {
  const cache = new Map<any, ReturnType<T>>();

  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;

  (memoized as any).cache = cache;
  return memoized;
}

// =============================================================================
// 数据验证和转换类型
// =============================================================================

// 验证器接口
export interface Validator<T = any> {
  validate(value: unknown): ValidationResult<T>;
  parse(value: unknown): T;
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: string };
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// 基础验证器
export class BaseValidator<T> implements Validator<T> {
  constructor(
    private schema: {
      parse: (value: unknown) => T;
      safeParse: (value: unknown) => { success: boolean; data?: T; error?: string };
    }
  ) {}

  validate(value: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, errors: [result.error || 'Validation failed'] };
  }

  parse(value: unknown): T {
    return this.schema.parse(value);
  }

  safeParse(value: unknown): { success: true; data: T } | { success: false; error: string } {
    return this.schema.safeParse(value);
  }
}

// 类型转换器
export interface Transformer<T, U> {
  transform(value: T): U;
  reverseTransform(value: U): T;
}

// 基础转换器
export class BaseTransformer<T, U> implements Transformer<T, U> {
  constructor(
    private forwardFn: (value: T) => U,
    private reverseFn: (value: U) => T
  ) {}

  transform(value: T): U {
    return this.forwardFn(value);
  }

  reverseTransform(value: U): T {
    return this.reverseFn(value);
  }
}

// =============================================================================
// 错误处理类型
// =============================================================================

// 错误类型
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: number;
  context?: Record<string, any>;
  recoverable?: boolean;
  retryable?: boolean;
}

// 错误创建器
export function createError(
  message: string,
  code: string,
  options?: {
    statusCode?: number;
    details?: Record<string, any>;
    context?: Record<string, any>;
    recoverable?: boolean;
    retryable?: boolean;
    cause?: Error;
  }
): AppError {
  const error = new Error(message) as AppError;
  error.name = 'AppError';
  error.code = code;
  error.statusCode = options?.statusCode;
  error.details = options?.details;
  error.timestamp = Date.now();
  error.context = options?.context;
  error.recoverable = options?.recoverable ?? true;
  error.retryable = options?.retryable ?? false;
  
  if (options?.cause) {
    error.cause = options.cause;
  }
  
  return error;
}

// 错误类型守卫
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && 'timestamp' in error;
}

// 错误处理工具
export interface ErrorHandler {
  handle(error: unknown): void | Promise<void>;
  canHandle(error: unknown): boolean;
}

// 错误处理器链
export class ErrorHandlerChain {
  private handlers: ErrorHandler[] = [];

  addHandler(handler: ErrorHandler): this {
    this.handlers.push(handler);
    return this;
  }

  async handle(error: unknown): Promise<void> {
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        await handler.handle(error);
        return;
      }
    }
    
    // 如果没有处理器能处理该错误，抛出它
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(String(error));
    }
  }
}

// =============================================================================
// 日志系统类型
// =============================================================================

// 日志级别
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 日志条目
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
  logger?: string;
  module?: string;
  function?: string;
  line?: number;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tags?: string[];
}

// 日志器接口
export interface Logger {
  trace(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  fatal(message: string, error?: Error, context?: Record<string, any>): void;
  child(context: Record<string, any>): Logger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

// 日志器实现
export class BaseLogger implements Logger {
  constructor(
    private name: string,
    private level: LogLevel = 'info',
    private handlers: LogHandler[] = [],
    private context: Record<string, any> = {}
  ) {}

  trace(message: string, context?: Record<string, any>): void {
    this.log('trace', message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('fatal', message, context, error);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: { ...this.context, ...context },
      error,
      logger: this.name,
      tags: this.extractTags(message)
    };

    // 添加调用栈信息
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split('\n');
      const callerLine = lines[4]; // 跳过内部调用栈
      const match = callerLine?.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)/);
      if (match) {
        entry.function = match[1];
        entry.module = match[2];
        entry.line = parseInt(match[3]);
      }
    }

    this.handlers.forEach(handler => {
      try {
        handler.handle(entry);
      } catch (err) {
        console.error('Log handler error:', err);
      }
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private extractTags(message: string): string[] {
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(message)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  child(context: Record<string, any>): Logger {
    return new BaseLogger(
      this.name,
      this.level,
      this.handlers,
      { ...this.context, ...context }
    );
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  addHandler(handler: LogHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: LogHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }
}

// 日志处理器接口
export interface LogHandler {
  handle(entry: LogEntry): void | Promise<void>;
}

// 控制台日志处理器
export class ConsoleLogHandler implements LogHandler {
  handle(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const message = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.logger}] ${entry.message}${contextStr}`;

    switch (entry.level) {
      case 'trace':
      case 'debug':
        console.debug(message, entry.error);
        break;
      case 'info':
        console.info(message, entry.error);
        break;
      case 'warn':
        console.warn(message, entry.error);
        break;
      case 'error':
      case 'fatal':
        console.error(message, entry.error);
        break;
    }
  }
}

// 文件日志处理器
export class FileLogHandler implements LogHandler {
  constructor(private filePath: string) {}

  async handle(entry: LogEntry): Promise<void> {
    // 在实际实现中，这里会将日志写入文件
    const logLine = `${JSON.stringify(entry)}\n`;
    // await fs.appendFile(this.filePath, logLine);
  }
}

// =============================================================================
// 配置管理类型
// =============================================================================

// 配置接口
export interface Config<T = Record<string, any>> {
  get<K extends keyof T>(key: K): T[K];
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  update<K extends keyof T>(key: K, updater: (current: T[K]) => T[K]): void;
  has<K extends keyof T>(key: K): boolean;
  delete<K extends keyof T>(key: K): boolean;
  clear(): void;
  keys(): (keyof T)[];
  values(): T[keyof T][];
  entries(): Array<[keyof T, T[keyof T]]>;
  watch<K extends keyof T>(key: K, callback: (value: T[K], previousValue: T[K]) => void): () => void;
  subscribe(callback: (config: T, previousConfig: T) => void): () => void;
}

// 配置管理器实现
export class ConfigManager<T extends Record<string, any>> implements Config<T> {
  private data: T;
  private watchers = new Map<keyof T, Set<(value: any, previousValue: any) => void>>();
  private subscribers = new Set<(config: T, previousConfig: T) => void>();

  constructor(initialData: T) {
    this.data = { ...initialData };
  }

  get<K extends keyof T>(key: K): T[K];
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K];
  get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K] | undefined {
    const value = this.data[key];
    return value !== undefined ? value : defaultValue;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const previousValue = this.data[key];
    this.data[key] = value;
    
    // 通知观察者
    const watchers = this.watchers.get(key);
    if (watchers) {
      watchers.forEach(callback => callback(value, previousValue));
    }
    
    // 通知订阅者
    this.notifySubscribers();
  }

  update<K extends keyof T>(key: K, updater: (current: T[K]) => T[K]): void {
    const currentValue = this.data[key];
    const newValue = updater(currentValue);
    this.set(key, newValue);
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this.data;
  }

  delete<K extends keyof T>(key: K): boolean {
    if (key in this.data) {
      const previousValue = this.data[key];
      delete this.data[key];
      
      // 通知观察者
      const watchers = this.watchers.get(key);
      if (watchers) {
        watchers.forEach(callback => callback(undefined, previousValue));
      }
      
      // 通知订阅者
      this.notifySubscribers();
      
      return true;
    }
    return false;
  }

  clear(): void {
    this.data = {} as T;
    this.watchers.clear();
    this.notifySubscribers();
  }

  keys(): (keyof T)[] {
    return Object.keys(this.data) as (keyof T)[];
  }

  values(): T[keyof T][] {
    return Object.values(this.data);
  }

  entries(): Array<[keyof T, T[keyof T]]> {
    return Object.entries(this.data) as Array<[keyof T, T[keyof T]]>;
  }

  watch<K extends keyof T>(key: K, callback: (value: T[K], previousValue: T[K]) => void): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    
    this.watchers.get(key)!.add(callback);
    
    return () => {
      const watchers = this.watchers.get(key);
      if (watchers) {
        watchers.delete(callback);
        if (watchers.size === 0) {
          this.watchers.delete(key);
        }
      }
    };
  }

  subscribe(callback: (config: T, previousConfig: T) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    // 使用微任务异步通知，避免在配置更新过程中触发回调
    Promise.resolve().then(() => {
      this.subscribers.forEach(callback => {
        try {
          callback({ ...this.data }, { ...this.data });
        } catch (error) {
          console.error('Config subscriber error:', error);
        }
      });
    });
  }

  // 获取配置的快照
  snapshot(): T {
    return { ...this.data };
  }

  // 合并配置
  merge(config: Partial<T>): void {
    const previousData = { ...this.data };
    this.data = { ...this.data, ...config };
    
    // 通知所有键的观察者
    Object.keys(config).forEach(key => {
      const k = key as keyof T;
      const watchers = this.watchers.get(k);
      if (watchers) {
        watchers.forEach(callback => {
          callback(this.data[k], previousData[k]);
        });
      }
    });
    
    this.notifySubscribers();
  }

  // 从对象加载配置
  load(config: Partial<T>): void {
    this.data = { ...this.data, ...config } as T;
    this.notifySubscribers();
  }

  // 导出配置为对象
  export(): T {
    return this.snapshot();
  }

  // 重置为初始状态
  reset(initialData: T): void {
    const previousData = { ...this.data };
    this.data = { ...initialData };
    
    // 通知所有键的观察者
    Object.keys(this.data).forEach(key => {
      const k = key as keyof T;
      const watchers = this.watchers.get(k);
      if (watchers) {
        watchers.forEach(callback => {
          callback(this.data[k], previousData[k]);
        });
      }
    });
    
    this.notifySubscribers();
  }
}

// =============================================================================
// 工具函数集合
// =============================================================================

// 深度克隆
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

// 深度比较
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }
  
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  
  if (a.prototype !== b.prototype) return false;
  
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }
  
  return keys.every(k => deepEqual((a as any)[k], (b as any)[k]));
}

// 随机字符串生成
export function randomString(length: number = 10, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// UUID 生成
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 重试函数
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    maxDelay?: number;
    condition?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    attempts = 3,
    delay: baseDelay = 1000,
    backoff = 'exponential',
    maxDelay = 30000,
    condition
  } = options;

  let lastError: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (condition && !condition(error)) {
        throw error;
      }
      
      if (i === attempts - 1) {
        break;
      }
      
      let currentDelay = baseDelay;
      if (backoff === 'exponential') {
        currentDelay = baseDelay * Math.pow(2, i);
      }
      currentDelay = Math.min(currentDelay, maxDelay);
      
      await delay(currentDelay);
    }
  }

  throw lastError;
}

// 并发控制
export class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<{
    task: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor(private limit: number) {}

  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.limit || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift()!;

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// 批处理器
export class BatchProcessor<T> {
  private batch: T[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private processor: (items: T[]) => Promise<void>,
    private options: {
      batchSize: number;
      flushInterval: number;
      maxWaitTime?: number;
    }
  ) {}

  add(item: T): void {
    this.batch.push(item);

    if (this.batch.length >= this.options.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.options.flushInterval);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.batch.length > 0) {
      const items = [...this.batch];
      this.batch = [];
      await this.processor(items);
    }
  }

  async destroy(): Promise<void> {
    await this.flush();
  }
}