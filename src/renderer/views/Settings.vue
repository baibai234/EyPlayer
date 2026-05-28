<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import { useSettingsStore } from '@/stores/settings'
import { useEmbyStore } from '@/stores/emby'
import { EmbyApi } from '@/services/emby-api'

const settings = useSettingsStore()
const embyStore = useEmbyStore()
const router = useRouter()

const password = ref('')
const testStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle')
const testMessage = ref('')

const themes = [
  { value: 'white', label: '白色', color: '#ffffff' },
  { value: 'mint', label: '薄荷绿', color: '#e6f7f2' },
  { value: 'pink', label: '樱花粉', color: '#fce4ec' },
  { value: 'blue', label: '天空蓝', color: '#e3f2fd' },
  { value: 'purple', label: '浅紫色', color: '#f3e5f5' }
]

const playerOptions = [
  { value: 'mpv', label: 'MPV' },
  { value: 'potplayer', label: 'PotPlayer' },
  { value: 'vlc', label: 'VLC' }
]

const cacheOptions = [
  { value: 1024 * 1024 * 1024, label: '1 GB' },
  { value: 2 * 1024 * 1024 * 1024, label: '2 GB' },
  { value: 5 * 1024 * 1024 * 1024, label: '5 GB' },
  { value: 10 * 1024 * 1024 * 1024, label: '10 GB' }
]

onMounted(() => {
  settings.loadSettings()
})

const testConnection = async () => {
  if (!settings.serverUrl || !settings.username || !password.value) {
    testStatus.value = 'error'
    testMessage.value = '请填写服务器地址、用户名和密码'
    return
  }

  testStatus.value = 'testing'
  testMessage.value = '正在登录...'

  try {
    let serverUrl = settings.serverUrl.trim()
    if (!/^https?:\/\//i.test(serverUrl)) {
      serverUrl = 'http://' + serverUrl
    }

    const { userId, accessToken } = await EmbyApi.authenticate(
      serverUrl,
      settings.username,
      password.value
    )

    settings.apiKey = accessToken
    settings.userId = userId
    settings.serverUrl = serverUrl

    await embyStore.connect({
      serverUrl,
      apiKey: accessToken,
      userId
    })

    testStatus.value = 'success'
    testMessage.value = '连接成功！'

    setTimeout(() => router.push('/'), 1000)
  } catch (err: any) {
    testStatus.value = 'error'
    testMessage.value = err.message || '连接失败'
  }
}

const disconnectServer = () => {
  embyStore.disconnect()
  settings.apiKey = ''
  settings.userId = ''
  password.value = ''
  testStatus.value = 'idle'
  testMessage.value = ''
}

const clearCache = () => {
  if (confirm('确定要清理所有缓存吗？')) {
    settings.cacheSize = 0
    localStorage.removeItem('eyplayer-cache-index')
  }
}

