/**
 * 类型安全的API客户端生成工具
 * 基于OpenAPI/Swagger规范自动生成类型安全的API客户端
 */

// =============================================================================
// API客户端基础类型
// =============================================================================

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// API端点配置
export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponseDefinitions;
  security?: ApiSecurityRequirement[];
  deprecated?: boolean;
}

// API参数
export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  schema: ApiSchema;
  description?: string;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  example?: any;
  examples?: Record<string, ApiExample>;
}

// API请求体
export interface ApiRequestBody {
  description?: string;
  content: Record<string, ApiMediaType>;
  required?: boolean;
}

// API媒体类型
export interface ApiMediaType {
  schema: ApiSchema;
  example?: any;
  examples?: Record<string, ApiExample>;
  encoding?: Record<string, ApiEncoding>;
}

// API编码
export interface ApiEncoding {
  contentType?: string;
  headers?: Record<string, ApiHeader>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

// API响应定义
export interface ApiResponseDefinitions {
  [statusCode: string]: ApiResponse;
}

export interface ApiResponse {
  description: string;
  content?: Record<string, ApiMediaType>;
  headers?: Record<string, ApiHeader>;
  links?: Record<string, ApiLink>;
}

// API头
export interface ApiHeader {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema: ApiSchema;
  example?: any;
  examples?: Record<string, ApiExample>;
}

// API链接
export interface ApiLink {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, any>;
  requestBody?: any;
  description?: string;
  server?: ApiServer;
  deprecated?: boolean;
}

// API服务器
export interface ApiServer {
  url: string;
  description?: string;
  variables?: Record<string, ApiServerVariable>;
}

export interface ApiServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

// API示例
export interface ApiExample {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

// API安全需求
export interface ApiSecurityRequirement {
  [name: string]: string[];
}

// API模式
export interface ApiSchema {
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  allOf?: ApiSchema[];
  oneOf?: ApiSchema[];
  anyOf?: ApiSchema[];
  not?: ApiSchema;
  items?: ApiSchema;
  properties?: Record<string, ApiSchema>;
  additionalProperties?: boolean | ApiSchema;
  description?: string;
  format?: string;
  nullable?: boolean;
  discriminator?: ApiDiscriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: ApiXml;
  externalDocs?: ApiExternalDocs;
  example?: any;
  deprecated?: boolean;
}

// API判别器
export interface ApiDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

// API XML
export interface ApiXml {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

// API外部文档
export interface ApiExternalDocs {
  description?: string;
  url: string;
}

// =============================================================================
// API文档规范类型
// =============================================================================

// OpenAPI文档
export interface OpenAPIDocument {
  openapi: string;
  info: ApiInfo;
  servers?: ApiServer[];
  paths: Record<string, ApiPathItem>;
  components?: ApiComponents;
  security?: ApiSecurityRequirement[];
  tags?: ApiTag[];
  externalDocs?: ApiExternalDocs;
}

export interface ApiInfo {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ApiContact;
  license?: ApiLicense;
  version: string;
}

export interface ApiContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface ApiLicense {
  name: string;
  url?: string;
}

export interface ApiPathItem {
  summary?: string;
  description?: string;
  get?: ApiEndpoint;
  put?: ApiEndpoint;
  post?: ApiEndpoint;
  delete?: ApiEndpoint;
  options?: ApiEndpoint;
  head?: ApiEndpoint;
  patch?: ApiEndpoint;
  trace?: ApiEndpoint;
  parameters?: ApiParameter[];
}

export interface ApiComponents {
  schemas?: Record<string, ApiSchema>;
  responses?: Record<string, ApiResponse>;
  parameters?: Record<string, ApiParameter>;
  examples?: Record<string, ApiExample>;
  requestBodies?: Record<string, ApiRequestBody>;
  headers?: Record<string, ApiHeader>;
  securitySchemes?: Record<string, ApiSecurityScheme>;
  links?: Record<string, ApiLink>;
  callbacks?: Record<string, ApiCallback>;
}

export interface ApiTag {
  name: string;
  description?: string;
  externalDocs?: ApiExternalDocs;
}

export interface ApiSecurityScheme {
  type: string;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: ApiOAuthFlows;
  openIdConnectUrl?: string;
}

export interface ApiOAuthFlows {
  implicit?: ApiOAuthFlow;
  password?: ApiOAuthFlow;
  clientCredentials?: ApiOAuthFlow;
  authorizationCode?: ApiOAuthFlow;
}

export interface ApiOAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface ApiCallback {
  [url: string]: ApiPathItem;
}

// =============================================================================
// API客户端生成器
// =============================================================================

// API客户端配置
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: ApiAuthConfig;
  interceptors?: ApiInterceptor[];
  retryConfig?: ApiRetryConfig;
  cacheConfig?: ApiCacheConfig;
  validateStatus?: (status: number) => boolean;
  transformRequest?: (data: any) => any;
  transformResponse?: (data: any) => any;
}

export interface ApiAuthConfig {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'custom';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  custom?: (config: ApiClientConfig) => Record<string, string>;
}

export interface ApiInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onRequestError?: (error: any) => any;
  onResponse?: (response: ApiResponse<any>) => ApiResponse<any> | Promise<ApiResponse<any>>;
  onResponseError?: (error: any) => any;
}

export interface ApiRetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
  retryDelayMultiplier?: number;
  maxRetryDelay?: number;
}

