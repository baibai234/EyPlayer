import { ref, readonly } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { PlayerType, PlayOptions } from '@/types/player'

export function usePlayer() {
  const playerStore = usePlayerStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 播放媒体
  async function play(url: string, options?: PlayOptions) {
    loading.value = true
    error.value = null

    try {
      await playerStore.play(url)
      return true
    } catch (err: any) {
      error.value = err.message || '播放失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 暂停播放
  async function pause() {
    try {
      await playerStore.pause()
      return true
    } catch (err: any) {
      error.value = err.message || '暂停失败'
      return false
    }
  }

  // 恢复播放
  async function resume() {
    try {
      await playerStore.resume()
      return true
    } catch (err: any) {
      error.value = err.message || '恢复播放失败'
      return false
    }
  }

  // 停止播放
  async function stop() {
    try {
      await playerStore.stop()
      return true
    } catch (err: any) {
      error.value = err.message || '停止失败'
      return false
    }
  }

  // 设置播放器类型
  function setPlayerType(type: PlayerType) {
    playerStore.setPlayerType(type)
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    isPlaying: playerStore.isPlaying,
    isPaused: playerStore.isPaused,
    progress: playerStore.progress,
    playerType: playerStore.playerType,
    play,
    pause,
    resume,
    stop,
    setPlayerType
  }
}
