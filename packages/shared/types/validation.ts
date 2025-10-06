/**
 * 类型验证工具函数
 * 提供运行时类型检查和数据验证功能
 */

// =============================================================================
// 基础验证工具
// =============================================================================

// 验证结果类型
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
  constraint?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// 验证器函数类型
export type ValidatorFunction<T = any> = (value: any) => ValidationResult;

// 验证规则类型
export interface ValidationRule {
  type: ValidatorType;
  required?: boolean;
  message?: string;
  constraint?: any;
  custom?: ValidatorFunction;
}

export type ValidatorType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime'
  | 'uuid'
  | 'enum'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom';

// 验证器类
export class Validator {
  private rules: Map<string, ValidationRule[]> = new Map();

  // 添加字段验证规则
  addRule(field: string, rule: ValidationRule): this {
    const rules = this.rules.get(field) || [];
    rules.push(rule);
    this.rules.set(field, rules);
    return this;
  }

  // 添加多个字段验证规则
  addRules(fieldRules: Record<string, ValidationRule[]>): this {
    Object.entries(fieldRules).forEach(([field, rules]) => {
      rules.forEach(rule => this.addRule(field, rule));
    });
    return this;
  }

  // 验证单个字段
  validateField(field: string, value: any): ValidationResult {
    const rules = this.rules.get(field) || [];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of rules) {
      // 检查必填
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: rule.message || `${field} is required`,
          code: 'REQUIRED',
          value
        });
        continue;
      }

      // 如果值为空且不是必填，跳过其他验证
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // 自定义验证器
      if (rule.custom) {
        const result = rule.custom(value);
        if (!result.isValid) {
          errors.push(...result.errors);
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
        continue;
      }

      // 类型验证
      const typeResult = this.validateType(rule.type, value, rule.constraint, rule.message);
      if (!typeResult.isValid) {
        errors.push(...typeResult.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // 验证整个对象
  validate<T = any>(data: Record<string, any>): ValidationResult & { data?: T } {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // 验证所有定义了规则的字段
    for (const [field] of this.rules) {
      const result = this.validateField(field, data[field]);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    // 检查是否有未定义的字段（可选）
    const definedFields = Array.from(this.rules.keys());
    const extraFields = Object.keys(data).filter(key => !definedFields.includes(key));
    if (extraFields.length > 0) {
      allWarnings.push(...extraFields.map(field => ({
        field,
        message: `Unexpected field: ${field}`,
        code: 'UNEXPECTED_FIELD',
        value: data[field]
      })));
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      data: allErrors.length === 0 ? data as T : undefined
    };
  }

  // 验证特定类型
  private validateType(type: ValidatorType, value: any, constraint?: any, message?: string): ValidationResult {
    const errors: ValidationError[] = [];

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push({
            field: '',
            message: message || 'Must be a string',
            code: 'INVALID_TYPE',
            value
          });
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push({
            field: '',
            message: message || 'Must be a number',
            code: 'INVALID_TYPE',
            value
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push({
            field: '',
            message: message || 'Must be a boolean',
            code: 'INVALID_TYPE',
            value
          });
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push({
            field: '',
            message: message || 'Must be an array',
            code: 'INVALID_TYPE',
            value
          });
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push({
            field: '',
            message: message || 'Must be an object',
            code: 'INVALID_TYPE',
            value
          });
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value)) {
          errors.push({
            field: '',
            message: message || 'Must be a valid email address',
            code: 'INVALID_EMAIL',
            value
          });
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          errors.push({
            field: '',
            message: message || 'Must be a valid URL',
            code: 'INVALID_URL',
            value
          });
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({
            field: '',
            message: message || 'Must be a valid date',
            code: 'INVALID_DATE',
            value
          });
        }
        break;

      case 'datetime':
        const datetime = new Date(value);
        if (isNaN(datetime.getTime())) {
          errors.push({
            field: '',
            message: message || 'Must be a valid datetime',
            code: 'INVALID_DATETIME',
            value
          });
        }
        break;

      case 'uuid':
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (typeof value !== 'string' || !uuidRegex.test(value)) {
          errors.push({
            field: '',
            message: message || 'Must be a valid UUID',
            code: 'INVALID_UUID',
            value
          });
        }
        break;

      case 'enum':
        if (Array.isArray(constraint) && !constraint.includes(value)) {
          errors.push({
            field: '',
            message: message || `Must be one of: ${constraint.join(', ')}`,
            code: 'INVALID_ENUM',
            value,
            constraint
          });
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < constraint) {
          errors.push({
            field: '',
            message: message || `Must be at least ${constraint}`,
            code: 'MIN_VALUE',
            value,
            constraint
          });
        } else if (typeof value === 'string' && value.length < constraint) {
          errors.push({
            field: '',
            message: message || `Must be at least ${constraint} characters long`,
            code: 'MIN_LENGTH',
            value,
            constraint
          });
        } else if (Array.isArray(value) && value.length < constraint) {
          errors.push({
            field: '',
            message: message || `Must have at least ${constraint} items`,
            code: 'MIN_ITEMS',
            value,
            constraint
          });
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > constraint) {
          errors.push({
            field: '',
            message: message || `Must be at most ${constraint}`,
            code: 'MAX_VALUE',
            value,
            constraint
          });
        } else if (typeof value === 'string' && value.length > constraint) {
          errors.push({
            field: '',
            message: message || `Must be at most ${constraint} characters long`,
            code: 'MAX_LENGTH',
            value,
            constraint
          });
        } else if (Array.isArray(value) && value.length > constraint) {
          errors.push({
            field: '',
            message: message || `Must have at most ${constraint} items`,
            code: 'MAX_ITEMS',
            value,
            constraint
          });
        }
        break;

      case 'minLength':
        if (typeof value !== 'string' || value.length < constraint) {
          errors.push({
            field: '',
            message: message || `Must be at least ${constraint} characters long`,
            code: 'MIN_LENGTH',
            value,
            constraint
          });
        }
        break;

      case 'maxLength':
        if (typeof value !== 'string' || value.length > constraint) {
          errors.push({
            field: '',
            message: message || `Must be at most ${constraint} characters long`,
            code: 'MAX_LENGTH',
            value,
            constraint
          });
        }
        break;

      case 'pattern':
        if (typeof value !== 'string' || !(constraint as RegExp).test(value)) {
          errors.push({
            field: '',
            message: message || 'Must match the required pattern',
            code: 'INVALID_PATTERN',
            value,
            constraint
          });
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 清除规则
  clear(): this {
    this.rules.clear();
    return this;
  }

  // 移除字段规则
  removeField(field: string): this {
    this.rules.delete(field);
    return this;
  }
}

// =============================================================================
// 预定义验证器
// =============================================================================

// 创建字符串验证器
export function stringValidator(minLength?: number, maxLength?: number, pattern?: RegExp): ValidatorFunction<string> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'string',
      required: true
    });

    if (minLength !== undefined) {
      validator.addRule('', {
        type: 'minLength',
        constraint: minLength
      });
    }

    if (maxLength !== undefined) {
      validator.addRule('', {
        type: 'maxLength',
        constraint: maxLength
      });
    }

    if (pattern) {
      validator.addRule('', {
        type: 'pattern',
        constraint: pattern
      });
    }

    return validator.validateField('', value);
  };
}

// 创建数字验证器
export function numberValidator(min?: number, max?: number, integer?: boolean): ValidatorFunction<number> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'number',
      required: true
    });

    if (integer) {
      validator.addRule('', {
        type: 'custom',
        custom: (val: number) => ({
          isValid: Number.isInteger(val),
          errors: Number.isInteger(val) ? [] : [{
            field: '',
            message: 'Must be an integer',
            code: 'INVALID_INTEGER',
            value: val
          }]
        })
      });
    }

    if (min !== undefined) {
      validator.addRule('', {
        type: 'min',
        constraint: min
      });
    }

    if (max !== undefined) {
      validator.addRule('', {
        type: 'max',
        constraint: max
      });
    }

    return validator.validateField('', value);
  };
}

