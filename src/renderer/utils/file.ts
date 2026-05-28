// 文件相关工具函数

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.substring(lastDot + 1).toLowerCase()
}

// 获取文件名（不含扩展名）
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return filename
  return filename.substring(0, lastDot)
}

// 检查是否是视频文件
export function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'm4v', 'mpg', 'mpeg', '3gp', 'ts', 'strm'
  ]
  const ext = getFileExtension(filename)
  return videoExtensions.includes(ext)
}

// 检查是否是STRM文件
export function isStrmFile(filename: string): boolean {
  return getFileExtension(filename) === 'strm'
}

// 检查是否是图片文件
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const ext = getFileExtension(filename)
  return imageExtensions.includes(ext)
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 路径拼接
export function joinPath(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/[\/\\]$/, '')
      }
      if (index === parts.length - 1) {
        return part.replace(/^[\/\\]/, '')
      }
      return part.replace(/^[\/\\]|[\/\\]$/g, '')
    })
    .filter(Boolean)
    .join('/')
}

// 获取目录路径
export function getDirectoryPath(filePath: string): string {
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  if (lastSlash === -1) return ''
  return filePath.substring(0, lastSlash)
}

// 获取文件名
export function getFileName(filePath: string): string {
  const lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  if (lastSlash === -1) return filePath
  return filePath.substring(lastSlash + 1)
}

// 检查路径是否是绝对路径
export function isAbsolutePath(path: string): boolean {
  return /^[a-zA-Z]:\\/.test(path) || /^\\\\/.test(path) || /^\//.test(path)
}

// 规范化路径
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}