const browsePlayerPath = async () => {
  if (!window.electronAPI) return
  const result = await window.electronAPI.openFile({
    filters: [
      { name: '可执行文件', extensions: ['exe'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  if (!result.canceled && result.filePaths.length > 0) {
    settings.playerPaths[settings.defaultPlayer] = result.filePaths[0]
  }
}

const clearPlayerPath = () => {
  delete settings.playerPaths[settings.defaultPlayer]
}

const browseCacheDir = async () => {
  if (!window.electronAPI) return
  const result = await window.electronAPI.openDirectory()
  if (!result.canceled && result.filePaths.length > 0) {
    settings.cacheDir = result.filePaths[0]
  }
}
</script>

<template>
  <div class="settings-page">
    <Navbar />

    <main class="main-content">
      <div class="settings-container">
        <!-- 服务器设置 -->
        <div class="settings-group">
          <h3 class="group-title">服务器</h3>
          <div class="group-card glass-effect">
            <div v-if="embyStore.isConnected" class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--theme-accent)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <div class="setting-text">
                  <span class="setting-label">已连接</span>
                  <span class="setting-value">{{ settings.serverUrl }}</span>
                </div>
              </div>
              <button class="btn-text danger" @click="disconnectServer">断开</button>
            </div>
            <div v-if="embyStore.isConnected" class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <input
                  v-model="settings.playbackUrl"
                  type="text"
                  placeholder="播放地址（留空使用服务器地址）"
                  class="setting-input"
                />
              </div>
            </div>

            <template v-else>
              <div class="setting-item">
                <div class="setting-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  <input
                    v-model="settings.serverUrl"
                    type="text"
                    placeholder="服务器地址 (如 192.168.1.100:8096)"
                    class="setting-input"
                  />
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  <input
                    v-model="settings.username"
                    type="text"
                    placeholder="用户名"
                    class="setting-input"
                  />
                </div>
              </div>
              <div class="setting-item">
                <div class="setting-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  <input
                    v-model="password"
                    type="password"
                    placeholder="密码"
                    class="setting-input"
                  />
                </div>
              </div>
              <div class="setting-item">
                <button
                  class="btn-connect"
                  :disabled="testStatus === 'testing'"
                  @click="testConnection"
                >
                  {{ testStatus === 'testing' ? '登录中...' : '连接' }}
                </button>
                <span v-if="testMessage" class="test-msg" :class="testStatus">
                  {{ testMessage }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- 播放器设置 -->
        <div class="settings-group">
          <h3 class="group-title">播放器</h3>
          <div class="group-card glass-effect">
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <span class="setting-label">默认播放器</span>
              </div>
              <select v-model="settings.defaultPlayer" class="setting-select">
                <option v-for="opt in playerOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/></svg>
                <span class="setting-label">硬件解码</span>
              </div>
              <div class="ios-switch" :class="{ active: settings.hardwareDecoding }" @click="settings.hardwareDecoding = !settings.hardwareDecoding"></div>
            </div>
            <div class="setting-item path-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6V10h12v2z"/></svg>
                <div class="setting-text">
                  <span class="setting-label">播放器路径</span>
                  <span class="setting-hint">{{ settings.playerPaths[settings.defaultPlayer] || '自动检测' }}</span>
                </div>
              </div>
              <div class="path-actions">
                <button class="btn-text" @click="browsePlayerPath">浏览</button>
                <button v-if="settings.playerPaths[settings.defaultPlayer]" class="btn-text danger" @click="clearPlayerPath">清除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 外观设置 -->
        <div class="settings-group">
          <h3 class="group-title">外观</h3>
          <div class="group-card glass-effect">
            <div class="setting-item theme-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                <span class="setting-label">主题</span>
              </div>
            </div>
            <div class="theme-grid">
              <button
                v-for="t in themes"
                :key="t.value"
                class="theme-option"
                :class="{ active: settings.theme === t.value }"
                @click="settings.theme = t.value as any"
              >
                <div class="theme-preview" :style="{ background: t.color }"></div>
                <span class="theme-name">{{ t.label }}</span>
              </button>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
                <span class="setting-label">海报背景</span>
              </div>
              <div class="ios-switch" :class="{ active: settings.posterBgEnabled }" @click="settings.posterBgEnabled = !settings.posterBgEnabled"></div>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                <span class="setting-label">毛玻璃透光度</span>
              </div>
              <div class="slider-wrapper">
                <input
                  type="range"
                  min="0.3"
                  max="0.9"
                  step="0.05"
                  :value="settings.glassOpacity"
                  class="opacity-slider"
                  @input="settings.glassOpacity = parseFloat(($event.target as HTMLInputElement).value)"
                />
                <span class="slider-value">{{ Math.round(settings.glassOpacity * 100) }}%</span>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                <span class="setting-label">自动隐藏导航栏</span>
              </div>
              <div class="ios-switch" :class="{ active: settings.autoHideNav }" @click="settings.autoHideNav = !settings.autoHideNav"></div>
            </div>
          </div>
        </div>

        <!-- 缓存设置 -->
        <div class="settings-group">
          <h3 class="group-title">缓存</h3>
          <div class="group-card glass-effect">
            <div class="setting-item path-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                <div class="setting-text">
                  <span class="setting-label">缓存目录</span>
                  <span class="setting-hint">{{ settings.cacheDir || '使用默认路径' }}</span>
                </div>
              </div>
              <div class="path-actions">
                <button class="btn-text" @click="browseCacheDir">浏览</button>
                <button v-if="settings.cacheDir" class="btn-text danger" @click="settings.cacheDir = ''">恢复默认</button>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>
                <span class="setting-label">当前缓存</span>
              </div>
              <span class="setting-value">{{ (settings.cacheSize / 1024 / 1024).toFixed(1) }} MB</span>
            </div>
            <div class="setting-item">
              <div class="setting-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                <span class="setting-label">缓存上限</span>
              </div>
              <select v-model.number="settings.cacheLimit" class="setting-select">
                <option v-for="opt in cacheOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="setting-item">
              <button class="btn-text danger" @click="clearCache">清除缓存</button>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div class="settings-group">
          <h3 class="group-title">关于</h3>
          <div class="group-card glass-effect about-card">
            <div class="about-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--theme-accent)">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
              <div>
                <h4 class="about-name">EyPlayer</h4>
                <p class="about-version">版本 0.1.0</p>
              </div>
            </div>
            <p class="about-desc">一款轻量级 Emby 媒体库管理与播放软件</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding-top: 130px;
  padding-bottom: 32px;
}

.settings-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-left: 4px;
}

.group-card {
  border-radius: var(--radius-card);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 48px;
  border-bottom: 1px solid var(--theme-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.setting-left svg {
  flex-shrink: 0;
  color: var(--theme-text-secondary);
}

.setting-label {
  font-size: 14px;
  color: var(--theme-text);
}

.setting-value {
  font-size: 13px;
  color: var(--theme-text-tertiary);
}

.setting-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--theme-text);
  padding: 12px 0;
}

.setting-input::placeholder {
  color: var(--theme-text-tertiary);
}

.setting-select {
  border: none;
  background: var(--theme-active);
  color: var(--theme-text);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.btn-connect {
  padding: 10px 24px;
  background: var(--theme-accent);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
  margin: 8px 0;
}

.btn-connect:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-connect:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-msg {
  font-size: 13px;
  margin-left: 12px;
}

.test-msg.success {
  color: #34c759;
}

.test-msg.error {
  color: #ff3b30;
}

.btn-text {
  padding: 8px 12px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
  border-radius: 8px;
}

.btn-text.danger {
  color: #ff3b30;
}

.btn-text:hover {
  background: var(--theme-hover);
}

.theme-item {
  border-bottom: none;
  padding-bottom: 0;
}

.theme-grid {
  display: flex;
  gap: 12px;
  padding: 8px 16px 16px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all 300ms ease-in-out;
}

.theme-option:hover {
  background: var(--theme-hover);
}

.theme-option.active {
  background: var(--theme-active);
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--theme-border);
  box-shadow: var(--shadow-soft);
}

.theme-option.active .theme-preview {
  border-color: var(--theme-accent);
}

.theme-name {
  font-size: 11px;
  color: var(--theme-text-secondary);
}

.about-card {
  padding: 24px;
}

.path-item {
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 16px;
  gap: 8px;
}

.path-item .setting-left {
  width: 100%;
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.setting-hint {
  font-size: 12px;
  color: var(--theme-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path-actions {
  display: flex;
  gap: 8px;
  align-self: flex-end;
}

.about-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.about-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-text);
}

.about-version {
  font-size: 12px;
  color: var(--theme-text-tertiary);
}

.about-desc {
  font-size: 13px;
  color: var(--theme-text-secondary);
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 160px;
}

.opacity-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--theme-active);
  border-radius: 2px;
  outline: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--theme-accent);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
  font-size: 12px;
  color: var(--theme-text-secondary);
  min-width: 32px;
  text-align: right;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 0 16px;
  }
}
</style>
