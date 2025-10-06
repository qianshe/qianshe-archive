-- 个人博客系统数据库 Schema
-- 支持博客文章、项目作品集、评论系统、用户管理、访问统计

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'blog', -- 'blog'/'project'/'announcement'
  tags TEXT, -- JSON数组存储标签
  content TEXT NOT NULL, -- Markdown内容
  excerpt TEXT, -- 文章摘要
  cover_image TEXT,
  author_id INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'draft', -- 'draft'/'published'/'archived'
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
  parent_id INTEGER, -- 支持嵌套回复
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_website TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- 邮箱验证状态
  is_approved BOOLEAN DEFAULT TRUE, -- 审核状态
  like_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  nickname TEXT NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user', -- 'admin'/'user'/'moderator'
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at DATETIME,
  login_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- 详细描述
  tags TEXT, -- JSON数组存储技术栈
  cover_image TEXT,
  screenshots TEXT, -- JSON数组存储截图
  github_url TEXT,
  demo_url TEXT,
  documentation_url TEXT,
  download_url TEXT,
  status TEXT DEFAULT 'active', -- 'active'/'archived'/'draft'
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
  event_type TEXT DEFAULT 'page_view', -- 'page_view'/'event'/'conversion'
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop'/'mobile'/'tablet'
  browser TEXT,
  os TEXT,
  session_id TEXT,
  user_id INTEGER, -- 关联用户ID（如果用户已登录）
  visit_duration INTEGER, -- 访问时长（秒）
  is_bounce BOOLEAN DEFAULT FALSE, -- 是否跳出访问
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  type TEXT DEFAULT 'string', -- 'string'/'number'/'boolean'/'json'
  is_public BOOLEAN DEFAULT FALSE, -- 是否可以被前端访问
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱验证码表
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'comment'/'register'/'reset_password'
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
  category TEXT DEFAULT 'friend', -- 'friend'/'resource'/'tool'
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

-- 评论表索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- 项目表索引
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- 统计表索引
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_page_url ON analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);
CREATE INDEX IF NOT EXISTS idx_analytics_referrer ON analytics(referrer);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);

-- 邮箱验证表索引
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- 上传文件表索引
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);

-- 友情链接表索引
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_sort_order ON links(sort_order);