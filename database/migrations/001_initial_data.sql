-- 初始化数据库基础数据
-- 插入默认管理员用户
INSERT OR IGNORE INTO users (email, username, nickname, password_hash, role, is_active, email_verified)
VALUES (
  'admin@qianshe.top',
  'admin',
  'Administrator',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJflHQrxG', -- password: admin123
  'admin',
  TRUE,
  TRUE
);

-- 插入系统基础配置
INSERT OR IGNORE INTO settings (key, value, description, type, is_public)
VALUES
  ('site_title', '谦舍', '网站标题', 'string', TRUE),
  ('site_description', '个人博客与作品集', '网站描述', 'string', TRUE),
  ('site_keywords', '博客,作品集,技术,编程', '网站关键词', 'string', TRUE),
  ('site_author', 'qainshe', '网站作者', 'string', TRUE),
  ('posts_per_page', '10', '每页文章数量', 'number', TRUE),
  ('comments_require_approval', 'true', '评论需要审核', 'boolean', FALSE),
  ('allow_registrations', 'false', '允许用户注册', 'boolean', FALSE),
  ('analytics_enabled', 'true', '启用访问统计', 'boolean', FALSE);

-- 插入示例友情链接
INSERT OR IGNORE INTO links (name, url, description, category, sort_order, is_active)
VALUES
  ('GitHub', 'https://github.com', '代码托管平台', 'tool', 1, TRUE),
  ('Cloudflare', 'https://cloudflare.com', '云服务平台', 'tool', 2, TRUE);