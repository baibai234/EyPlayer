# EyPlayer 项目指引

## 项目概述

**EyPlayer** 是一款 Windows 桌面端轻量级 Emby 媒体库管理与播放软件，专注于美观的媒体展示和流畅的本地播放器调用体验。

- **技术栈**: Electron + Vue 3 + Vite + TypeScript
- **开发工具**: VS Code + Claude Code 插件
- **运行环境**: Windows 10/11 64位

---

## 文档导航

### 核心文档
- [项目计划](项目计划.txt) - 原始需求文档
- [开发需求](docs/开发需求.md) - 详细功能需求和验收标准
- [技术规范](docs/技术规范.md) - 技术栈、API、状态管理等规范
- [执行步骤](docs/执行步骤.md) - 开发阶段、任务清单、里程碑
- [代码规范](docs/代码规范.md) - 命名、格式、最佳实践

### 开发日志
- [开发日志](devlog/) - 记录开发进度、问题、决策

---

## 工作流程

### 1. 开发前
1. 阅读相关文档，理解需求
2. 查看开发日志，了解当前进度
3. 确认任务优先级和依赖关系

### 2. 开发中
1. 遵循代码规范
2. 及时更新开发日志
3. 遇到问题记录在日志中
4. 重要决策记录在日志中

### 3. 开发后
1. 更新开发日志，标记完成事项
2. 更新待办事项
3. 记录遇到的问题和解决方案

---

## 开发阶段

### 当前阶段：项目初始化（第1-2天）
**目标**：搭建开发环境，创建基础项目结构

**任务清单**：
- [ ] 安装 Node.js 和 npm
- [ ] 使用 Vite 创建 Vue 3 项目
- [ ] 配置 Electron 环境
- [ ] 设置项目目录结构
- [ ] 配置开发工具（ESLint、Prettier）

**验收标准**：
- 项目能够正常启动
- 开发环境配置完成
- 基础目录结构建立

---

## 代码规范摘要

### 命名规范
- **文件命名**: 组件 PascalCase, 工具 camelCase, 样式 kebab-case
- **变量命名**: camelCase, 常量 UPPER_SNAKE_CASE, 布尔 is/has/can 开头
- **函数命名**: camelCase, 事件 handle/on 开头, 获取 get/fetch 开头
- **组件命名**: PascalCase, Props camelCase, Events kebab-case

### 代码风格
- 使用 2 空格缩进
- 每行不超过 100 字符
- 使用单引号
- 不使用分号
- 运算符两侧加空格

### TypeScript
- 优先使用 const
- 使用 interface 定义对象类型
- 使用 type 定义联合类型
- 避免使用 any
- 使用泛型提高复用性

### Vue 3
- 使用 Composition API
- 使用 <script setup> 语法
- Props 使用 TypeScript 定义
- Emits 使用 TypeScript 定义
- 样式使用 scoped

---

## 技术栈说明

### 前端框架
- **Vue 3**: 使用 Composition API
- **TypeScript**: 类型安全
- **Vite**: 快速构建

### 桌面框架
- **Electron**: 跨平台桌面应用
- **IPC**: 主进程与渲染进程通信

### 状态管理
- **Pinia**: Vue 3 官方状态管理

### 代码规范
- **ESLint**: 代码检查
- **Prettier**: 代码格式化

---

## 项目结构

```
EyPlayer/
├── src/                          # 源代码
│   ├── main/                     # Electron 主进程
│   ├── preload/                  # 预加载脚本
│   └── renderer/                 # 渲染进程 (Vue应用)
│       ├── components/           # 公共组件
│       ├── views/                # 页面视图
│       ├── composables/          # 组合式函数
│       ├── stores/               # 状态管理
│       ├── services/             # 服务层
│       ├── utils/                # 工具函数
│       └── types/                # TypeScript类型
├── resources/                    # 应用资源
├── devlog/                       # 开发日志
├── docs/                         # 项目文档
├── dist/                         # 构建输出
├── release/                      # 发布包
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript配置
├── vite.config.ts                # Vite配置
└── CLAUDE.md                     # Claude Code工作指引
```

---

## 开发日志使用说明

### 日志位置
- 日志文件位于 `devlog/` 目录
- 按日期命名，格式：`YYYY-MM-DD.md`

### 日志内容
```markdown
# 开发日志 - YYYY年MM月DD日

## 今日工作

### 已完成事项
- [x] 任务1
- [x] 任务2

### 待办事项
- [ ] 任务3
- [ ] 任务4

### 遇到的问题
- 问题描述
- 解决方案

### 重要决策
- 决策内容
- 决策原因

### 学习笔记
- 学到的知识点
```

### 更新频率
- 每天至少更新一次
- 完成重要任务后立即更新
- 遇到问题时及时记录

---

## 常用命令

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### Git 命令
```bash
# 查看状态
git status

# 添加文件
git add .

# 提交更改
git commit -m "feat: 添加新功能"

# 推送代码
git push
```

---

## 注意事项

### 开发注意
1. 遵循代码规范
2. 及时更新文档
3. 遇到问题及时记录
4. 重要决策需要记录原因

### 提交规范
- 使用规范的提交信息
- 一个提交只做一件事
- 提交前检查代码质量

### 文档维护
- 代码变更时同步更新文档
- 新功能需要添加使用说明
- API 变更需要更新技术文档

---

## 联系与反馈

### 问题反馈
- 记录在开发日志中
- 描述问题现象
- 记录解决方案

### 改进建议
- 记录在开发日志中
- 说明改进原因
- 预期改进效果

---

## 更新记录

### 2026-05-27
- 项目初始化
- 创建文档结构
- 创建开发日志文件夹
- 创建 CLAUDE.md 工作指引
