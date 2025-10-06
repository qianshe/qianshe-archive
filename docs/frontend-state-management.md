# 前端状态管理方案

## 概述

谦舍博客系统采用React + TypeScript开发，使用现代化的状态管理方案来处理前端数据的获取、缓存和同步。

## 技术选型

### 核心技术栈

- **React Query** (TanStack Query): 服务器状态管理
- **Zustand**: 客户端状态管理
- **React Context**: 全局状态共享
- **localStorage**: 持久化存储

### 选择理由

- **React Query**: 优秀的缓存机制，自动请求重试，乐观更新
- **Zustand**: 轻量级，易用性强，TypeScript支持好
- **React Context**: 内置解决方案，适合共享全局状态

## 状态分层架构

### 1. 服务器状态 (Server State)

使用React Query管理所有API请求和数据缓存

#### Portfolio展示端状态

```typescript
// api/posts.ts
export const postsApi = {
  // 获取文章列表
  getPosts: (params: BlogPostQuery) =>
    useQuery<BlogPostListResponse>({
      queryKey: ['posts', params],
      queryFn: () => api.get('/posts', { params }),
      staleTime: 5 * 60 * 1000, // 5分钟
      keepPreviousData: true
    }),

  // 获取文章详情
  getPost: (slug: string) =>
    useQuery<BlogPost>({
      queryKey: ['posts', slug],
      queryFn: () => api.get(`/posts/${slug}`),
      staleTime: 10 * 60 * 1000, // 10分钟
      enabled: !!slug
    }),

  // 获取相关文章
  getRelatedPosts: (slug: string) =>
    useQuery<RelatedPost[]>({
      queryKey: ['posts', slug, 'related'],
      queryFn: () => api.get(`/posts/${slug}/related`),
      enabled: !!slug
    })
};

// api/projects.ts
export const projectsApi = {
  getProjects: (params: ProjectQuery) =>
    useQuery<ProjectListResponse>({
      queryKey: ['projects', params],
      queryFn: () => api.get('/projects', { params }),
      staleTime: 5 * 60 * 1000
    }),

  getProject: (slug: string) =>
    useQuery<Project>({
      queryKey: ['projects', slug],
      queryFn: () => api.get(`/projects/${slug}`),
      enabled: !!slug
    })
};

// api/comments.ts
export const commentsApi = {
  getComments: (params: CommentQuery) =>
    useQuery<CommentListResponse>({
      queryKey: ['comments', params],
      queryFn: () => api.get('/comments', { params }),
      staleTime: 2 * 60 * 1000 // 2分钟
    }),

  submitComment: () =>
    useMutation<Comment, Error, CommentRequest>({
      mutationFn: data => api.post('/comments', data),
      onSuccess: () => {
        // 乐观更新，刷新评论列表
        queryClient.invalidateQueries(['comments']);
      }
    })
};
```

#### Dashboard管理端状态

