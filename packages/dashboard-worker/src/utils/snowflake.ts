/**
 * Snowflake ID 生成器 (Twitter 雪花算法)
 * 生成 64 位唯一 ID，结构如下：
 * - 1 bit: 未使用 (符号位，始终为0)
 * - 41 bits: 时间戳 (毫秒级，可用约69年)
 * - 10 bits: 工作机器ID (可支持1024个节点)
 * - 12 bits: 序列号 (每毫秒可生成4096个ID)
 */

export class SnowflakeIdGenerator {
  private readonly epoch: number; // 起始时间戳 (2024-01-01 00:00:00 UTC)
  private readonly workerIdBits = 5n;
  private readonly datacenterIdBits = 5n;
  private readonly sequenceBits = 12n;

  private readonly maxWorkerId: bigint;
  private readonly maxDatacenterId: bigint;
  private readonly sequenceMask: bigint;

  private readonly workerIdShift: bigint;
  private readonly datacenterIdShift: bigint;
  private readonly timestampLeftShift: bigint;

  private workerId: bigint;
  private datacenterId: bigint;
  private sequence = 0n;
  private lastTimestamp = -1n;

  constructor(workerId: number = 1, datacenterId: number = 1) {
    // 起始时间：2024-01-01 00:00:00 UTC
    this.epoch = 1704067200000;

    this.maxWorkerId = -1n ^ (-1n << this.workerIdBits);
    this.maxDatacenterId = -1n ^ (-1n << this.datacenterIdBits);
    this.sequenceMask = -1n ^ (-1n << this.sequenceBits);

    this.workerIdShift = this.sequenceBits;
    this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
    this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;

    // 验证 workerId 和 datacenterId
    if (workerId < 0 || workerId > Number(this.maxWorkerId)) {
      throw new Error(`Worker ID must be between 0 and ${this.maxWorkerId}`);
    }
    if (datacenterId < 0 || datacenterId > Number(this.maxDatacenterId)) {
      throw new Error(`Datacenter ID must be between 0 and ${this.maxDatacenterId}`);
    }

    this.workerId = BigInt(workerId);
    this.datacenterId = BigInt(datacenterId);
  }

  /**
   * 生成下一个唯一ID
   */
  nextId(): bigint {
    let timestamp = this.getCurrentTimestamp();

    // 时钟回拨检测
    if (timestamp < this.lastTimestamp) {
      throw new Error(`Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`);
    }

    // 同一毫秒内，序列号递增
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;

      // 序列号溢出，等待下一毫秒
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      // 不同毫秒，序列号重置
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    // 组装ID
    return (
      ((timestamp - BigInt(this.epoch)) << this.timestampLeftShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence
    );
  }

  /**
   * 生成数字类型的ID (适用于数据库INTEGER字段)
   */
  nextIdAsNumber(): number {
    const id = this.nextId();
    // JavaScript Number.MAX_SAFE_INTEGER = 2^53 - 1
    // 雪花算法生成的是64位，需要确保不超过安全整数范围
    if (id > Number.MAX_SAFE_INTEGER) {
      // 如果超过安全整数，使用时间戳+随机数方案作为降级
      return this.generateFallbackId();
    }
    return Number(id);
  }

  /**
   * 降级方案：生成基于时间戳的唯一ID
   */
  private generateFallbackId(): number {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    // 使用13位时间戳 + 6位随机数，保证在安全整数范围内
    return timestamp * 1000000 + random;
  }

  /**
   * 获取当前时间戳
   */
  private getCurrentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  /**
   * 等待直到下一毫秒
   */
  private tilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.getCurrentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.getCurrentTimestamp();
    }
    return timestamp;
  }

  /**
   * 解析雪花ID，获取时间戳、工作机器ID等信息
   */
  parse(id: bigint): {
    timestamp: number;
    datacenterId: number;
    workerId: number;
    sequence: number;
  } {
    const timestamp = Number((id >> this.timestampLeftShift) + BigInt(this.epoch));
    const datacenterId = Number((id >> this.datacenterIdShift) & ((1n << this.datacenterIdBits) - 1n));
    const workerId = Number((id >> this.workerIdShift) & ((1n << this.workerIdBits) - 1n));
    const sequence = Number(id & this.sequenceMask);

    return { timestamp, datacenterId, workerId, sequence };
  }
}

// 创建全局单例
let globalGenerator: SnowflakeIdGenerator | null = null;

/**
 * 获取全局雪花ID生成器
 */
export function getSnowflakeGenerator(workerId?: number, datacenterId?: number): SnowflakeIdGenerator {
  if (!globalGenerator) {
    globalGenerator = new SnowflakeIdGenerator(workerId, datacenterId);
  }
  return globalGenerator;
}

/**
 * 生成雪花ID (便捷函数)
 */
export function generateSnowflakeId(): number {
  return getSnowflakeGenerator().nextIdAsNumber();
}
