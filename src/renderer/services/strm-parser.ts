export interface StrmContent {
  url: string
  type: 'url' | 'file' | 'unknown'
  protocol?: string
}

export class StrmParser {
  // 解析STRM文件内容
  static parse(content: string): StrmContent {
    const trimmed = content.trim()

    if (!trimmed) {
      return { url: '', type: 'unknown' }
    }

    // 检查是否是URL
    if (this.isUrl(trimmed)) {
      return {
        url: trimmed,
        type: 'url',
        protocol: this.getProtocol(trimmed)
      }
    }

    // 检查是否是本地文件路径
    if (this.isFilePath(trimmed)) {
      return {
        url: trimmed,
        type: 'file'
      }
    }

    // 尝试提取URL
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      return {
        url: urlMatch[0],
        type: 'url',
        protocol: this.getProtocol(urlMatch[0])
      }
    }

    return { url: trimmed, type: 'unknown' }
  }

  // 检查是否是URL
  private static isUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  // 检查是否是文件路径
  private static isFilePath(str: string): boolean {
    // Windows路径
    if (/^[a-zA-Z]:\\/.test(str)) return true
    // UNC路径
    if (/^\\\\/.test(str)) return true
    // Unix路径
    if (/^\//.test(str)) return true

    return false
  }

  // 获取协议
  private static getProtocol(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.protocol.replace(':', '')
    } catch {
      return 'unknown'
    }
  }

  // 从STRM文件提取播放地址
  static extractPlaybackUrl(content: string): string {
    const parsed = this.parse(content)
    return parsed.url
  }

  // 检查是否支持的协议
  static isSupportedProtocol(protocol: string): boolean {
    const supported = ['http', 'https', 'rtmp', 'rtsp', 'file']
    return supported.includes(protocol.toLowerCase())
  }

  // 获取协议显示名称
  static getProtocolDisplayName(protocol: string): string {
    const names: Record<string, string> = {
      http: 'HTTP',
      https: 'HTTPS',
      rtmp: 'RTMP',
      rtsp: 'RTSP',
      file: '本地文件'
    }
    return names[protocol.toLowerCase()] || protocol.toUpperCase()
  }

  // 验证STRM内容
  static validate(content: string): { valid: boolean; error?: string } {
    const parsed = this.parse(content)

    if (!parsed.url) {
      return { valid: false, error: '内容为空' }
    }

    if (parsed.type === 'unknown') {
      return { valid: false, error: '无法识别的格式' }
    }

    if (parsed.type === 'url' && parsed.protocol && !this.isSupportedProtocol(parsed.protocol)) {
      return { valid: false, error: `不支持的协议: ${parsed.protocol}` }
    }

    return { valid: true }
  }

  // 格式化URL用于显示
  static formatForDisplay(url: string): string {
    if (url.length > 50) {
      return url.substring(0, 47) + '...'
    }
    return url
  }
}
