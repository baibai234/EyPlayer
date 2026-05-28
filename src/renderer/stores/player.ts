import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { useSettingsStore } from './settings'
import type { PlayerType, PlayProgress } from '@/types/player'

export const usePlayerStore = defineStore('player', () => {
  const currentUrl = ref<string | null>(null)
  const currentMediaId = ref<string | null>(null)
  const playerType = ref<PlayerType>('mpv')
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const progress = ref<PlayProgress>({ currentTime: 0, duration: 0, percentage: 0 })
  const error = ref<string | null>(null)

  const isIdle = computed(() => !isPlaying.value && !isPaused.value)
  const progressPercent = computed(() => progress.value.percentage)

  // 监听 mpv 进度上报
  let progressUnlisten: (() => void) | null = null

  function startListening() {
    if (!window.electronAPI) return
    progressUnlisten = window.electronAPI.on('mpv-progress', async (data: { mediaId: string; positionTicks: number }) => {
      if (!data.mediaId) return
      const settings = useSettingsStore()
      if (!settings.serverUrl || !settings.apiKey) return
      try {
        await window.electronAPI!.reportProgress(
          '/Sessions/Playing/Progress',
          { ItemId: data.mediaId, MediaSourceId: data.mediaId, PositionTicks: data.positionTicks },
          settings.serverUrl,
          settings.apiKey
        )
      } catch {}
    })
  }

  function stopListening() {
    progressUnlisten?.()
    progressUnlisten = null
  }

  // 启动时监听
  startListening()

  async function play(url: string, mediaId?: string) {
    try {
      error.value = null
      isPlaying.value = true
      isPaused.value = false
      currentUrl.value = url
      currentMediaId.value = mediaId || null

      if (window.electronAPI) {
        const settings = useSettingsStore()
        const result = await window.electronAPI.playerPlay(url, {
          playerType: settings.defaultPlayer,
          hardwareDecoding: settings.hardwareDecoding,
          customPath: settings.playerPaths[settings.defaultPlayer] || '',
          mediaId: mediaId || '',
          serverUrl: settings.serverUrl,
          apiKey: settings.apiKey
        })
        if (!result?.success) {
          throw new Error('播放器启动失败')
        }
        // 非 mpv 播放器：定时估算进度上报
        if (settings.defaultPlayer !== 'mpv' && mediaId) {
          startFallbackProgress(mediaId)
        }
      } else {
        window.open(url, '_blank')
      }
    } catch (err: any) {
      error.value = err.message || '播放失败'
      isPlaying.value = false
    }
  }

  // 非 mpv 播放器的估算进度上报
  let fallbackTimer: ReturnType<typeof setInterval> | null = null
  let fallbackStart = 0

  function startFallbackProgress(mediaId: string) {
    stopFallbackProgress()
    fallbackStart = Date.now()
    fallbackTimer = setInterval(async () => {
      if (!isPlaying.value) return
      const settings = useSettingsStore()
      if (!settings.serverUrl || !settings.apiKey) return
      const elapsedMs = Date.now() - fallbackStart
      const positionTicks = elapsedMs * 10_000
      try {
        await window.electronAPI!.reportProgress(
          '/Sessions/Playing/Progress',
          { ItemId: mediaId, MediaSourceId: mediaId, PositionTicks: positionTicks },
          settings.serverUrl,
          settings.apiKey
        )
      } catch {}
    }, 30000)
  }

  function stopFallbackProgress() {
    if (fallbackTimer) {
      clearInterval(fallbackTimer)
      fallbackTimer = null
    }
  }

  async function pause() {
    if (!isPlaying.value) return
    isPaused.value = true
    isPlaying.value = false
  }

  async function resume() {
    if (!isPaused.value) return
    isPlaying.value = true
    isPaused.value = false
  }

  async function stop() {
    stopFallbackProgress()
    currentUrl.value = null
    currentMediaId.value = null
    isPlaying.value = false
    isPaused.value = false
    progress.value = { currentTime: 0, duration: 0, percentage: 0 }
  }

  function updateProgress(newProgress: PlayProgress) {
    progress.value = newProgress
  }

  function setPlayerType(type: PlayerType) {
    playerType.value = type
  }

  return {
    currentUrl,
    currentMediaId,
    playerType,
    isPlaying,
    isPaused,
    progress,
    error,
    isIdle,
    progressPercent,
    play,
    pause,
    resume,
    stop,
    updateProgress,
    setPlayerType
  }
})
