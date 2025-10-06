# 代码规范 (Code Standards)

## 概述

本项目使用统一的代码规范配置，包括 ESLint 和 Prettier，确保代码风格一致性和质量。

## 配置文件

### ESLint 配置

- **文件**: `.eslintrc.json`
- **范围**: 整个项目（包括所有子项目）
- **规则集**: React + TypeScript 最佳实践

### Prettier 配置

- **文件**: `.prettierrc`
- **格式化规则**: 统一代码格式
- **忽略文件**: `.prettierignore`

## 使用方法

### 安装依赖

```bash
npm install
```

### 代码检查

```bash
# 检查所有文件
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### 代码格式化

```bash
# 格式化所有文件
npm run format

# 检查格式是否符合规范
npm run format:check
```

### 完整检查

```bash
# 同时运行 ESLint 和 Prettier 检查
npm run lint:all
```

## 规则说明

### ESLint 主要规则

- **TypeScript 严格模式**: 启用类型检查
- **React 规范**: Hooks 使用、组件最佳实践
- **代码质量**: 未使用变量、代码复杂度等
- **风格统一**: 引号、分号、缩进等

### Prettier 格式规则

- **单引号**: `singleQuote: true`
- **分号**: `semi: true`
- **行宽**: `printWidth: 100`
- **缩进**: `tabWidth: 2`，使用空格
- **尾逗号**: `trailingComma: "none"`

## IDE 集成

### VS Code 推荐插件

```json
{
  "recommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
}
```

### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 忽略规则

### ESLint 忽略

- 构建文件：`dist/`、`build/`
- 依赖目录：`node_modules/`
- 配置文件：`wrangler.toml`

### Prettier 忽略

- 配置文件：`package-lock.json`、`wrangler.toml`
- 构建输出：`dist/`、`static/`
- 环境文件：`.env*`

## Git Hooks（可选）

推荐使用 husky 在提交前自动检查代码：

```bash
# 安装 husky
npm install --save-dev husky

# 设置 pre-commit hook
npx husky add .husky/pre-commit "npm run lint:all"
```

## 故障排除

### 常见问题

1. **ESLint 无法找到 TypeScript 配置**
   - 确保安装了 `typescript` 依赖
   - 检查 `tsconfig.json` 是否存在

2. **Prettier 格式冲突**
   - 检查 `.prettierrc` 配置
   - 确保没有冲突的 VS Code 设置

3. **某些文件不想格式化**
   - 添加到 `.prettierignore`
   - 或使用 `// prettier-ignore` 注释

## 项目结构

```
qiansheArchive/
├── .eslintrc.json          # ESLint 配置
├── .prettierrc             # Prettier 配置
├── .prettierignore         # Prettier 忽略文件
├── package.json            # 根项目配置
├── portfolio/
│   ├── frontend/           # Portfolio 前端
│   └── worker/             # Portfolio Worker
└── dashboard/
    ├── frontend/           # Dashboard 前端
    └── worker/             # Dashboard Worker
```

## 更新配置

如需更新代码规范配置：

1. 修改 `.eslintrc.json` 或 `.prettierrc`
2. 更新 `package.json` 中的依赖版本
3. 运行 `npm run lint:all` 验证配置
4. 提交配置更改

---

统一的代码规范有助于提高代码质量和团队协作效率。请确保所有开发人员都遵循相同的规范。
