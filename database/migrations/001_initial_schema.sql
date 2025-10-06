-- 初始数据库Schema迁移
-- 创建时间: 2025-01-06
-- 描述: 创建个人博客系统的所有基础表

-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  nickname TEXT NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME,
  login_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'blog' CHECK (category IN ('blog', 'project', 'announcement')),
  tags TEXT, -- JSON数组存储标签
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_top BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  parent_id INTEGER,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_website TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  like_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  tags TEXT, -- JSON数组存储技术栈
  cover_image TEXT,
  screenshots TEXT, -- JSON数组存储截图
  github_url TEXT,
  demo_url TEXT,
  documentation_url TEXT,
  download_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_open_source BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  star_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 页面访问统计表
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  session_id TEXT,
  visit_duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  is_public BOOLEAN DEFAULT FALSE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱验证码表
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'register', 'reset_password')),
  is_used BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文件上传记录表
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 友情链接表
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  category TEXT DEFAULT 'friend' CHECK (category IN ('friend', 'resource', 'tool')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  click_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询性能

-- 文章表索引
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_email ON comments(user_email);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 项目表索引
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 统计表索引
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics(path);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ip_address ON analytics(ip_address);

-- 邮箱验证表索引
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_type ON email_verifications(type);

-- 上传文件表索引
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_uploads_is_public ON uploads(is_public);

-- 友情链接表索引
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);

-- 插入默认管理员用户（密码: admin123）
INSERT OR IGNORE INTO users (id, email, nickname, password_hash, role, is_active, email_verified)
VALUES (1, 'admin@qianshe.top', '管理员', '$2a$10$rOXQkZjEB5H8lE8D8C5E9.O9E9F8F8D8C5E9.O9E9F8F8D8C5E9.O9', 'admin', TRUE, TRUE);

-- 插入默认系统设置
INSERT OR IGNORE INTO settings (key, value, description, type, is_public) VALUES
('site_name', '谦舍', '网站名称', 'string', TRUE),
('site_description', '谦者，德之柄也；舍者，义之本也。', '网站描述', 'string', TRUE),
('site_keywords', '博客,作品集,技术,生活', '网站关键词', 'json', TRUE),
('site_author', 'qainshe', '网站作者', 'string', TRUE),
('posts_per_page', '10', '每页文章数量', 'number', TRUE),
('comments_require_approval', 'true', '评论需要审核', 'boolean', FALSE),
('allow_comments', 'true', '允许评论', 'boolean', TRUE),
('allow_registration', 'false', '允许用户注册', 'boolean', FALSE),
('maintenance_mode', 'false', '维护模式', 'boolean', FALSE),
('analytics_enabled', 'true', '启用访问统计', 'boolean', FALSE),
('theme_color', '#1f2937', '主题色', 'string', TRUE),
('footer_text', '© 2025 谦舍. All rights reserved.', '页脚文本', 'string', TRUE);