// 创建邮箱验证器
export const emailValidator: ValidatorFunction<string> = stringValidator(5, 254, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// 创建URL验证器
export function urlValidator(protocols?: string[]): ValidatorFunction<string> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'url',
      required: true
    });

    if (protocols && protocols.length > 0) {
      validator.addRule('', {
        type: 'custom',
        custom: (val: string) => {
          try {
            const url = new URL(val);
            const isValidProtocol = protocols.includes(url.protocol);
            return {
              isValid: isValidProtocol,
              errors: isValidProtocol ? [] : [{
                field: '',
                message: `URL protocol must be one of: ${protocols.join(', ')}`,
                code: 'INVALID_PROTOCOL',
                value: val
              }]
            };
          } catch {
            return {
              isValid: false,
              errors: [{
                field: '',
                message: 'Invalid URL',
                code: 'INVALID_URL',
                value: val
              }]
            };
          }
        }
      });
    }

    return validator.validateField('', value);
  };
}

// 创建日期验证器
export function dateValidator(minDate?: Date, maxDate?: Date): ValidatorFunction<string> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'date',
      required: true
    });

    validator.addRule('', {
      type: 'custom',
      custom: (val: string) => {
        const date = new Date(val);
        const errors: ValidationError[] = [];

        if (minDate && date < minDate) {
          errors.push({
            field: '',
            message: `Date must be after ${minDate.toISOString()}`,
            code: 'DATE_TOO_EARLY',
            value: val
          });
        }

        if (maxDate && date > maxDate) {
          errors.push({
            field: '',
            message: `Date must be before ${maxDate.toISOString()}`,
            code: 'DATE_TOO_LATE',
            value: val
          });
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    return validator.validateField('', value);
  };
}

// 创建枚举验证器
export function enumValidator<T extends string>(values: T[]): ValidatorFunction<T> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'enum',
      constraint: values,
      required: true
    });

    return validator.validateField('', value);
  };
}

