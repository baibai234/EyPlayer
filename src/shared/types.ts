// 共享类型定义

// 应用状态
export type AppStatus = 'idle' | 'loading' | 'error' | 'success'

// 主题类型
export type Theme = 'light' | 'dark' | 'system'

// 播放器类型
export type PlayerType = 'mpv' | 'potplayer' | 'vlc'

// 媒体类型
export type MediaType = 'Movie' | 'Series' | 'Episode' | 'Audio' | 'Book'

// 排序方式
export type SortBy = 'SortName' | 'DateCreated' | 'PremiereDate' | 'CommunityRating' | 'Runtime'

// 排序顺序
export type SortOrder = 'Ascending' | 'Descending'

// 通用响应
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 通用ID
export type ID = string | number

// 通用时间戳
export type Timestamp = string | Date

// 通用回调函数
export type Callback<T = void> = (data: T) => void

// 通用异步回调函数
export type AsyncCallback<T = void> = (data: T) => Promise<void>

// 通用事件处理器
export type EventHandler<T = void> = (event: T) => void

// 通用选项
export interface Option {
  label: string
  value: string | number
  disabled?: boolean
}

// 通用配置
export interface Config {
  [key: string]: any
}

// 通用元数据
export interface Metadata {
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: string
  updatedBy?: string
}

// 通用状态
export interface State {
  loading: boolean
  error: string | null
  success: boolean
}

// 通用操作结果
export interface OperationResult {
  success: boolean
  message?: string
  data?: any
}

// 通用验证结果
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

// 通用文件信息
export interface FileInfo {
  name: string
  path: string
  size: number
  type: string
  lastModified: Timestamp
}

// 通用目录信息
export interface DirectoryInfo {
  name: string
  path: string
  files: FileInfo[]
  directories: DirectoryInfo[]
}

// 通用网络请求配置
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

// 通用网络响应
export interface Response<T = any> {
  status: number
  statusText: string
  headers: Record<string, string>
  data: T
}

// 通用错误
export interface AppError {
  code: string
  message: string
  details?: any
  stack?: string
}

// 通用日志
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: Timestamp
  data?: any
}

// 通用缓存项
export interface CacheItem<T = any> {
  key: string
  value: T
  expiry: Timestamp
  size: number
}

// 通用统计
export interface Statistics {
  total: number
  success: number
  failed: number
  averageTime: number
}

// 通用图表数据
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }[]
}

// 通用表单字段
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea'
  value?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Option[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// 通用表单状态
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// 通用表格列
export interface TableColumn {
  key: string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, record: any) => any
}

// 通用表格状态
export interface TableState {
  data: any[]
  columns: TableColumn[]
  loading: boolean
  pagination: PaginationParams
  sort: {
    key: string
    order: SortOrder
  }
  filters: Record<string, any>
}

// 通用模态框状态
export interface ModalState {
  visible: boolean
  title: string
  content: any
  width?: number | string
  closable?: boolean
  maskClosable?: boolean
  onOk?: () => void
  onCancel?: () => void
}

// 通用通知类型
export type NotificationType = 'success' | 'info' | 'warning' | 'error'

// 通用通知
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  timestamp: Timestamp
}

// 通用菜单项
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  visible?: boolean
}

// 通用面包屑项
export interface BreadcrumbItem {
  title: string
  path?: string
  icon?: string
}

// 通用标签
export interface Tag {
  key: string
  label: string
  color?: string
  closable?: boolean
}

// 通用树节点
export interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
  isLeaf?: boolean
  icon?: string
  disabled?: boolean
  selectable?: boolean
}

// 通用步骤
export interface Step {
  title: string
  description?: string
  status: 'wait' | 'process' | 'finish' | 'error'
  icon?: string
}

// 通用时间线项
export interface TimelineItem {
  title: string
  content?: string
  timestamp: Timestamp
  color?: string
  icon?: string
}

// 通用评论
export interface Comment {
  id: string
  author: string
  avatar?: string
  content: string
  timestamp: Timestamp
  likes: number
  replies?: Comment[]
}

// 通用消息
export interface Message {
  id: string
  sender: string
  receiver: string
  content: string
  timestamp: Timestamp
  read: boolean
  type: 'text' | 'image' | 'file'
}

// 通用活动
export interface Activity {
  id: string
  user: string
  action: string
  target: string
  timestamp: Timestamp
  details?: any
}

// 通用统计项
export interface StatisticItem {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  icon?: string
  color?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

// 通用进度
export interface Progress {
  current: number
  total: number
  percentage: number
  status: 'active' | 'success' | 'exception' | 'normal'
}

// 通用倒计时
export interface Countdown {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

// 通用地理位置
export interface Location {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  timestamp: Timestamp
}

// 通用设备信息
export interface DeviceInfo {
  id: string
  name: string
  type: string
  os: string
  browser?: string
  ip?: string
  lastActive: Timestamp
}

// 通用用户信息
export interface UserInfo {
  id: string
  username: string
  email?: string
  avatar?: string
  role: string
  permissions: string[]
  lastLogin: Timestamp
}

// 通用权限
export interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
}

// 通用角色
export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
}

// 通用配置项
export interface ConfigItem {
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  description?: string
  required?: boolean
  defaultValue?: any
}

// 通用环境变量
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  API_URL: string
  APP_VERSION: string
  [key: string]: string
}
