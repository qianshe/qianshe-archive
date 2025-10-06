# 谦舍 (QianShe) 运维手册

## 目录

- [系统概览](#系统概览)
- [日常监控](#日常监控)
- [备份策略](#备份策略)
- [更新维护](#更新维护)
- [故障处理](#故障处理)
- [性能优化](#性能优化)
- [安全维护](#安全维护)
- [日志管理](#日志管理)

## 系统概览

### 架构组件

- **Portfolio Worker** - 公开访问的前端展示服务
- **Dashboard Worker** - 后台管理服务
- **D1 Database** - 共享 SQLite 数据库
- **KV Storage** - 缓存存储
- **Frontend Assets** - 静态资源文件

### 服务依赖关系

```
用户请求 → Cloudflare CDN → Workers → D1/KV → 响应
                ↓
            监控和日志系统
```

## 日常监控

### 1. 监控指标

#### 核心业务指标

- **可用性**: 服务正常运行时间
- **响应时间**: API 响应延迟
- **错误率**: 4xx/5xx 错误比例
- **并发量**: 同时在线用户数

#### 技术指标

- **CPU 使用率**: Worker 执行时间
- **内存使用**: 内存占用情况
- **数据库查询**: 查询性能和延迟
- **缓存命中率**: KV 缓存效果

### 2. 监控工具配置

#### Cloudflare Analytics

```bash
# 查看实时统计
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/analytics/dashboard" \
  -H "Authorization: Bearer API_TOKEN"
```

#### Worker 监控

```bash
# 实时查看 Worker 日志
wrangler tail portfolio-qianshe
wrangler tail dashboard-qianshe

# 设置日志过滤
wrangler tail portfolio-qianshe --filter="ERROR"
wrangler tail dashboard-qianshe --filter="WARN"
```

#### 自定义监控脚本

创建 `scripts/monitor.sh`:

```bash
#!/bin/bash

# 服务健康检查
check_service_health() {
    local url=$1
    local service_name=$2

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health")

    if [ "$response" = "200" ]; then
        echo "✅ $service_name: 健康"
    else
        echo "❌ $service_name: 异常 (HTTP $response)"
        # 发送告警通知
        send_alert "$service_name" "服务异常，状态码: $response"
    fi
}

# 响应时间检查
check_response_time() {
    local url=$1
    local service_name=$2
    local threshold=${3:-2000} # 默认2秒

    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url/health")
    response_time_ms=$(echo "$response_time * 1000" | bc)

    if (( $(echo "$response_time_ms < $threshold" | bc -l) )); then
        echo "✅ $service_name: 响应时间 ${response_time_ms}ms"
    else
        echo "⚠️ $service_name: 响应时间过慢 ${response_time_ms}ms"
        send_alert "$service_name" "响应时间过慢: ${response_time_ms}ms"
    fi
}

# 发送告警
send_alert() {
    local service=$1
    local message=$2

    # 可以集成邮件、钉钉、企业微信等通知方式
    echo "🚨 告警: $service - $message"
    # curl -X POST "webhook-url" -d "{'text': '$service: $message'}"
}

# 执行检查
echo "=== 服务健康检查 $(date) ==="
check_service_health "https://portfolio.qianshe.top" "Portfolio"
check_service_health "https://dashboard.qianshe.top" "Dashboard"

echo "=== 响应时间检查 ==="
check_response_time "https://portfolio.qianshe.top" "Portfolio" 2000
check_response_time "https://dashboard.qianshe.top" "Dashboard" 3000
```

### 3. 监控仪表板

#### 关键指标仪表板

建议设置以下监控面板：

- 服务可用性状态
- 请求量和趋势
- 错误率和错误类型分布
- 响应时间分布
- 数据库查询性能
- 缓存命中率

#### 告警规则

```yaml
# 示例告警规则配置
alerts:
  - name: '服务不可用'
    condition: 'availability < 99.9%'
    severity: 'critical'

  - name: '响应时间过慢'
    condition: 'avg_response_time > 3s'
    severity: 'warning'

  - name: '错误率过高'
    condition: 'error_rate > 5%'
    severity: 'warning'

  - name: '数据库查询异常'
    condition: 'db_query_time > 1s'
    severity: 'warning'
```

## 备份策略

### 1. 数据库备份

#### 自动备份脚本

创建 `scripts/backup-database.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/qianshe"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="qianshe_backup_${DATE}.sql"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 执行数据库备份
echo "开始备份数据库..."
wrangler d1 export qianshe-db --output="${BACKUP_DIR}/${BACKUP_FILE}"

# 压缩备份文件
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# 验证备份文件
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}.gz" ]; then
    echo "✅ 数据库备份完成: ${BACKUP_FILE}.gz"

    # 上传到云存储（可选）
    # aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" "s3://backup-bucket/"

    # 清理旧备份（保留最近30天）
    find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
    echo "🗑️ 已清理30天前的备份文件"
else
    echo "❌ 数据库备份失败"
    exit 1
fi
```

#### 定期备份设置

```bash
# 添加到 crontab，每天凌晨2点执行
crontab -e

# 添加以下行
0 2 * * * /path/to/qiansheArchive/scripts/backup-database.sh >> /var/log/qianshe-backup.log 2>&1
```

### 2. 配置文件备份

#### 备份清单

- `wrangler.toml` - Worker 配置
- `.env` 文件 - 环境变量
- 数据库迁移脚本
- SSL 证书（如有）
- 自定义配置文件

#### 备份脚本

创建 `scripts/backup-config.sh`:

```bash
#!/bin/bash

CONFIG_BACKUP_DIR="/backups/qianshe-config"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$CONFIG_BACKUP_DIR"

# 备份配置文件
echo "备份配置文件..."
tar -czf "${CONFIG_BACKUP_DIR}/config_${DATE}.tar.gz" \
    portfolio/worker/wrangler.toml \
    dashboard/worker/wrangler.toml \
    portfolio/.env.production \
    dashboard/.env.production \
    database/migrations/

echo "✅ 配置文件备份完成: config_${DATE}.tar.gz"
```

### 3. 恢复流程

#### 数据库恢复

```bash
#!/bin/bash

# 恢复数据库脚本 scripts/restore-database.sh
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "使用方法: $0 <backup_file>"
    exit 1
fi

echo "⚠️ 警告: 此操作将覆盖现有数据库"
read -p "确认继续? (y/N): " confirm

if [ "$confirm" = "y" ]; then
    # 解压备份文件
    gunzip -c "$BACKUP_FILE" > temp_restore.sql

    # 恢复数据库
    wrangler d1 execute qianshe-db --file=temp_restore.sql

    # 清理临时文件
    rm temp_restore.sql

    echo "✅ 数据库恢复完成"
else
    echo "取消恢复操作"
fi
```

## 更新维护

### 1. 版本管理

#### 语义化版本控制

```
MAJOR.MINOR.PATCH
- MAJOR: 不兼容的 API 修改
- MINOR: 向下兼容的功能性新增
- PATCH: 向下兼容的问题修正
```

#### 发布流程

```bash
# 1. 创建发布分支
git checkout -b release/v1.2.0

# 2. 更新版本号
echo "1.2.0" > VERSION

# 3. 更新变更日志
echo "# v1.2.0
## 新增功能
- 功能A
- 功能B

## 问题修复
- 修复问题C
- 修复问题D
" > CHANGELOG.md

# 4. 提交变更
git add .
git commit -m "Release v1.2.0"

# 5. 合并到主分支
git checkout main
git merge release/v1.2.0

# 6. 创建标签
git tag v1.2.0

# 7. 推送到远程
git push origin main
git push origin v1.2.0
```

### 2. 更新流程

#### 滚动更新

```bash
#!/bin/bash
# scripts/rolling-update.sh

echo "开始滚动更新..."

# 1. 备份当前版本
./scripts/backup-database.sh
./scripts/backup-config.sh

# 2. 更新代码
git pull origin main

# 3. 更新依赖
npm run install:all

# 4. 构建前端
cd portfolio/frontend && npm run build
cd ../dashboard/frontend && npm run build

# 5. 部署 Workers
echo "部署 Portfolio Worker..."
cd portfolio/worker && wrangler deploy

echo "部署 Dashboard Worker..."
cd ../../dashboard/worker && wrangler deploy

# 6. 验证部署
echo "验证服务状态..."
sleep 10
./scripts/monitor.sh

echo "✅ 滚动更新完成"
```

#### 蓝绿部署

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

ENVIRONMENT=$1
if [ -z "$ENVIRONMENT" ]; then
    echo "使用方法: $0 <blue|green>"
    exit 1
fi

echo "蓝绿部署到 $ENVIRONMENT 环境..."

# 根据环境选择不同的 Worker 名称
if [ "$ENVIRONMENT" = "blue" ]; then
    PORTFOLIO_WORKER="portfolio-qianshe-blue"
    DASHBOARD_WORKER="dashboard-qianshe-blue"
    PORTFOLIO_DOMAIN="portfolio-blue.qianshe.top"
    DASHBOARD_DOMAIN="dashboard-blue.qianshe.top"
else
    PORTFOLIO_WORKER="portfolio-qianshe-green"
    DASHBOARD_WORKER="dashboard-qianshe-green"
    PORTFOLIO_DOMAIN="portfolio-green.qianshe.top"
    DASHBOARD_DOMAIN="dashboard-green.qianshe.top"
fi

# 部署到指定环境
# 更新 wrangler.toml 中的 worker 名称和域名
sed -i "s/name = \"portfolio-qianshe\"/name = \"$PORTFOLIO_WORKER\"/" portfolio/worker/wrangler.toml
sed -i "s/name = \"dashboard-qianshe\"/name = \"$DASHBOARD_WORKER\"/" dashboard/worker/wrangler.toml

# 执行部署
cd portfolio/worker && wrangler deploy
cd ../../dashboard/worker && wrangler deploy

# 健康检查
echo "等待服务启动..."
sleep 30

# 验证新环境
if curl -f "https://$PORTFOLIO_DOMAIN/health" && curl -f "https://$DASHBOARD_DOMAIN/health"; then
    echo "✅ $ENVIRONMENT 环境部署成功"
    echo "请手动切换 DNS 到新环境"
else
    echo "❌ $ENVIRONMENT 环境部署失败"
    exit 1
fi
```

### 3. 数据库迁移

#### 迁移脚本管理

```bash
# 创建新迁移
cd portfolio/worker
wrangler d1 migrations create add_new_table

# 执行迁移（开发环境）
wrangler d1 migrations apply qianshe-db

# 执行迁移（生产环境）
wrangler d1 migrations apply qianshe-db --remote

# 回滚迁移
wrangler d1 migrations rollback qianshe-db --remote
```

#### 迁移检查脚本

```bash
#!/bin/bash
# scripts/check-migration.sh

echo "检查数据库迁移状态..."

# 获取当前迁移版本
current_version=$(wrangler d1 migrations list qianshe-db --remote | grep -E "^\d+" | tail -1 | awk '{print $1}')

# 获取最新迁移版本
latest_version=$(ls portfolio/worker/migrations/ | grep -E "^\d+" | tail -1 | sed 's/-.*//')

echo "当前版本: $current_version"
echo "最新版本: $latest_version"

if [ "$current_version" = "$latest_version" ]; then
    echo "✅ 数据库已是最新版本"
else
    echo "⚠️ 需要执行数据库迁移"
    echo "执行命令: wrangler d1 migrations apply qianshe-db --remote"
fi
```

## 故障处理

### 1. 常见故障类型

#### 服务不可用

**症状**: 503/504 错误
**可能原因**:

- Worker 执行超时
- 数据库连接问题
- 资源配额耗尽

**处理步骤**:

```bash
# 1. 检查 Worker 状态
wrangler tail portfolio-qianshe --since=5m
wrangler tail dashboard-qianshe --since=5m

# 2. 检查数据库连接
wrangler d1 execute qianshe-db --command "SELECT 1"

# 3. 检查资源配额
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "Authorization: Bearer API_TOKEN"

# 4. 重启 Worker（如果需要）
wrangler deploy portfolio/worker
wrangler deploy dashboard/worker
```

#### 数据库性能问题

**症状**: 响应时间过长
**可能原因**:

- 查询语句优化不足
- 缺少索引
- 数据量过大

**处理步骤**:

```bash
# 1. 分析慢查询
wrangler d1 execute qianshe-db --command "
SELECT query, time FROM analytics
WHERE time > 1000
ORDER BY time DESC
LIMIT 10"

# 2. 检查索引
wrangler d1 execute qianshe-db --command "PRAGMA index_list(posts)"

# 3. 添加缺失索引
wrangler d1 execute qianshe-db --command "CREATE INDEX idx_posts_status ON posts(status)"

# 4. 清理过期数据
wrangler d1 execute qianshe-db --command "
DELETE FROM analytics
WHERE created_at < datetime('now', '-30 days')"
```

#### 缓存问题

**症状**: 数据不一致或性能下降
**可能原因**:

- 缓存未及时更新
- 缓存键冲突
- KV 存储问题

**处理步骤**:

```bash
# 1. 清理缓存
# 通过 Dashboard 的缓存管理接口清理
curl -X POST "https://dashboard.qianshe.top/api/cache/clear" \
  -H "Authorization: Bearer $JWT_TOKEN"

# 2. 检查 KV 存储状态
wrangler kv:namespace list
wrangler kv:key list qianshe-cache

# 3. 重建缓存
curl -X POST "https://dashboard.qianshe.top/api/cache/warmup" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 2. 故障响应流程

#### 告警级别定义

- **P0**: 服务完全不可用，影响所有用户
- **P1**: 核心功能异常，影响大部分用户
- **P2**: 部分功能异常，影响少数用户
- **P3**: 性能下降，用户体验受影响

#### 响应时间要求

- **P0**: 15分钟内响应，1小时内解决
- **P1**: 30分钟内响应，4小时内解决
- **P2**: 2小时内响应，24小时内解决
- **P3**: 1个工作日内响应，1周内解决

#### 故障处理脚本

创建 `scripts/incident-response.sh`:

```bash
#!/bin/bash

INCIDENT_ID=$1
SEVERITY=$2
DESCRIPTION="$3"

if [ -z "$INCIDENT_ID" ] || [ -z "$SEVERITY" ]; then
    echo "使用方法: $0 <incident_id> <severity> [description]"
    exit 1
fi

echo "🚨 开始故障处理: $INCIDENT_ID ($SEVERITY)"
if [ ! -z "$DESCRIPTION" ]; then
    echo "描述: $DESCRIPTION"
fi

# 创建故障处理目录
INCIDENT_DIR="/incidents/$INCIDENT_ID"
mkdir -p "$INCIDENT_DIR"

# 记录开始时间
echo "$(date): 故障开始" > "$INCIDENT_DIR/timeline.log"

# 收集系统状态
echo "收集系统状态..."
./scripts/monitor.sh > "$INCIDENT_DIR/system-status.log"

# 收集日志
echo "收集日志..."
wrangler tail portfolio-qianshe --since=1h > "$INCIDENT_DIR/portfolio-logs.log" &
wrangler tail dashboard-qianshe --since=1h > "$INCIDENT_DIR/dashboard-logs.log" &

# 等待日志收集
sleep 10

echo "✅ 故障信息收集完成"
echo "📁 故障目录: $INCIDENT_DIR"
echo "请查看日志文件进行故障分析"
```

### 3. 复盘和改进

#### 故障复盘模板

```markdown
# 故障复盘报告

## 基本信息

- 故障ID: INC-001
- 发生时间: 2024-01-01 10:00:00
- 恢复时间: 2024-01-01 11:30:00
- 影响时长: 90分钟
- 故障级别: P1

## 影响范围

- 影响用户: 所有访问 Portfolio 的用户
- 影响功能: 文章列表和详情页面
- 错误率: 100%

## 故障原因

### 直接原因

- 数据库查询语句执行超时
- 缺少必要的索引

### 根本原因

- 新功能发布前未进行性能测试
- 缺少数据库性能监控

## 处理过程

1. 10:15 接到告警通知
2. 10:20 开始故障排查
3. 10:45 定位问题原因
4. 11:00 修复问题并部署
5. 11:30 验证恢复

## 改进措施

1. 添加数据库查询性能监控
2. 建立发布前的性能测试流程
3. 完善数据库索引规范
4. 增加自动化监控告警

## 责任人

- 故障处理: 张三
- 根本分析: 李四
- 改进跟进: 王五
```

## 性能优化

### 1. 数据库性能优化

#### 查询优化

```sql
-- 添加复合索引
CREATE INDEX idx_posts_status_created ON posts(status, created_at);

-- 分析查询计划
EXPLAIN QUERY PLAN
SELECT * FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 10;

-- 优化分页查询
SELECT * FROM posts
WHERE id < (SELECT id FROM posts ORDER BY created_at DESC LIMIT 1 OFFSET 20)
ORDER BY created_at DESC
LIMIT 10;
```

#### 数据库维护

```bash
# 定期维护脚本 scripts/db-maintenance.sh
#!/bin/bash

echo "开始数据库维护..."

# 1. 清理过期数据
wrangler d1 execute qianshe-db --command "
DELETE FROM analytics
WHERE created_at < datetime('now', '-90 days')"

# 2. 更新统计信息
wrangler d1 execute qianshe-db --command "ANALYZE"

# 3. 检查数据库完整性
wrangler d1 execute qianshe-db --command "PRAGMA integrity_check"

# 4. 重建索引（如果需要）
# wrangler d1 execute qianshe-db --command "REINDEX"

echo "✅ 数据库维护完成"
```

### 2. 缓存优化

#### 缓存策略调整

```typescript
// 更新缓存配置
const cacheConfigs = {
  // 热门内容缓存更长时间
  hotPosts: { ttl: 1800, tags: ['posts', 'hot'] },

  // 首页缓存
  homepage: { ttl: 600, tags: ['homepage'] },

  // API 响应缓存
  apiResponse: { ttl: 300, tags: ['api'] },

  // 静态资源长期缓存
  staticAssets: { ttl: 86400, tags: ['static'] }
};
```

#### 缓存预热

```typescript
// 缓存预热脚本
async function warmupCache() {
  const urls = ['/api/posts', '/api/projects', '/api/posts/featured', '/api/projects/featured'];

  for (const url of urls) {
    try {
      await fetch(`https://portfolio.qianshe.top${url}`);
      console.log(`缓存预热: ${url}`);
    } catch (error) {
      console.error(`缓存预热失败: ${url}`, error);
    }
  }
}
```

### 3. 前端性能优化

#### 资源优化

```bash
# 图片优化
find portfolio/frontend/src/assets -name "*.jpg" -exec jpegoptim --max=80 {} \;
find portfolio/frontend/src/assets -name "*.png" -exec pngquant --quality=80 {} \;

# 代码压缩
cd portfolio/frontend && npm run build --analyze
cd dashboard/frontend && npm run build --analyze

# 查看包大小分析
npx vite-bundle-analyzer dist/stats.html
```

## 安全维护

### 1. 定期安全检查

#### 依赖漏洞扫描

```bash
# 检查依赖漏洞
cd portfolio/frontend && npm audit
cd ../dashboard/frontend && npm audit

# 修复漏洞
npm audit fix
```

#### 安全配置检查

```bash
# SSL 证书检查
ssl-checker portfolio.qianshe.top
ssl-checker dashboard.qianshe.top

# 安全头检查
curl -I https://portfolio.qianshe.top
curl -I https://dashboard.qianshe.top

# 端口扫描
nmap -sS -sV portfolio.qianshe.top
```

### 2. 访问控制

#### JWT 密钥轮换

```bash
#!/bin/bash
# scripts/rotate-jwt-secret.sh

echo "JWT 密钥轮换..."

# 生成新的 JWT 密钥
NEW_SECRET=$(openssl rand -base64 32)

# 更新 Dashboard Worker 密钥
wrangler secret put JWT_SECRET <<< "$NEW_SECRET"

# 记录密钥变更
echo "$(date): JWT 密钥已更新" >> /var/log/security.log

echo "✅ JWT 密钥轮换完成"
```

#### 权限审查

```bash
# 定期审查用户权限
wrangler d1 execute qianshe-db --command "
SELECT email, role, last_login FROM users
WHERE role != 'reader'
ORDER BY last_login DESC"
```

## 日志管理

### 1. 日志收集

#### 集中化日志

```typescript
// 日志配置
const logger = {
  info: (message: string, data?: any) => {
    console.log(
      JSON.stringify({
        level: 'info',
        message,
        data,
        timestamp: new Date().toISOString(),
        service: 'portfolio'
      })
    );
  },

  error: (message: string, error?: any) => {
    console.error(
      JSON.stringify({
        level: 'error',
        message,
        error: error?.stack || error,
        timestamp: new Date().toISOString(),
        service: 'portfolio'
      })
    );
  }
};
```

### 2. 日志分析

#### 日志查询脚本

```bash
#!/bin/bash
# scripts/log-analysis.sh

LOG_TYPE=$1
TIME_RANGE=${2:-"1h"}

case $LOG_TYPE in
  "errors")
    echo "最近 $TIME_RANGE 的错误日志:"
    wrangler tail portfolio-qianshe --since="$TIME_RANGE" | grep ERROR
    ;;
  "performance")
    echo "最近 $TIME_RANGE 的性能日志:"
    wrangler tail portfolio-qianshe --since="$TIME_RANGE" | grep "slow"
    ;;
  "security")
    echo "最近 $TIME_RANGE 的安全日志:"
    wrangler tail dashboard-qianshe --since="$TIME_RANGE" | grep "auth"
    ;;
  *)
    echo "使用方法: $0 <errors|performance|security> [time_range]"
    ;;
esac
```

### 3. 日志归档

#### 日志轮换策略

```bash
# 设置日志轮换
wrangler tail portfolio-qianshe --format=json --since=24h > /logs/portfolio-$(date +%Y%m%d).json
wrangler tail dashboard-qianshe --format=json --since=24h > /logs/dashboard-$(date +%Y%m%d).json

# 压缩旧日志
find /logs -name "*.json" -mtime +7 -exec gzip {} \;

# 清理30天前的日志
find /logs -name "*.json.gz" -mtime +30 -delete
```

## 总结

本运维手册涵盖了谦舍项目的日常运维、监控、备份、故障处理等各个方面。建议定期回顾和更新手册内容，确保与实际运维实践保持一致。

**关键要点**:

1. 建立完善的监控体系，及时发现异常
2. 制定规范的备份策略，确保数据安全
3. 建立快速响应机制，减少故障影响
4. 定期进行性能优化和安全加固
5. 保持文档更新，支持团队协作

通过遵循本手册的指导，可以确保谦舍项目的稳定运行和持续改进。