// 创建数组验证器
export function arrayValidator<T>(
  itemValidator: ValidatorFunction<T>,
  minLength?: number,
  maxLength?: number
): ValidatorFunction<T[]> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'array',
      required: true
    });

    if (minLength !== undefined) {
      validator.addRule('', {
        type: 'min',
        constraint: minLength
      });
    }

    if (maxLength !== undefined) {
      validator.addRule('', {
        type: 'max',
        constraint: maxLength
      });
    }

    // 验证数组项
    validator.addRule('', {
      type: 'custom',
      custom: (val: T[]) => {
        const errors: ValidationError[] = [];

        val.forEach((item, index) => {
          const result = itemValidator(item);
          if (!result.isValid) {
            errors.push(...result.errors.map(error => ({
              ...error,
              field: error.field ? `${index}.${error.field}` : `${index}`,
              message: `Item ${index}: ${error.message}`
            })));
          }
        });

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    return validator.validateField('', value);
  };
}

// 创建对象验证器
export function objectValidator<T extends Record<string, any>>(
  schema: Record<keyof T, ValidatorFunction>
): ValidatorFunction<T> {
  return (value: any) => {
    const validator = new Validator();
    validator.addRule('', {
      type: 'object',
      required: true
    });

    // 验证对象属性
    validator.addRule('', {
      type: 'custom',
      custom: (val: T) => {
        const errors: ValidationError[] = [];

        Object.entries(schema).forEach(([field, fieldValidator]) => {
          const result = fieldValidator(val[field]);
          if (!result.isValid) {
            errors.push(...result.errors.map(error => ({
              ...error,
              field: error.field ? `${field}.${error.field}` : field,
              message: `${field}: ${error.message}`
            })));
          }
        });

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    return validator.validateField('', value);
  };
}

// =============================================================================
// 类型守卫函数
// =============================================================================

// 基础类型守卫
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

// 特定类型守卫
export function isEmail(value: any): value is string {
  return isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isUrl(value: any): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isUuid(value: any): value is string {
  return isString(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isNotEmpty(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (isString(value) || isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return true;
}

// =============================================================================
// 模式匹配工具
// =============================================================================

// 模式匹配器接口
export interface PatternMatcher<T> {
  when<R>(condition: (value: T) => boolean, handler: (value: T) => R): PatternMatcher<T>;
  otherwise<R>(handler: (value: T) => R): R;
}

// 创建模式匹配器
export function match<T>(value: T): PatternMatcher<T> {
  const cases: Array<{ condition: (value: T) => boolean; handler: (value: T) => any }> = [];

  return {
    when<R>(condition: (value: T) => boolean, handler: (value: T) => R): PatternMatcher<T> {
      cases.push({ condition, handler });
      return this;
    },
    otherwise<R>(handler: (value: T) => R): R {
      for (const { condition, handler: caseHandler } of cases) {
        if (condition(value)) {
          return caseHandler(value);
        }
      }
      return handler(value);
    }
  };
}

// =============================================================================
// 类型转换工具
// =============================================================================

// 类型转换器接口
export interface TypeConverter<T, R> {
  convert(value: T): R | null;
  isValid(value: T): boolean;
}

// 字符串转数字
export const stringToNumber: TypeConverter<string, number> = {
  convert(value: string): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  },
  isValid(value: string): boolean {
    return !isNaN(Number(value));
  }
};

// 字符串转日期
export const stringToDate: TypeConverter<string, Date> = {
  convert(value: string): Date | null {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },
  isValid(value: string): boolean {
    return !isNaN(new Date(value).getTime());
  }
};

// 字符串转布尔值
export const stringToBoolean: TypeConverter<string, boolean> = {
  convert(value: string): boolean | null {
    const lower = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lower)) return true;
    if (['false', '0', 'no', 'off'].includes(lower)) return false;
    return null;
  },
  isValid(value: string): boolean {
    const lower = value.toLowerCase();
    return ['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(lower);
  }
};

// 安全类型转换
export function safeConvert<T, R>(value: T, converter: TypeConverter<T, R>): R | null {
  if (converter.isValid(value)) {
    return converter.convert(value);
  }
  return null;
}

// =============================================================================
// 批量验证工具
// =============================================================================

// 批量验证结果
export interface BatchValidationResult {
  total: number;
  valid: number;
  invalid: number;
  results: Array<{
    index: number;
    value: any;
    result: ValidationResult;
  }>;
  errors: ValidationError[];
}

// 批量验证函数
export function batchValidate<T>(
  values: T[],
  validator: ValidatorFunction<T>
): BatchValidationResult {
  const results: BatchValidationResult['results'] = [];
  const allErrors: ValidationError[] = [];
  let valid = 0;
  let invalid = 0;

  values.forEach((value, index) => {
    const result = validator(value);
    results.push({
      index,
      value,
      result
    });

    if (result.isValid) {
      valid++;
    } else {
      invalid++;
      allErrors.push(...result.errors.map(error => ({
        ...error,
        field: error.field ? `${index}.${error.field}` : `${index}`,
        message: `Item ${index}: ${error.message}`
      })));
    }
  });

  return {
    total: values.length,
    valid,
    invalid,
    results,
    errors: allErrors
  };
}

// =============================================================================
// 验证中间件
// =============================================================================

// 验证中间件配置
export interface ValidationMiddlewareConfig {
  body?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
  headers?: Record<string, ValidationRule>;
  stopOnFirstError?: boolean;
  transform?: boolean; // 是否自动转换数据类型
}

// 创建验证中间件
export function createValidationMiddleware(config: ValidationMiddlewareConfig) {
  const bodyValidator = config.body ? new Validator().addRules({ body: config.body }) : null;
  const queryValidator = config.query ? new Validator().addRules({ query: config.query }) : null;
  const paramsValidator = config.params ? new Validator().addRules({ params: config.params }) : null;
  const headersValidator = config.headers ? new Validator().addRules({ headers: config.headers }) : null;

  return async (c: any, next: any) => {
    const errors: ValidationError[] = [];
    const transformedData: any = {};

    // 验证请求体
    if (bodyValidator && c.request.body) {
      const result = bodyValidator.validate({ body: c.request.body });
      if (!result.isValid) {
        errors.push(...result.errors);
      } else if (result.data) {
        transformedData.body = result.data.body;
      }
    }

    // 验证查询参数
    if (queryValidator) {
      const result = queryValidator.validate({ query: c.query });
      if (!result.isValid) {
        errors.push(...result.errors);
      } else if (result.data) {
        transformedData.query = result.data.query;
      }
    }

    // 验证路径参数
    if (paramsValidator) {
      const result = paramsValidator.validate({ params: c.params });
      if (!result.isValid) {
        errors.push(...result.errors);
      } else if (result.data) {
        transformedData.params = result.data.params;
      }
    }

    // 验证请求头
    if (headersValidator) {
      const result = headersValidator.validate({ headers: c.headers });
      if (!result.isValid) {
        errors.push(...result.errors);
      } else if (result.data) {
        transformedData.headers = result.data.headers;
      }
    }

    // 如果有错误，返回400响应
    if (errors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 将转换后的数据附加到上下文
    if (config.transform) {
      Object.assign(c, transformedData);
    }

    await next();
  };
}