export interface ApiCacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  keyGenerator?: (config: ApiRequestConfig) => string;
  shouldCache?: (config: ApiRequestConfig) => boolean;
}

export interface ApiRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  validateStatus?: (status: number) => boolean;
}

// =============================================================================
// 生成的API客户端类型
// =============================================================================

// 基础API客户端
export abstract class BaseApiClient {
  protected config: ApiClientConfig;
  protected interceptors: ApiInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.config = { ...config };
    this.interceptors = config.interceptors || [];
  }

  // 抽象方法，由生成的客户端实现
  abstract request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;

  // HTTP方法封装
  get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // 添加拦截器
  addInterceptor(interceptor: ApiInterceptor): void {
    this.interceptors.push(interceptor);
  }

  // 移除拦截器
  removeInterceptor(interceptor: ApiInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  // 更新配置
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// API客户端工厂
export class ApiClientFactory {
  private static instances: Map<string, BaseApiClient> = new Map();

  // 创建API客户端实例
  static create<T extends BaseApiClient>(
    name: string,
    ClientClass: new (config: ApiClientConfig) => T,
    config: ApiClientConfig
  ): T {
    if (this.instances.has(name)) {
      return this.instances.get(name) as T;
    }

    const client = new ClientClass(config);
    this.instances.set(name, client);
    return client;
  }

  // 获取API客户端实例
  static get<T extends BaseApiClient>(name: string): T | null {
    return this.instances.get(name) as T || null;
  }

  // 销毁API客户端实例
  static destroy(name: string): boolean {
    return this.instances.delete(name);
  }

  // 清空所有实例
  static clear(): void {
    this.instances.clear();
  }
}

// =============================================================================
// API客户端代码生成器
// =============================================================================

// 生成器配置
export interface CodeGeneratorConfig {
  inputSpec: string | OpenAPIDocument;
  outputDir: string;
  clientName?: string;
  language: 'typescript' | 'javascript';
  useUnionTypes?: boolean;
  exportSchemas?: boolean;
  generateClientClasses?: boolean;
  generateServiceClasses?: boolean;
  customTemplates?: Record<string, string>;
  additionalProperties?: Record<string, any>;
}

// 生成器选项
export interface GeneratorOptions {
  withInterfaces?: boolean;
  withEnums?: boolean;
  withUnionEnums?: boolean;
  enumSuffix?: string;
  dateType?: 'Date' | 'string';
  arrayType?: 'Array' | 'List';
  prefix?: string;
  suffix?: string;
  typePrefix?: string;
  typeSuffix?: string;
  excludeDeprecated?: boolean;
  includeDeprecated?: boolean;
  sortTypes?: boolean;
  sortRoutes?: boolean;
}

// API客户端生成器
export class ApiClientGenerator {
  private config: CodeGeneratorConfig;
  private spec: OpenAPIDocument;

  constructor(config: CodeGeneratorConfig) {
    this.config = config;
    this.spec = typeof config.inputSpec === 'string'
      ? JSON.parse(config.inputSpec)
      : config.inputSpec;
  }

  // 生成完整的API客户端
  async generate(): Promise<GeneratedCode> {
    const generatedFiles: GeneratedFile[] = [];

    // 生成类型定义
    if (this.config.exportSchemas !== false) {
      const typesCode = this.generateTypes();
      generatedFiles.push({
        path: 'types.ts',
        content: typesCode
      });
    }

    // 生成基础客户端
    const baseClientCode = this.generateBaseClient();
    generatedFiles.push({
      path: 'base-client.ts',
      content: baseClientCode
    });

    // 生成服务类
    if (this.config.generateServiceClasses !== false) {
      const servicesCode = this.generateServices();
      generatedFiles.push({
        path: 'services.ts',
        content: servicesCode
      });
    }

    // 生成主客户端类
    if (this.config.generateClientClasses !== false) {
      const clientCode = this.generateMainClient();
      generatedFiles.push({
        path: 'client.ts',
        content: clientCode
      });
    }

    // 生成索引文件
    const indexCode = this.generateIndex();
    generatedFiles.push({
      path: 'index.ts',
      content: indexCode
    });

    return {
      files: generatedFiles,
      spec: this.spec
    };
  }

  // 生成类型定义
  private generateTypes(): string {
    const types: string[] = [];
    const schemas = this.spec.components?.schemas || {};

    // 生成基础类型
    types.push(`
// Generated API types from OpenAPI specification
// Generated at: ${new Date().toISOString()}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
`);

    // 生成模式类型
    Object.entries(schemas).forEach(([name, schema]) => {
      const typeCode = this.generateSchemaType(name, schema);
      types.push(typeCode);
    });

    return types.join('\n\n');
  }

  // 生成模式类型
  private generateSchemaType(name: string, schema: ApiSchema): string {
    if (schema.allOf) {
      return this.generateAllOfType(name, schema);
    } else if (schema.oneOf) {
      return this.generateOneOfType(name, schema);
    } else if (schema.anyOf) {
      return this.generateAnyOfType(name, schema);
    } else if (schema.type === 'object' && schema.properties) {
      return this.generateObjectType(name, schema);
    } else if (schema.type === 'array' && schema.items) {
      return this.generateArrayType(name, schema);
    } else {
      return this.generatePrimitiveType(name, schema);
    }
  }

  // 生成对象类型
  private generateObjectType(name: string, schema: ApiSchema): string {
    const properties = schema.properties || {};
    const required = schema.required || [];
    const lines: string[] = [];

    lines.push(`export interface ${name} {`);

    Object.entries(properties).forEach(([propName, propSchema]) => {
      const isRequired = required.includes(propName);
      const typeStr = this.convertSchemaToType(propSchema);
      const optional = isRequired ? '' : '?';

      lines.push(`  ${propName}${optional}: ${typeStr};`);
    });

    lines.push('}');

    return lines.join('\n');
  }

  // 生成数组类型
  private generateArrayType(name: string, schema: ApiSchema): string {
    const itemType = this.convertSchemaToType(schema.items!);
    return `export type ${name} = ${itemType}[];`;
  }

  // 生成基础类型
  private generatePrimitiveType(name: string, schema: ApiSchema): string {
    const type = this.convertSchemaToType(schema);
    return `export type ${name} = ${type};`;
  }

  // 生成AllOf类型
  private generateAllOfType(name: string, schema: ApiSchema): string {
    const types = schema.allOf!.map(s => this.convertSchemaToType(s));
    return `export type ${name} = ${types.join(' & ')};`;
  }

  // 生成OneOf类型
  private generateOneOfType(name: string, schema: ApiSchema): string {
    const types = schema.oneOf!.map(s => this.convertSchemaToType(s));
    return `export type ${name} = ${types.join(' | ')};`;
  }

  // 生成AnyOf类型
  private generateAnyOfType(name: string, schema: ApiSchema): string {
    const types = schema.anyOf!.map(s => this.convertSchemaToType(s));
    return `export type ${name} = ${types.join(' | ')};`;
  }

  // 将API模式转换为TypeScript类型
  private convertSchemaToType(schema: ApiSchema): string {
    if (schema.allOf) {
      const types = schema.allOf.map(s => this.convertSchemaToType(s));
      return `(${types.join(' & ')})`;
    }

    if (schema.oneOf) {
      const types = schema.oneOf.map(s => this.convertSchemaToType(s));
      return `(${types.join(' | ')})`;
    }

    if (schema.anyOf) {
      const types = schema.anyOf.map(s => this.convertSchemaToType(s));
      return `(${types.join(' | ')})`;
    }

    if (schema.type === 'object') {
      if (!schema.properties || Object.keys(schema.properties).length === 0) {
        return 'Record<string, any>';
      }

      const properties = schema.properties;
      const required = schema.required || [];
      const props: string[] = [];

      Object.entries(properties).forEach(([propName, propSchema]) => {
        const isRequired = required.includes(propName);
        const typeStr = this.convertSchemaToType(propSchema);
        const optional = isRequired ? '' : '?';
        props.push(`${propName}${optional}: ${typeStr}`);
      });

      return `{ ${props.join('; ')} }`;
    }

    if (schema.type === 'array') {
      const itemType = schema.items ? this.convertSchemaToType(schema.items) : 'any';
      return `${itemType}[]`;
    }

    if (schema.enum) {
      return schema.enum.map(v => typeof v === 'string' ? `'${v}'` : String(v)).join(' | ');
    }

    switch (schema.type) {
      case 'string':
        switch (schema.format) {
          case 'date':
          case 'date-time':
            return 'string'; // 或 Date，取决于配置
          case 'email':
            return 'string';
          case 'uri':
          case 'url':
            return 'string';
          case 'uuid':
            return 'string';
          default:
            return 'string';
        }
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  }

  // 生成基础客户端
  private generateBaseClient(): string {
    return `
// Generated API base client
import { BaseApiClient, ApiClientConfig, ApiRequestConfig, ApiResponse } from './api-client';

export abstract class GeneratedBaseApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  protected buildUrl(path: string, params?: Record<string, any>): string {
    let url = this.config.baseURL + path;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += '?' + queryString;
      }
    }

    return url;
  }

  protected buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...customHeaders
    };

    // 添加认证头
    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'bearer':
          headers['Authorization'] = \`Bearer \${this.config.auth.token}\`;
          break;
        case 'apikey':
          const headerName = this.config.auth.apiKeyHeader || 'X-API-Key';
          headers[headerName] = this.config.auth.apiKey!;
          break;
        case 'basic':
          const credentials = btoa(\`\${this.config.auth.username}:\${this.config.auth.password}\`);
          headers['Authorization'] = \`Basic \${credentials}\`;
          break;
        case 'custom':
          Object.assign(headers, this.config.auth.custom(this.config));
          break;
      }
    }

    return headers;
  }
}`;
  }

  // 生成服务类
  private generateServices(): string {
    const services: string[] = [];
    const tagGroups: Record<string, ApiEndpoint[]> = {};

    // 按标签分组端点
    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, endpoint]) => {
        if (typeof endpoint === 'object' && endpoint.tags) {
          endpoint.tags.forEach(tag => {
            if (!tagGroups[tag]) {
              tagGroups[tag] = [];
            }
            tagGroups[tag].push({
              ...endpoint,
              path,
              method: method as HttpMethod
            });
          });
        }
      });
    });

    // 为每个标签生成服务类
    Object.entries(tagGroups).forEach(([tag, endpoints]) => {
      const className = `${this.toPascalCase(tag)}Service`;
      const methods = endpoints.map(endpoint => this.generateServiceMethod(endpoint)).join('\n\n');

      services.push(`
export class ${className} extends GeneratedBaseApiClient {
${methods}
}`);
    });

    return services.join('\n\n');
  }

  // 生成服务方法
  private generateServiceMethod(endpoint: ApiEndpoint): string {
    const methodName = this.toCamelCase(endpoint.operationId || this.extractOperationName(endpoint));
    const returnType = this.extractResponseType(endpoint);
    const parameters = this.extractParameters(endpoint);
    const pathParams = this.extractPathParameters(endpoint);
    const queryParams = this.extractQueryParameters(endpoint);
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method);
    const bodyParam = this.extractBodyParameter(endpoint);

    const methodLines: string[] = [];

    // 方法签名
    methodLines.push(`  async ${methodName}(${parameters.join(', ')}): Promise<ApiResponse<${returnType}>> {`);

    // 构建URL
    methodLines.push(`    const url = this.buildUrl(\`${this.replacePathParams(endpoint.path, pathParams)}\`, {`);
    if (queryParams.length > 0) {
      methodLines.push(`      ...queryParams,`);
    }
    methodLines.push(`    });`);

    // 构建请求配置
    methodLines.push(`    const config: ApiRequestConfig = {`);
    methodLines.push(`      url,`);
    methodLines.push(`      method: '${endpoint.method}',`);
    methodLines.push(`      headers: this.buildHeaders(),`);
    if (hasBody && bodyParam) {
      methodLines.push(`      data: ${bodyParam},`);
    }
    methodLines.push(`    };`);

    // 发送请求
    methodLines.push(`    return this.request<${returnType}>(config);`);
    methodLines.push(`  }`);

    return methodLines.join('\n');
  }

  // 生成主客户端
  private generateMainClient(): string {
    const services: string[] = [];
    const tagGroups: Record<string, ApiEndpoint[]> = {};

    // 收集所有标签
    Object.values(this.spec.paths).forEach(pathItem => {
      Object.values(pathItem).forEach(endpoint => {
        if (typeof endpoint === 'object' && endpoint.tags) {
          endpoint.tags.forEach(tag => {
            if (!tagGroups[tag]) tagGroups[tag] = [];
          });
        }
      });
    });

    // 生成服务属性
    Object.keys(tagGroups).forEach(tag => {
      const serviceName = this.toCamelCase(tag);
      const className = `${this.toPascalCase(tag)}Service`;
      services.push(`  public readonly ${serviceName}: ${className};`);
    });

    return `
// Generated main API client
export class ${this.config.clientName || 'ApiClient'} extends GeneratedBaseApiClient {
${services.join('\n')}

  constructor(config: ApiClientConfig) {
    super(config);
${Object.keys(tagGroups).map(tag => {
    const serviceName = this.toCamelCase(tag);
    const className = `${this.toPascalCase(tag)}Service`;
    return `    this.${serviceName} = new ${className}(config);`;
  }).join('\n')}
  }
}`;
  }

  // 生成索引文件
  private generateIndex(): string {
    return `
// Generated API client index file

// Types
export * from './types';

// Base client
export { GeneratedBaseApiClient } from './base-client';

// Services
${Object.keys(this.getTags()).map(tag =>
    `export { ${this.toPascalCase(tag)}Service } from './services';`
  ).join('\n')}

// Main client
export { ${this.config.clientName || 'ApiClient'} } from './client';

// Factory
export { ApiClientFactory } from './api-client';
`;
  }

  // 辅助方法
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[\s-_])+(.)/g, (_, char) => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private extractOperationName(endpoint: ApiEndpoint): string {
    return this.toCamelCase(endpoint.summary || endpoint.operationId || '');
  }

  private extractResponseType(endpoint: ApiEndpoint): string {
    const successResponse = endpoint.responses['200'] || endpoint.responses['201'] || endpoint.responses['204'];
    if (successResponse?.content?.['application/json']?.schema) {
      return this.convertSchemaToType(successResponse.content['application/json'].schema);
    }
    return 'void';
  }

  private extractParameters(endpoint: ApiEndpoint): string[] {
    const params: string[] = [];

    // 路径参数
    (endpoint.parameters || [])
      .filter(p => p.in === 'path')
      .forEach(param => {
        const type = this.convertSchemaToType(param.schema);
        params.push(`${param.name}${param.required ? '' : '?'}: ${type}`);
      });

    // 查询参数
    const queryParams = (endpoint.parameters || [])
      .filter(p => p.in === 'query');

    if (queryParams.length > 0) {
      const queryType = this.generateQueryParametersType(queryParams);
      params.push(`queryParams?: ${queryType}`);
    }

    // 请求体
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestBody) {
      const bodyType = this.extractBodyType(endpoint.requestBody);
      params.push(`data: ${bodyType}`);
    }

    return params;
  }

  private generateQueryParametersType(params: ApiParameter[]): string {
    const properties: string[] = [];
    const required: string[] = [];

    params.forEach(param => {
      const type = this.convertSchemaToType(param.schema);
      const optional = param.required ? '' : '?';
      properties.push(`  ${param.name}${optional}: ${type};`);

      if (param.required) {
        required.push(param.name);
      }
    });

    return `{ ${properties.join(' ')} }`;
  }

  private extractPathParameters(endpoint: ApiEndpoint): string[] {
    return (endpoint.parameters || [])
      .filter(p => p.in === 'path')
      .map(p => p.name);
  }

  private extractQueryParameters(endpoint: ApiEndpoint): string[] {
    return (endpoint.parameters || [])
      .filter(p => p.in === 'query')
      .map(p => p.name);
  }

  private extractBodyParameter(endpoint: ApiEndpoint): string | null {
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestBody) {
      return 'data';
    }
    return null;
  }

  private extractBodyType(requestBody: ApiRequestBody): string {
    const jsonContent = requestBody.content?.['application/json'];
    if (jsonContent?.schema) {
      return this.convertSchemaToType(jsonContent.schema);
    }
    return 'any';
  }

  private replacePathParams(path: string, params: string[]): string {
    let result = path;
    params.forEach(param => {
      result = result.replace(`{${param}}`, `\${${param}}`);
    });
    return result;
  }

  private getTags(): Set<string> {
    const tags = new Set<string>();
    Object.values(this.spec.paths).forEach(pathItem => {
      Object.values(pathItem).forEach(endpoint => {
        if (typeof endpoint === 'object' && endpoint.tags) {
          endpoint.tags.forEach(tag => tags.add(tag));
        }
      });
    });
    return tags;
  }
}

// =============================================================================
// 生成的代码类型
// =============================================================================

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GeneratedCode {
  files: GeneratedFile[];
  spec: OpenAPIDocument;
}

// =============================================================================
// 使用示例
// =============================================================================

/*
使用示例：

// 1. 从OpenAPI规范生成客户端
const generator = new ApiClientGenerator({
  inputSpec: './api-spec.json', // 或传入解析的对象
  outputDir: './generated',
  clientName: 'MyApiClient',
  language: 'typescript',
  generateClientClasses: true,
  generateServiceClasses: true,
  exportSchemas: true
});

const generatedCode = await generator.generate();

// 2. 使用生成的客户端
import { MyApiClient } from './generated';

const client = new MyApiClient({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'bearer',
    token: 'your-token'
  }
});

// 类型安全的API调用
const posts = await client.blog.getPosts({ page: 1, limit: 10 });
const user = await client.users.getUserById('123');
const result = await client.projects.createProject({
  name: 'New Project',
  description: 'Project description'
});
*/