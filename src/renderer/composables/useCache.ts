import { ref, readonly } from 'vue'

interface CacheItem {
  key: string
  data: any
  timestamp: number
  size: number
}

export function useCache() {
  const cache = ref<Map<string, CacheItem>>(new Map())
  const totalSize = ref(0)
  const maxSize = ref(100 * 1024 * 1024) // 100MB

  // 获取缓存
  function get<T>(key: string): T | null {
    const item = cache.value.get(key)
    if (!item) return null

    // 检查是否过期（24小时）
    const now = Date.now()
    if (now - item.timestamp > 24 * 60 * 60 * 1000) {
      cache.value.delete(key)
      totalSize.value -= item.size
      return null
    }

    return item.data as T
  }

  // 设置缓存
  function set(key: string, data: any): boolean {
    const size = new Blob([JSON.stringify(data)]).size

    // 检查缓存大小
    if (totalSize.value + size > maxSize.value) {
      // 清理最旧的缓存
      cleanup(size)
    }

    cache.value.set(key, {
      key,
      data,
      timestamp: Date.now(),
      size
    })

    totalSize.value += size
    return true
  }

  // 删除缓存
  function remove(key: string) {
    const item = cache.value.get(key)
    if (item) {
      cache.value.delete(key)
      totalSize.value -= item.size
    }
  }

  // 清理缓存
  function cleanup(requiredSpace: number = 0) {
    const entries = Array.from(cache.value.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    let freedSpace = 0
    for (const [key, item] of entries) {
      if (freedSpace >= requiredSpace) break
      cache.value.delete(key)
      totalSize.value -= item.size
      freedSpace += item.size
    }
  }

  // 清空所有缓存
  function clear() {
    cache.value.clear()
    totalSize.value = 0
  }

  // 获取缓存大小
  function getSize(): number {
    return totalSize.value
  }

  // 设置最大缓存大小
  function setMaxSize(size: number) {
    maxSize.value = size
    if (totalSize.value > size) {
      cleanup(totalSize.value - size)
    }
  }

  return {
    get,
    set,
    remove,
    cleanup,
    clear,
    getSize,
    setMaxSize,
    totalSize: readonly(totalSize),
    maxSize: readonly(maxSize)
  }
}
