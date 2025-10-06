# Monorepo 迁移脚本
# 用于将独立的 dashboard 和 portfolio 仓库迁移到 monorepo

param(
    [Parameter(Mandatory=$false)]
    [string]$NewRepoUrl = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$KeepHistory = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n===================================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "===================================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Confirm-Action {
    param([string]$Message)
    if ($DryRun) {
        Write-Warning "[DRY RUN] 将执行: $Message"
        return $true
    }
    $response = Read-Host "$Message (y/N)"
    return $response -eq "y" -or $response -eq "Y"
}

# 检查当前目录
Write-Step "检查当前环境"

if (-not (Test-Path "dashboard")) {
    Write-Error "找不到 dashboard 目录"
    exit 1
}

if (-not (Test-Path "portfolio")) {
    Write-Error "找不到 portfolio 目录"
    exit 1
}

Write-Success "找到 dashboard 和 portfolio 目录"

# 检查是否已经是 git 仓库
if (Test-Path ".git") {
    Write-Error "根目录已经是 Git 仓库，请先删除 .git 文件夹或使用其他方式迁移"
    exit 1
}

# 检查子目录的 Git 仓库
$dashboardGit = Test-Path "dashboard\.git"
$portfolioGit = Test-Path "portfolio\.git"

Write-Host "Dashboard Git 仓库: $dashboardGit"
Write-Host "Portfolio Git 仓库: $portfolioGit"

# 方案选择
if ($KeepHistory) {
    Write-Step "方案 1: 保留 Git 历史记录（高级）"
    Write-Warning "这个方案需要手动操作，请参考文档"
    Write-Host @"
    
请按照以下步骤操作：

1. 使用 git subtree 或 git filter-repo
2. 参考 migrate-to-monorepo.md 文档

"@
    exit 0
}

# 方案 2: 全新开始
Write-Step "方案 2: 全新开始（简单）"

if (-not (Confirm-Action "是否要删除子项目的 .git 文件夹？")) {
    Write-Warning "操作已取消"
    exit 0
}

# 备份提醒
Write-Warning "强烈建议在操作前备份整个目录！"
if (-not (Confirm-Action "是否已经备份？")) {
    Write-Warning "请先备份，然后重新运行脚本"
    exit 0
}

# 删除子项目的 .git
Write-Step "删除子项目的 Git 信息"

if ($dashboardGit) {
    if ($DryRun) {
        Write-Warning "[DRY RUN] 将删除 dashboard\.git"
    } else {
        Remove-Item -Path "dashboard\.git" -Recurse -Force
        Write-Success "已删除 dashboard\.git"
    }
}

if ($portfolioGit) {
    if ($DryRun) {
        Write-Warning "[DRY RUN] 将删除 portfolio\.git"
    } else {
        Remove-Item -Path "portfolio\.git" -Recurse -Force
        Write-Success "已删除 portfolio\.git"
    }
}

# 初始化新仓库
Write-Step "初始化 Monorepo"

if ($DryRun) {
    Write-Warning "[DRY RUN] 将执行 git init"
} else {
    git init
    Write-Success "Git 仓库已初始化"
}

# 添加文件
Write-Step "添加文件到 Git"

if ($DryRun) {
    Write-Warning "[DRY RUN] 将执行 git add ."
} else {
    git add .
    Write-Success "文件已添加到暂存区"
}

# 提交
$commitMessage = @"
chore: initial monorepo setup

- Integrated dashboard and portfolio projects
- Shared types structure
- Unified build and deployment scripts
- ESLint and TypeScript configuration

Migrated from:
- git@github.com:qianshe/dashboard-qianshe.git
- git@github.com:qianshe/portfolio-qianshe.git
"@

if ($DryRun) {
    Write-Warning "[DRY RUN] 将创建首次提交"
    Write-Host $commitMessage
} else {
    git commit -m $commitMessage
    Write-Success "首次提交已创建"
}

# 连接远程仓库
if ($NewRepoUrl) {
    Write-Step "连接到远程仓库"
    
    if ($DryRun) {
        Write-Warning "[DRY RUN] 将执行 git remote add origin $NewRepoUrl"
    } else {
        git remote add origin $NewRepoUrl
        git branch -M main
        Write-Success "远程仓库已配置"
        
        if (Confirm-Action "是否立即推送到远程仓库？") {
            git push -u origin main
            Write-Success "代码已推送到远程仓库"
        }
    }
}

# 完成
Write-Step "迁移完成！"

Write-Host @"

✨ Monorepo 迁移成功！

接下来的步骤：

1. 检查文件是否正确
   git status
   git log

2. 如果使用 pnpm workspaces，创建 pnpm-workspace.yaml

3. 更新 package.json 中的 workspaces 配置

4. 在 GitHub 上处理旧仓库：
   - dashboard-qianshe: 建议归档（Archive）
   - portfolio-qianshe: 建议归档（Archive）

5. 测试构建和部署：
   npm run build:all
   npm run deploy:all

"@ -ForegroundColor Green
