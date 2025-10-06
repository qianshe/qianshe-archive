// Portfolio展示端Hook相关类型定义

// useQuery Hook配置类型
export interface UseQueryConfig<T = unknown, E = Error> {
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
  select?: (data: T) => unknown;
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  onSettled?: (data: T | undefined, error: E | null) => void;
}

// useMutation Hook配置类型
export interface UseMutationConfig<T = unknown, V = unknown, E = Error> {
  mutationFn: (variables: V) => Promise<T>;
  onMutate?: (variables: V) => Promise<unknown> | unknown;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: E, variables: V) => void;
  onSettled?: (data: T | undefined, error: E | null, variables: V) => void;
  retry?: boolean | number;
  retryDelay?: number | ((attemptIndex: number) => number);
}

// useInfiniteQuery Hook配置类型
export interface UseInfiniteQueryConfig<T = unknown> {
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
  select?: (data: { pages: T[]; pageParams: unknown[] }) => unknown;
}

// Hook返回值类型
export interface QueryResult<T = unknown, E = Error> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: E | null;
  refetch: () => void;
}

export interface MutationResult<T = unknown, E = Error> {
  data: T | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: E | null;
  mutate: (variables: unknown) => void;
  mutateAsync: (variables: unknown) => Promise<T>;
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

// 常用Hook Props类型
export interface UseLocalStorageProps<T> {
  key: string;
  defaultValue: T;
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
}

export interface UseDebounceProps {
  value: unknown;
  delay: number;
}

export interface UseThrottleProps {
  value: unknown;
  delay: number;
}

export interface UseToggleProps {
  initialValue?: boolean;
}

export interface UseCounterProps {
  initialValue?: number;
  max?: number;
  min?: number;
  step?: number;
}

export interface UseArrayProps<T> {
  initialArray?: T[];
}

export interface UseObjectProps<T extends Record<string, unknown>> {
  initialObject?: T;
}

// 自定义Hook返回值类型
export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

export interface UseDebounceResult<T> {
  debouncedValue: T;
}

export interface UseThrottleResult<T> {
  throttledValue: T;
}

export interface UseToggleResult {
  state: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setState: (state: boolean) => void;
}

export interface UseCounterResult {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export interface UseArrayResult<T> {
  array: T[];
  set: (value: T[]) => void;
  push: (item: T) => void;
  remove: (index: number) => void;
  filter: (predicate: (item: T, index: number) => boolean) => void;
  update: (index: number, item: T) => void;
  clear: () => void;
}

export interface UseObjectResult<T extends Record<string, unknown>> {
  object: T;
  set: (object: T) => void;
  setKey: <K extends keyof T>(key: K, value: T[K]) => void;
  removeKey: <K extends keyof T>(key: K) => void;
  clear: () => void;
}