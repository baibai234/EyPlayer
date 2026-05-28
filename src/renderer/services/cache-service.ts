import { useSettingsStore } from '@/stores/settings'

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function getExtFromUrl(url: string): string {
  const match = url.match(/\.(jpe?g|png|webp|gif)/i)
  return match ? match[0] : '.jpg'
}

function getCacheDir(): string {
  const settings = useSettingsStore()
  if (settings.cacheDir) return settings.cacheDir
  // 默认路径：用户目录下的 .eyplayer/cache
  return ''
}

function getFilePath(url: string): string {
  const dir = getCacheDir()
  const hash = hashString(url)
  const ext = getExtFromUrl(url)
  if (dir) {
    return `${dir}\\${hash}${ext}`
  }
  // 无自定义目录时不缓存
  return ''
}

async function downloadAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // 去掉 data:image/...;base64, 前缀
        const base64 = result.split(',')[1]
        resolve(base64 || null)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function getCachedImage(url: string): Promise<string | null> {
  if (!url || !window.electronAPI) return null

  const filePath = getFilePath(url)
  if (!filePath) return null

  // 检查缓存是否存在
  const exists = await window.electronAPI.cacheExists(filePath)
  if (exists) {
    // 读取缓存
    const result = await window.electronAPI.cacheRead(filePath)
    if (result.success && result.data) {
      // 从 URL 推断 MIME 类型
      const ext = getExtFromUrl(url)
      const mime = ext.includes('png') ? 'image/png' : ext.includes('webp') ? 'image/webp' : 'image/jpeg'
      return `data:${mime};base64,${result.data}`
    }
  }

  // 缓存不存在，下载并保存
  const base64 = await downloadAsBase64(url)
  if (base64) {
    await window.electronAPI.cacheWrite(filePath, base64)
  }

  return base64 ? `data:image/jpeg;base64,${base64}` : null
}

export async function clearImageCache(): Promise<void> {
  const dir = getCacheDir()
  if (dir && window.electronAPI) {
    await window.electronAPI.cacheClear(dir)
  }
}
