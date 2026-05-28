// 应用常量

// 应用信息
export const APP_NAME = 'EyPlayer'
export const APP_VERSION = '0.1.0'
export const APP_DESCRIPTION = '一款轻量级 Emby 媒体库管理与播放软件'

// Emby API
export const EMBY_API_TIMEOUT = 30000 // 30秒
export const EMBY_API_RETRY_COUNT = 3
export const EMBY_API_RETRY_DELAY = 1000 // 1秒

// 播放器
export const DEFAULT_PLAYER = 'mpv'
export const SUPPORTED_PLAYERS = ['mpv', 'potplayer', 'vlc'] as const

// 缓存
export const DEFAULT_CACHE_SIZE = 500 * 1024 * 1024 // 500MB
export const MAX_CACHE_SIZE = 10 * 1024 * 1024 * 1024 // 10GB
export const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000 // 7天

// 媒体类型
export const MEDIA_TYPES = {
  MOVIE: 'Movie',
  SERIES: 'Series',
  EPISODE: 'Episode',
  AUDIO: 'Audio',
  BOOK: 'Book'
} as const

// 排序选项
export const SORT_OPTIONS = [
  { value: 'SortName', label: '名称' },
  { value: 'DateCreated', label: '添加时间' },
  { value: 'PremiereDate', label: '上映时间' },
  { value: 'CommunityRating', label: '评分' },
  { value: 'Runtime', label: '时长' }
] as const

// 排序顺序
export const SORT_ORDERS = [
  { value: 'Ascending', label: '升序' },
  { value: 'Descending', label: '降序' }
] as const

// 主题
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

// 马卡龙配色
export const MACAROON_COLORS = [
  { name: '浅粉', value: '#FFB5B5' },
  { name: '浅蓝', value: '#B5D8FF' },
  { name: '浅绿', value: '#B5FFB5' },
  { name: '浅紫', value: '#D8B5FF' },
  { name: '米黄', value: '#FFE5B5' }
] as const

// 圆角大小
export const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24
} as const

// 间距
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32
} as const

// 阴影
export const SHADOWS = {
  SM: '0 2px 4px rgba(0, 0, 0, 0.1)',
  MD: '0 4px 8px rgba(0, 0, 0, 0.1)',
  LG: '0 8px 16px rgba(0, 0, 0, 0.1)'
} as const

// 动画时长
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500
} as const

// 断点
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
} as const

// 存储键
export const STORAGE_KEYS = {
  SETTINGS: 'eyplayer-settings',
  CACHE_INDEX: 'eyplayer-cache-index',
  SERVER_CONFIG: 'eyplayer-server-config',
  PLAYER_CONFIG: 'eyplayer-player-config',
  THEME: 'eyplayer-theme'
} as const

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  AUTH_ERROR: '认证失败，请检查服务器配置',
  PLAYER_ERROR: '播放器启动失败，请检查播放器安装',
  CACHE_ERROR: '缓存操作失败，请尝试清理缓存',
  UNKNOWN_ERROR: '发生未知错误，请稍后重试'
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  CONNECTED: '服务器连接成功',
  SAVED: '设置已保存',
  CACHE_CLEARED: '缓存已清理',
  PLAYER_STARTED: '播放器已启动'
} as const
