-- 示例数据种子文件
-- 创建时间: 2025-01-06
-- 描述: 插入示例数据用于开发和测试

-- 插入示例博客文章
INSERT OR IGNORE INTO posts (title, slug, category, tags, content, excerpt, author_id, status, is_featured, published_at) VALUES
('欢迎来到谦舍', 'welcome-to-qianshe', 'blog', '["欢迎", "介绍", "开始"]', '# 欢迎来到谦舍\n\n谦者，德之柄也；舍者，义之本也。\n\n这是我的个人博客和作品集，记录技术学习、生活感悟和项目作品。\n\n## 关于这个名字\n\n"谦舍"这个名字取自古人的智慧：\n- **谦**：谦虚、谦逊，是一种美德\n- **舍**：舍弃、放下，是一种境界\n\n在这里，我将分享：\n- 技术学习和开发经验\n- 项目作品和设计思路\n- 生活感悟和思考\n\n希望这里的内容能对你有所启发。', '欢迎来到我的个人博客，这里将分享技术、生活和思考。', 1, 'published', TRUE, '2025-01-06 10:00:00'),

('我的技术栈', 'my-tech-stack', 'blog', '["技术栈", "前端", "后端", "工具"]', '# 我的技术栈\n\n## 前端技术\n- **React/Vue**: 现代前端框架\n- **TypeScript**: 类型安全的JavaScript\n- **Tailwind CSS**: 实用优先的CSS框架\n- **Vite**: 快速的构建工具\n\n## 后端技术\n- **Node.js**: JavaScript运行时\n- **Python**: 数据处理和自动化\n- **Cloudflare Workers**: 边缘计算\n- **D1**: 轻量级数据库\n\n## 工具和平台\n- **Git**: 版本控制\n- **Docker**: 容器化\n- **GitHub**: 代码托管\n- **VS Code**: 开发环境\n\n## 学习方向\n- 云原生和边缘计算\n- 人工智能和机器学习\n- 开源项目贡献\n- 系统架构设计\n\n持续学习，保持好奇心。', '分享我在前端、后端和工具方面的技术栈选择。', 1, 'published', TRUE, '2025-01-05 15:30:00'),

('如何构建个人博客系统', 'build-personal-blog-system', 'blog', '["博客", "系统设计", "Cloudflare", "D1"]', '# 如何构建个人博客系统\n\n## 技术选型\n\n### 前端\n- **React/Vite**: 现代前端开发体验\n- **Tailwind CSS**: 快速样式开发\n- **TypeScript**: 类型安全\n\n### 后端\n- **Cloudflare Workers**: 全球边缘计算\n- **D1 Database**: 无服务器数据库\n- **R2 Storage**: 文件存储\n\n## 架构设计\n\n### 双Worker架构\n1. **Portfolio Worker**: 公开API和数据展示\n2. **Dashboard Worker**: 管理API和后台操作\n\n### 数据库设计\n- **posts**: 文章和项目\n- **comments**: 评论系统\n- **users**: 用户管理\n- **analytics**: 访问统计\n\n## 开发流程\n\n1. 数据库Schema设计\n2. API接口定义\n3. 前端组件开发\n4. 部署和优化\n\n## 性能优化\n\n- **缓存策略**: 边缘缓存\n- **CDN加速**: 全球分发\n- **图片优化**: WebP格式\n- **代码分割**: 按需加载\n\n通过这个项目，我学习了全栈开发和云原生部署。', '详细介绍个人博客系统的技术选型、架构设计和开发流程。', 1, 'published', FALSE, '2025-01-04 20:00:00');