```typescript
// api/auth.ts
export const authApi = {
  login: () =>
    useMutation<LoginResponse, Error, LoginRequest>({
      mutationFn: data => api.post('/auth/login', data),
      onSuccess: data => {
        // 存储token
        localStorage.setItem('token', data.token);
        // 设置默认headers
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
    }),

  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// api/admin/posts.ts
export const adminPostsApi = {
  getPosts: (params: BlogPostQuery) =>
    useQuery<BlogPostListResponse>({
      queryKey: ['admin', 'posts', params],
      queryFn: () => api.get('/posts', { params }),
      staleTime: 1 * 60 * 1000 // 1分钟
    }),

  createPost: () =>
    useMutation<BlogPost, Error, BlogPostRequest>({
      mutationFn: data => api.post('/posts', data),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'posts']);
      }
    }),

  updatePost: () =>
    useMutation<BlogPost, Error, { id: number; data: BlogPostRequest }>({
      mutationFn: ({ id, data }) => api.put(`/posts/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'posts']);
      }
    }),

  deletePost: () =>
    useMutation<void, Error, number>({
      mutationFn: id => api.delete(`/posts/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'posts']);
      }
    })
};
```

### 2. 客户端状态 (Client State)

使用Zustand管理UI状态和临时数据

#### Portfolio展示端状态

```typescript
// stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  searchOpen: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUIStore = create<UIState>(set => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  sidebarOpen: false,
  searchOpen: false,
  loading: false,
  error: null,

  setTheme: theme => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchOpen: searchOpen => set({ searchOpen }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error })
}));

// stores/searchStore.ts
interface SearchState {
  query: string;
  results: SearchResult[];
  searching: boolean;

  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>(set => ({
  query: '',
  results: [],
  searching: false,

  setQuery: query => set({ query }),
  setResults: results => set({ results }),
  setSearching: searching => set({ searching }),
  clearSearch: () => set({ query: '', results: [], searching: false })
}));
```

#### Dashboard管理端状态

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: user => set({ user }),
  setToken: token => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

// stores/editorStore.ts
interface EditorState {
  content: string;
  title: string;
  tags: string[];
  saving: boolean;
  lastSaved: Date | null;

  // Actions
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  setTags: (tags: string[]) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>(set => ({
  content: '',
  title: '',
  tags: [],
  saving: false,
  lastSaved: null,

  setContent: content => set({ content }),
  setTitle: title => set({ title }),
  setTags: tags => set({ tags }),
  setSaving: saving => set({ saving }),
  setLastSaved: lastSaved => set({ lastSaved }),
  reset: () => set({ content: '', title: '', tags: [], saving: false, lastSaved: null })
}));
```

### 3. 全局状态 (Global State)

使用React Context管理全局共享状态

```typescript
// contexts/AppContext.tsx
interface AppContextType {
  settings: SystemSetting[];
  links: Link[];
  systemInfo: SystemInfo;

  // Actions
  refreshSettings: () => Promise<void>;
  refreshLinks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const refreshSettings = useCallback(async () => {
    const response = await api.get('/settings/public');
    setSettings(response.data);
  }, []);

  const refreshLinks = useCallback(async () => {
    const response = await api.get('/links');
    setLinks(response.data);
  }, []);

  useEffect(() => {
    refreshSettings();
    refreshLinks();

    // 获取系统信息
    api.get('/system/info').then(response => {
      setSystemInfo(response.data);
    });
  }, []);

  return (
    <AppContext.Provider value={{
      settings,
      links,
      systemInfo,
      refreshSettings,
      refreshLinks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
```

## 状态同步策略

### 1. 数据获取和缓存

```typescript
// hooks/usePosts.ts
export const usePosts = (params: BlogPostQuery) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage } = postsApi.getPosts(params);

  return {
    posts: data?.posts || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    refetch: postsApi.getPosts(params).refetch
  };
};

// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useSearch.ts
export const useSearch = (query: string) => {
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.get('/search', { params: { q: debouncedQuery } }),
    enabled: debouncedQuery.length > 2
  });

  return {
    results: data?.results || [],
    isLoading,
    total: data?.total || 0
  };
};
```

### 2. 表单状态管理

```typescript
// hooks/useForm.ts
export const useForm = <T>(initialValues: T, onSubmit: (values: T) => Promise<void>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
      setErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  };
};
```

### 3. 乐观更新

```typescript
// hooks/useOptimisticUpdate.ts
export const useOptimisticUpdate = <T, R>(
  mutationFn: (data: T) => Promise<R>,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn,
    onMutate: async newData => {
      // 取消正在进行的查询
      await queryClient.cancelQueries(queryKey);

      // 获取当前数据快照
      const previousData = queryClient.getQueryData(queryKey);

      // 乐观更新
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        data: [...old.data, newData]
      }));

      return { previousData };
    },
    onError: (err, newData, context) => {
      // 发生错误时回滚
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: () => {
      // 无论成功失败都重新获取数据
      queryClient.invalidateQueries(queryKey);
    }
  });
};
```

## 持久化存储

### 1. 本地存储策略

```typescript
// utils/storage.ts
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

// hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.get(key, initialValue);
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  };

  return [storedValue, setValue] as const;
};
```

### 2. 应用状态持久化

```typescript
// hooks/usePersistentState.ts
export const usePersistentState = <T>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(`app_${key}`);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(`app_${key}`, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};

// 使用示例
const [theme, setTheme] = usePersistentState<'light' | 'dark'>('theme', 'dark');
const [sidebarOpen, setSidebarOpen] = usePersistentState('sidebarOpen', false);
```

## 性能优化

### 1. 查询优化

```typescript
// 优化：使用select减少数据传输
const usePostTitles = () => {
  return useQuery({
    queryKey: ['posts', 'titles'],
    queryFn: () =>
      api.get('/posts', {
        params: { select: 'id,title,slug,published_at' }
      }),
    staleTime: 30 * 60 * 1000 // 30分钟
  });
};

// 优化：预获取相关数据
const usePostWithRelated = (slug: string) => {
  const postQuery = useQuery({
    queryKey: ['posts', slug],
    queryFn: () => api.get(`/posts/${slug}`),
    enabled: !!slug
  });

  const relatedQuery = useQuery({
    queryKey: ['posts', slug, 'related'],
    queryFn: () => api.get(`/posts/${slug}/related`),
    enabled: !!postQuery.data
  });

  return {
    post: postQuery.data,
    relatedPosts: relatedQuery.data,
    isLoading: postQuery.isLoading || relatedQuery.isLoading,
    error: postQuery.error || relatedQuery.error
  };
};
```

### 2. 内存优化

```typescript
// 使用useMemo缓存计算结果
const useFilteredPosts = (posts: BlogPost[], filters: PostFilters) => {
  return useMemo(() => {
    return posts.filter(post => {
      if (filters.category && post.category !== filters.category) return false;
      if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()))
        return false;
      if (filters.featured && !post.is_featured) return false;
      return true;
    });
  }, [posts, filters]);
};

// 使用useCallback缓存函数
const usePostActions = () => {
  const queryClient = useQueryClient();

  const refreshPosts = useCallback(() => {
    queryClient.invalidateQueries(['posts']);
  }, [queryClient]);

  const refreshPost = useCallback(
    (slug: string) => {
      queryClient.invalidateQueries(['posts', slug]);
    },
    [queryClient]
  );

  return { refreshPosts, refreshPost };
};
```

这个状态管理方案确保了：

- 数据的一致性和同步
- 优秀的用户体验（离线支持、乐观更新）
- 良好的性能（缓存、去重、优化）
- 易于维护和扩展
- TypeScript类型安全
