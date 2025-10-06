// 全局类型定义文件
// 解决Cloudflare Workers和Web API的类型定义问题

declare global {
  // Cloudflare Workers 类型
  interface D1Database {
    prepare(sql: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    dump(): Promise<ArrayBuffer>;
  }

  interface D1PreparedStatement {
    bind(...params: any[]): D1PreparedStatement;
    first(): Promise<any>;
    first(colName: string): Promise<any>;
    all(): Promise<D1Result>;
    run(): Promise<D1Result>;
  }

  interface D1Result {
    results: any[];
    success: boolean;
    meta: {
      duration: number;
      last_row_id: number;
      changes: number;
      served_by: string;
      internal_stats: any;
    };
  }

  interface KVNamespace {
    get(key: string): Promise<string | null>;
    get(key: string, type: 'text'): Promise<string | null>;
    get(key: string, type: 'json'): Promise<any | null>;
    get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
    get(key: string, type: 'stream'): Promise<ReadableStream | null>;

    put(key: string, value: string): Promise<void>;
    put(key: string, value: ArrayBuffer): Promise<void>;
    put(key: string, value: ReadableStream): Promise<void>;

    delete(key: string): Promise<void>;

    list(): Promise<{
      keys: Array<{
        name: string;
        expiration?: number;
        metadata?: any;
      }>;
      list_complete: boolean;
      cursor: string;
    }>;
  }

  interface R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(key: string): Promise<R2ObjectBody | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: R2PutOptions): Promise<R2Object>;
    delete(key: string): Promise<void>;
    list(): Promise<R2Objects>;
  }

  interface R2Object {
    key: string;
    size: number;
    etag: string;
    lastModified: Date;
    httpEtag: string;
    customMetadata: Record<string, string>;
    range?: { offset: number; length?: number };
  }

  interface R2ObjectBody extends R2Object {
    body: ReadableStream;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T>(): Promise<T>;
  }

  interface R2PutOptions {
    customMetadata?: Record<string, string>;
    httpMetadata?: Headers | Record<string, string>;
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
  }

  interface R2Objects {
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
  }

  // Web API 类型
  var fetch: (input: string | Request, init?: RequestInit) => Promise<Response>;
  var Response: {
    new(body?: BodyInit | null, init?: ResponseInit): Response;
    redirect(url: string, status?: number): Response;
    json(data: any, init?: ResponseInit): Response;
    error(): Response;
  };
  var Request: {
    new(input: string | Request, init?: RequestInit): Request;
  };
  var Headers: {
    new(init?: HeadersInit): Headers;
  };
  var FormData: {
    new(form?: HTMLFormElement): FormData;
  };
  var File: {
    new(bits: BlobPart[], name: string, options?: FilePropertyBag): File;
  };
  var URLSearchParams: {
    new(init?: string[][] | Record<string, string> | string | URLSearchParams): URLSearchParams;
  };

  // 定时器
  var setTimeout: (handler: () => void, timeout?: number) => number;
  var clearTimeout: (id: number) => void;
  var setInterval: (handler: () => void, timeout?: number) => number;
  var clearInterval: (id: number) => void;

  // 其他全局变量
  var console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
  };

  var performance: {
    now(): number;
    mark(name?: string): void;
    measure(name: string, startMark?: string, endMark?: string): void;
  };

  // Cloudflare Workers 环境变量
  var env: {
    D1_DATABASE: D1Database;
    KV_NAMESPACE: KVNamespace;
    R2_BUCKET: R2Bucket;
    [key: string]: any;
  };

  interface ScheduledEvent {
    scheduledTime: number;
    cron: string;
    waitUntil(promise: Promise<any>): void;
  }
}

export {};