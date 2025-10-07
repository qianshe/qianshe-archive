/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 日志条目接口
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * 日志服务配置
 */
interface LoggerConfig {
  /** 是否启用日志 */
  enabled: boolean;
  /** 最低日志级别 */
  minLevel: LogLevel;
  /** 是否发送到远程服务器 */
  remote: boolean;
  /** 远程日志端点 */
  remoteEndpoint?: string;
}

/**
 * 日志服务类
 * 提供统一的日志记录接口，支持不同级别的日志输出
 */
class LoggerService {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  constructor() {
    this.config = {
      enabled: true,
      minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
      remote: false
    };
  }

  /**
   * 配置日志服务
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.config.enabled) {
      return;
    }

    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };

    // 添加到内存日志
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // 控制台输出
    this.consoleLog(entry);

    // 发送到远程服务器
    if (this.config.remote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  /**
   * 判断是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.minLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= currentLevelIndex;
  }

  /**
   * 控制台输出
   */
  private consoleLog(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context || '');
        break;
    }
  }

  /**
   * 发送到远程服务器
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // 远程日志失败不应该影响应用运行
      console.error('Failed to send log to remote:', error);
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 信息日志
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 警告日志
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * 错误日志
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 获取指定级别的日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 导出日志（用于下载）
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// 导出单例
export const loggerService = new LoggerService();
