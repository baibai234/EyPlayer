# EyPlayer

> 我是一个代码小白，这是我用 Claude 制作的一个 Windows 端 Emby 服务器挂载播放器，基本功能已经实现，但是可能里面还有一些问题。

一款 Windows 桌面端轻量级 Emby 媒体库管理与播放软件，专注于美观的媒体展示和流畅的本地播放器调用体验。

## 主要功能

- **Emby 服务器连接** - 支持连接 Emby 服务器，自动获取媒体库内容
- **媒体库浏览** - 按分类浏览电影、电视剧、合集，支持海报网格展示
- **智能搜索** - 全库搜索影视资源，快速定位内容
- **电视剧选集** - 支持季/集切换，查看播放进度，点击直接播放
- **本地播放器调用** - 支持 MPV、PotPlayer、VLC 三种播放器，可自定义安装路径
- **播放进度同步** - MPV 播放器通过 IPC 协议实时同步播放进度到 Emby 服务器
- **继续观看** - 自动记录播放历史，首页和在看页显示播放进度
- **收藏管理** - 支持收藏/取消收藏影视资源
- **海报缓存** - 海报图片本地磁盘缓存，加速加载
- **iOS 风格界面** - 毛玻璃效果、圆角设计、柔和配色、5 种马卡龙主题
- **无边框窗口** - 自定义标题栏，窗口圆角设计
- **自定义播放器路径** - 设置页面可浏览选择播放器安装位置
- **硬件解码** - 支持开启/关闭硬件解码优化

## 下载安装

前往 [Releases](../../releases) 页面下载最新版本：

| 文件 | 说明 |
|------|------|
| `EyPlayer Setup x.x.x.exe` | 安装版，双击运行安装向导 |
| `EyPlayer-x.x.x-win-x64.zip` | 便携版，解压后直接运行 `EyPlayer.exe` |

**系统要求**: Windows 10/11 64位

## 使用说明

1. 启动应用后进入设置页面
2. 输入 Emby 服务器地址、用户名和密码，点击连接
3. 连接成功后自动跳转到首页，显示媒体库内容
4. 点击海报进入详情页，点击播放按钮调用本地播放器
5. 在设置中可切换播放器类型、配置播放器路径、选择主题

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5 | 前端框架（Composition API） |
| Electron | 28.x | 桌面应用框架 |
| TypeScript | 6.0 | 类型安全 |
| Vite | 8.0 | 构建工具 |
| Pinia | 2.1 | 状态管理 |
| Vue Router | 4.2 | 路由管理 |

## 项目结构

```
src/
├── main/                    # Electron 主进程
│   └── index.ts             # 窗口管理、IPC 通信、播放器调用、Emby API 代理
├── preload/                 # 预加载脚本（安全桥接）
│   └── index.ts             # 暴露安全 API 给渲染进程
└── renderer/                # Vue 渲染进程
    ├── components/          # 可复用组件
    │   ├── common/          # Loading、Error 通用组件
    │   ├── layout/          # Navbar 导航栏
    │   └── media/           # Carousel 轮播、MediaCard 海报卡片、MediaList 列表
    ├── views/               # 页面视图
    │   ├── Home.vue         # 首页（轮播 + 媒体库分类）
    │   ├── Media.vue        # 媒体库（分类浏览 + 无限滚动）
    │   ├── Detail.vue       # 影视详情（季集列表 + 演员 + 播放）
    │   ├── Watching.vue     # 继续观看（播放记录 + 进度）
    │   ├── Search.vue       # 搜索页
    │   └── Settings.vue     # 设置页（服务器 + 播放器 + 主题 + 缓存）
    ├── stores/              # Pinia 状态管理
    │   ├── emby.ts          # Emby 数据（媒体库、搜索、收藏、进度上报）
    │   ├── player.ts        # 播放器状态（mpv IPC 进度同步）
    │   └── settings.ts      # 应用设置（持久化到 localStorage）
    ├── services/            # 服务层
    │   ├── emby-api.ts      # Emby REST API 封装
    │   ├── cache-service.ts # 海报磁盘缓存
    │   └── player-service.ts # 播放器检测服务
    ├── types/               # TypeScript 类型定义
    └── composables/         # Vue 组合式函数
```

## 开发指南

### 环境要求

- Node.js 18+
- npm
- Windows 10/11（构建打包需要）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# Electron 开发模式（热重载）
npm run electron:dev
```

### 构建打包

```bash
# 构建 + 打包 Windows 安装程序
npm run electron:build
```

输出文件在 `release/` 目录下。

### 代码规范

```bash
npm run lint      # ESLint 检查
npm run format    # Prettier 格式化
```

## 已知问题

- 仅支持 Windows 平台
- MPV 播放器需要安装并配置路径才能使用进度同步
- 非 MPV 播放器（PotPlayer/VLC）的进度同步基于时间估算，不够精确

## 许可证

[MIT License](LICENSE)
