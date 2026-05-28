import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { PlayerType } from '@/types/player'

export const useSettingsStore = defineStore('settings', () => {
  // 服务器设置
  const serverUrl = ref('')
  const playbackUrl = ref('')  // 播放专用地址，为空则使用 serverUrl
  const apiKey = ref('')
  const username = ref('')
  const userId = ref('')

  // 播放器设置
  const defaultPlayer = ref<PlayerType>('mpv')
  const playerArgs = ref('')
  const hardwareDecoding = ref(true)
  const playerPaths = ref<Record<string, string>>({})

  // 外观设置
  const theme = ref<'white' | 'mint' | 'pink' | 'blue' | 'purple'>('white')
  const accentColor = ref('#007aff')
  const glassOpacity = ref(0.6) // 毛玻璃透光度 0.3~0.9
  const posterBgEnabled = ref(true)
  const autoHideNav = ref(true)

  // 缓存设置
  const cacheDir = ref('') // 缓存目录，为空则使用默认路径
  const cacheLimit = ref(2 * 1024 * 1024 * 1024) // 2GB
  const cacheSize = ref(0)

  // 保存设置到本地存储
  function saveSettings() {
    const settings = {
      serverUrl: serverUrl.value,
      playbackUrl: playbackUrl.value,
      apiKey: apiKey.value,
      username: username.value,
      userId: userId.value,
      defaultPlayer: defaultPlayer.value,
      playerArgs: playerArgs.value,
      hardwareDecoding: hardwareDecoding.value,
      playerPaths: playerPaths.value,
      theme: theme.value,
      accentColor: accentColor.value,
      glassOpacity: glassOpacity.value,
      posterBgEnabled: posterBgEnabled.value,
      autoHideNav: autoHideNav.value,
      cacheDir: cacheDir.value,
      cacheLimit: cacheLimit.value
    }
    localStorage.setItem('eyplayer-settings', JSON.stringify(settings))
  }

  // 从本地存储加载设置
  function loadSettings() {
    const saved = localStorage.getItem('eyplayer-settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        serverUrl.value = settings.serverUrl || ''
        playbackUrl.value = settings.playbackUrl || ''
        apiKey.value = settings.apiKey || ''
        username.value = settings.username || ''
        userId.value = settings.userId || ''
        defaultPlayer.value = settings.defaultPlayer || 'mpv'
        playerArgs.value = settings.playerArgs || ''
        hardwareDecoding.value = settings.hardwareDecoding ?? true
        playerPaths.value = settings.playerPaths || {}
        theme.value = settings.theme || 'white'
        accentColor.value = settings.accentColor || '#007aff'
        glassOpacity.value = settings.glassOpacity ?? 0.6
        posterBgEnabled.value = settings.posterBgEnabled ?? true
        autoHideNav.value = settings.autoHideNav ?? true
        cacheDir.value = settings.cacheDir || ''
        cacheLimit.value = settings.cacheLimit || 2 * 1024 * 1024 * 1024
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }

  // 监听设置变化并自动保存
  watch(
    [serverUrl, playbackUrl, apiKey, username, userId, defaultPlayer, playerArgs, hardwareDecoding, playerPaths, theme, accentColor, glassOpacity, posterBgEnabled, autoHideNav, cacheDir, cacheLimit],
    () => {
      saveSettings()
    },
    { deep: true }
  )

  return {
    serverUrl,
    playbackUrl,
    apiKey,
    username,
    userId,
    defaultPlayer,
    playerArgs,
    hardwareDecoding,
    playerPaths,
    theme,
    accentColor,
    glassOpacity,
    posterBgEnabled,
    autoHideNav,
    cacheDir,
    cacheLimit,
    cacheSize,
    saveSettings,
    loadSettings
  }
})
