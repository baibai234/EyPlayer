import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EmbyApi } from '@/services/emby-api'
import { useSettingsStore } from './settings'
import type { EmbyConfig, MediaLibrary, MediaItem, MediaQueryParams, Season, Episode } from '@/types/emby'

export const useEmbyStore = defineStore('emby', () => {
  const config = ref<EmbyConfig | null>(null)
  const libraries = ref<MediaLibrary[]>([])
  const currentMedia = ref<MediaItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isConnected = ref(false)

  // 全局海报背景
  const currentPosterBg = ref('')

  let api: EmbyApi | null = null

  const hasLibraries = computed(() => libraries.value.length > 0)

  function getApi(): EmbyApi {
    if (!api) throw new Error('未连接到Emby服务器')
    return api
  }

  async function waitForApi(): Promise<EmbyApi> {
    if (api) return api
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (api) { clearInterval(check); resolve() }
      }, 100)
      setTimeout(() => { clearInterval(check); resolve() }, 10000)
    })
    if (!api) throw new Error('未连接到Emby服务器')
    return api
  }

  async function connect(embyConfig: EmbyConfig) {
    loading.value = true
    error.value = null

    try {
      api = new EmbyApi(embyConfig)
      const ok = await api.testConnection()
      if (!ok) throw new Error('无法连接到服务器')

      config.value = embyConfig
      isConnected.value = true

      libraries.value = await api.getLibraries()
    } catch (err: any) {
      error.value = err.message || '连接失败'
      isConnected.value = false
      api = null
      throw err
    } finally {
      loading.value = false
    }
  }

  function disconnect() {
    config.value = null
    libraries.value = []
    currentMedia.value = null
    isConnected.value = false
    api = null
  }

  async function fetchLibraries() {
    try {
      const a = await waitForApi()
      loading.value = true
      libraries.value = await a.getLibraries()
    } catch (err: any) {
      error.value = err.message || '获取媒体库失败'
    } finally {
      loading.value = false
    }
  }

  async function fetchMediaItems(params?: MediaQueryParams): Promise<MediaItem[]> {
    try {
      const a = await waitForApi()
      return await a.getMediaItems(params)
    } catch (err: any) {
      error.value = err.message || '获取媒体失败'
      return []
    }
  }

  async function fetchMediaDetail(id: string): Promise<MediaItem | null> {
    try {
      const a = await waitForApi()
      const item = await a.getMediaDetail(id)
      currentMedia.value = item
      return item
    } catch (err: any) {
      error.value = err.message || '获取详情失败'
      return null
    }
  }

  async function fetchResumeItems(limit = 20): Promise<MediaItem[]> {
    try {
      const a = await waitForApi()
      return await a.getResumeItems(limit)
    } catch (err: any) {
      error.value = err.message || '获取在看列表失败'
      return []
    }
  }

  async function searchMedia(query: string): Promise<MediaItem[]> {
    try {
      const a = await waitForApi()
      return await a.searchMedia(query)
    } catch (err: any) {
      error.value = err.message || '搜索失败'
      return []
    }
  }

  async function fetchSeasons(seriesId: string): Promise<Season[]> {
    try {
      const a = await waitForApi()
      return await a.getSeasons(seriesId)
    } catch (err: any) {
      error.value = err.message || '获取季列表失败'
      return []
    }
  }

  async function fetchEpisodes(seriesId: string, seasonId: string): Promise<Episode[]> {
    try {
      const a = await waitForApi()
      return await a.getEpisodes(seriesId, seasonId)
    } catch (err: any) {
      error.value = err.message || '获取集列表失败'
      return []
    }
  }

  async function fetchBoxSetChildren(boxSetId: string): Promise<MediaItem[]> {
    try {
      const a = await waitForApi()
      return await a.getBoxSetChildren(boxSetId)
    } catch (err: any) {
      error.value = err.message || '获取合集内容失败'
      return []
    }
  }

  function getPosterUrl(id: string, options?: { width?: number; height?: number }): string {
    return getApi().getPosterUrl(id, options)
  }

  function getBackdropUrl(id: string, options?: { width?: number; height?: number }): string {
    return getApi().getBackdropUrl(id, options)
  }

  function getPlaybackUrl(id: string): string {
    const settings = useSettingsStore()
    return getApi().getPlaybackUrl(id, settings.playbackUrl || undefined)
  }

  async function markAsWatched(id: string) {
    await getApi().markAsWatched(id)
  }

  async function markAsUnwatched(id: string) {
    await getApi().markAsUnwatched(id)
  }

  async function addToFavorites(id: string) {
    await getApi().addToFavorites(id)
  }

  async function removeFromFavorites(id: string) {
    await getApi().removeFromFavorites(id)
  }

  async function updateProgress(id: string, positionTicks: number) {
    await getApi().updateProgress(id, positionTicks)
  }

  async function reportPlayback(endpoint: string, body: any) {
    try {
      const a = await waitForApi()
      await a.reportPlayback(endpoint, body)
    } catch {
      // 静默失败
    }
  }

  return {
    config,
    libraries,
    currentMedia,
    currentPosterBg,
    loading,
    error,
    isConnected,
    hasLibraries,
    connect,
    disconnect,
    fetchLibraries,
    fetchMediaItems,
    fetchMediaDetail,
    fetchResumeItems,
    searchMedia,
    fetchSeasons,
    fetchEpisodes,
    fetchBoxSetChildren,
    getPosterUrl,
    getBackdropUrl,
    getPlaybackUrl,
    markAsWatched,
    markAsUnwatched,
    addToFavorites,
    removeFromFavorites,
    updateProgress,
    reportPlayback
  }
})