-- 插入示例项目
INSERT OR IGNORE INTO projects (title, slug, description, content, tags, github_url, demo_url, status, is_featured, sort_order, star_count, fork_count) VALUES
('谦舍博客系统', 'qianshe-blog-system', '基于Cloudflare Workers的个人博客和作品集系统', '这是一个现代化的个人博客系统，采用双Worker架构，支持博客文章、项目展示、评论系统等功能。\n\n## 技术特点\n- 双Worker架构设计\n- 共享数据库支持\n- 边缘计算优化\n- 响应式设计\n- 现代化UI/UX\n\n## 核心功能\n- 博客文章管理\n- 项目作品展示\n- 评论互动系统\n- 访问统计分析\n- 后台管理界面', '["Cloudflare Workers", "D1", "React", "TypeScript", "Tailwind CSS"]', 'https://github.com/qianshe/blog-system', 'https://blog.qianshe.top', 'active', TRUE, 1, 128, 32),

('智能代码助手', 'ai-code-assistant', '基于AI的智能代码生成和辅助工具', '一个帮助开发者提高编码效率的AI工具，支持代码生成、重构建议、bug检测等功能。\n\n## 主要功能\n- 智能代码补全\n- 代码重构建议\n- Bug检测和修复\n- 文档自动生成\n- 多语言支持', '["AI", "代码生成", "TypeScript", "React", "Node.js"]', 'https://github.com/qianshe/ai-code-assistant', 'https://code-assistant.qianshe.top', 'active', TRUE, 2, 256, 45),

('数据可视化平台', 'data-visualization-platform', '交互式数据可视化和分析平台', '一个功能强大的数据可视化平台，支持多种图表类型、实时数据更新和交互式分析。\n\n## 特性\n- 多种图表类型\n- 实时数据更新\n- 交互式分析\n- 自定义主题\n- 数据导出功能', '["D3.js", "React", "WebSocket", "Node.js", "MongoDB"]', 'https://github.com/qianshe/data-viz', 'https://viz.qianshe.top', 'active', FALSE, 3, 89, 12);

-- 插入示例评论
INSERT OR IGNORE INTO comments (post_id, user_name, user_email, content, is_approved, created_at) VALUES
(1, '访客', 'visitor@example.com', '欢迎！期待看到更多精彩内容。', TRUE, '2025-01-06 12:00:00'),
(1, '技术爱好者', 'tech@example.com', '这个名字很有意境，技术栈也很现代。加油！', TRUE, '2025-01-06 14:30:00'),
(2, '前端开发者', 'frontend@example.com', '技术栈选择很不错，Cloudflare Workers确实是未来的趋势。', TRUE, '2025-01-05 18:00:00'),
(3, '全栈工程师', 'fullstack@example.com', '双Worker架构的设计很有意思，请问是如何处理数据库共享的？', TRUE, '2025-01-04 22:00:00');

-- 插入示例友情链接
INSERT OR IGNORE INTO links (name, url, description, avatar_url, category, sort_order, is_active) VALUES
('Cloudflare', 'https://www.cloudflare.com', '全球领先的云服务平台', 'https://www.cloudflare.com/favicon.ico', 'tool', 1, TRUE),
('GitHub', 'https://github.com', '全球最大的代码托管平台', 'https://github.com/favicon.ico', 'tool', 2, TRUE),
('MDN Web Docs', 'https://developer.mozilla.org', 'Web技术权威文档', 'https://developer.mozilla.org/favicon.ico', 'resource', 3, TRUE),
('TypeScript', 'https://www.typescriptlang.org', 'JavaScript的超集，提供静态类型', 'https://www.typescriptlang.org/favicon.ico', 'resource', 4, TRUE);

-- 更新文章评论数
UPDATE posts SET comment_count = (
  SELECT COUNT(*) FROM comments 
  WHERE comments.post_id = posts.id AND comments.is_approved = TRUE
);

-- 更新文章浏览量（模拟数据）
UPDATE posts SET view_count = 
  CASE 
    WHEN id = 1 THEN 1250
    WHEN id = 2 THEN 856
    WHEN id = 3 THEN 642
    ELSE 0
  END;

-- 更新项目点赞数（模拟数据）
UPDATE posts SET like_count = 
  CASE 
    WHEN id = 1 THEN 86
    WHEN id = 2 THEN 52
    WHEN id = 3 THEN 38
    ELSE 0
  END;