import { ref, readonly } from 'vue'
import { useEmbyStore } from '@/stores/emby'
import type { EmbyConfig, MediaItem, MediaQueryParams } from '@/types/emby'

export function useEmby() {
  const embyStore = useEmbyStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 连接到Emby服务器
  async function connect(config: EmbyConfig) {
    loading.value = true
    error.value = null

    try {
      await embyStore.connect(config)
      return true
    } catch (err: any) {
      error.value = err.message || '连接失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取媒体列表
  async function getMediaItems(params?: MediaQueryParams): Promise<MediaItem[]> {
    loading.value = true
    error.value = null

    try {
      // TODO: 实现实际的API调用
      // 模拟数据
      return Array.from({ length: 10 }, (_, i) => ({
        id: `media-${i}`,
        title: `媒体标题 ${i + 1}`,
        type: 'Movie' as const,
        year: 2024,
        rating: 8.5,
        poster: `https://picsum.photos/200/300?random=${i}`,
        overview: '这是一段示例描述文本。'
      }))
    } catch (err: any) {
      error.value = err.message || '获取媒体列表失败'
      return []
    } finally {
      loading.value = false
    }
  }

  // 获取媒体详情
  async function getMediaDetail(id: string): Promise<MediaItem | null> {
    loading.value = true
    error.value = null

    try {
      // TODO: 实现实际的API调用
      return {
        id,
        title: '媒体详情',
        type: 'Movie',
        year: 2024,
        rating: 8.5,
        poster: `https://picsum.photos/300/450?random=${id}`,
        backdrop: `https://picsum.photos/1920/1080?random=${id}`,
        overview: '这是一段详细的媒体描述文本。',
        duration: 120,
        genres: ['剧情', '科幻'],
        directors: ['导演名称'],
        cast: ['演员1', '演员2', '演员3']
      }
    } catch (err: any) {
      error.value = err.message || '获取媒体详情失败'
      return null
    } finally {
      loading.value = false
    }
  }

  // 搜索媒体
  async function searchMedia(query: string): Promise<MediaItem[]> {
    loading.value = true
    error.value = null

    try {
      // TODO: 实现实际的搜索API调用
      return Array.from({ length: 5 }, (_, i) => ({
        id: `search-${i}`,
        title: `搜索结果: ${query} ${i + 1}`,
        type: 'Movie' as const,
        year: 2024,
        rating: 8.5,
        poster: `https://picsum.photos/200/300?random=${i + 100}`
      }))
    } catch (err: any) {
      error.value = err.message || '搜索失败'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    isConnected: embyStore.isConnected,
    libraries: embyStore.libraries,
    connect,
    getMediaItems,
    getMediaDetail,
    searchMedia
  }
}
