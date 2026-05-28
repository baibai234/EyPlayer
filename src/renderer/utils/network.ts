// 网络相关工具函数

// 检查URL是否有效
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 获取URL的域名
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return ''
  }
}

// 获取URL的协议
export function getProtocol(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.protocol.replace(':', '')
  } catch {
    return ''
  }
}

// 检查是否是本地地址
export function isLocalhost(url: string): boolean {
  const domain = getDomain(url)
  return domain === 'localhost' || domain === '127.0.0.1' || domain === '::1'
}

// 检查是否是内网地址
export function isPrivateNetwork(url: string): boolean {
  const domain = getDomain(url)

  // 10.x.x.x
  if (/^10\./.test(domain)) return true
  // 172.16-31.x.x
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(domain)) return true
  // 192.168.x.x
  if (/^192\.168\./.test(domain)) return true

  return false
}

// 构建URL
export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, base)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  return url.toString()
}

// 解析URL参数
export function parseUrlParams(url: string): Record<string, string> {
  try {
    const parsed = new URL(url)
    const params: Record<string, string> = {}

    parsed.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return params
  } catch {
    return {}
  }
}

// 添加URL参数
export function addUrlParams(url: string, params: Record<string, string>): string {
  try {
    const parsed = new URL(url)

    Object.entries(params).forEach(([key, value]) => {
      parsed.searchParams.append(key, value)
    })

    return parsed.toString()
  } catch {
    return url
  }
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试函数
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt)
      }
    }
  }

  throw lastError
}

// 超时函数
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ])
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
