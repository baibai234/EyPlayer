<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useEmbyStore } from '@/stores/emby'

const settings = useSettingsStore()
const embyStore = useEmbyStore()

const isReady = ref(false)
const isMaximized = ref(false)

const themeClass = computed(() => `theme-${settings.theme}`)

const minimize = () => window.electronAPI?.minimizeWindow()
const toggleMaximize = async () => {
  await window.electronAPI?.maximizeWindow()
}
const close = () => window.electronAPI?.closeWindow()

onMounted(() => {
  isReady.value = true
  window.electronAPI?.on('window-maximized', () => { isMaximized.value = true })
  window.electronAPI?.on('window-unmaximized', () => { isMaximized.value = false })
})
</script>

<template>
  <div
    class="app-container"
    :class="[themeClass, { ready: isReady }]"
    :data-theme="settings.theme"
    :style="{ '--glass-opacity': settings.glassOpacity }"
  >
    <div
      v-if="settings.posterBgEnabled && embyStore.currentPosterBg"
      class="poster-background"
    >
      <img :src="embyStore.currentPosterBg" alt="" class="poster-bg-image" />
    </div>

    <!-- 自定义标题栏 -->
    <div class="titlebar glass-effect">
      <div class="titlebar-drag">
        <div class="titlebar-brand">
          <svg class="titlebar-logo" width="22" height="22" viewBox="0 0 512 512">
            <defs>
              <linearGradient id="tb-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#7dd3fc"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="496" height="496" rx="112" fill="rgba(255,255,255,0.95)"/>
            <path d="M330,100 A160,160 0 1,0 330,412" fill="none" stroke="url(#tb-g)" stroke-width="64" stroke-linecap="round"/>
            <line x1="170" y1="256" x2="330" y2="256" stroke="url(#tb-g)" stroke-width="52" stroke-linecap="round"/>
            <polygon points="220,184 220,328 316,256" fill="url(#tb-g)"/>
          </svg>
          <span class="titlebar-name">EyPlayer</span>
        </div>
      </div>
      <div class="titlebar-controls">
        <button class="titlebar-btn" @click="minimize">
          <svg width="12" height="12" viewBox="0 0 12 12"><rect y="5" width="12" height="1.5" fill="currentColor" rx="0.75"/></svg>
        </button>
        <button class="titlebar-btn" @click="toggleMaximize">
          <svg v-if="!isMaximized" width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" rx="1"/></svg>
          <svg v-else width="12" height="12" viewBox="0 0 12 12"><rect x="2.5" y="2.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.5" rx="0.5"/><rect x="1" y="4" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.5" rx="0.5"/></svg>
        </button>
        <button class="titlebar-btn close-btn" @click="close">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>

    <div class="page-wrapper">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #ffffff;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  overflow: hidden;
}

.app-container.ready {
  opacity: 1;
}

.poster-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.3;
}

.poster-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(8px) saturate(1.1);
  transform: scale(1.05);
}

.page-wrapper {
  width: 100%;
  height: calc(100vh - 36px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
}

.titlebar {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2000;
  user-select: none;
  flex-shrink: 0;
}

.titlebar-drag {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  -webkit-app-region: drag;
}

.titlebar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.titlebar-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--theme-text);
  letter-spacing: 0.5px;
  font-family: 'M PLUS Rounded 1c', 'Noto Sans SC', sans-serif;
}

.titlebar-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.titlebar-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-secondary);
  transition: all 150ms ease;
  background: transparent;
}

.titlebar-btn:hover {
  background: var(--theme-hover);
  color: var(--theme-text);
}

.titlebar-btn.close-btn:hover {
  background: #e81123;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
