<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const route = useRoute()
const settings = useSettingsStore()

const isVisible = ref(true)
let lastScrollTop = 0
let scrollContainer: HTMLElement | null = null

const navItems = [
  {
    path: '/',
    name: '媒体',
    icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z'
  },
  {
    path: '/watching',
    name: '在看',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z'
  },
  {
    path: '/media',
    name: '资源',
    icon: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z'
  },
  {
    path: '/settings',
    name: '设置',
    icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
  },
  {
    path: '/search',
    name: '搜索',
    icon: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleScroll() {
  if (!settings.autoHideNav) return
  if (!scrollContainer) return
  const scrollTop = scrollContainer.scrollTop
  isVisible.value = scrollTop <= 10 || scrollTop < lastScrollTop
  lastScrollTop = scrollTop
}

onMounted(() => {
  scrollContainer = document.querySelector('.page-wrapper')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <nav class="navbar glass-effect" :class="{ hidden: !isVisible }">
    <button
      v-for="item in navItems"
      :key="item.path"
      class="nav-btn"
      :class="{ active: isActive(item.path) }"
      @click="navigateTo(item.path)"
    >
      <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path :d="item.icon" />
      </svg>
      <span class="nav-text">{{ item.name }}</span>
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-soft);
  z-index: 1000;
  transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
}

.navbar.hidden {
  transform: translateX(-50%) translateY(-80px);
  opacity: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--theme-text-secondary);
  transition: all 300ms ease-in-out;
  white-space: nowrap;
}

.nav-btn:hover {
  background: var(--theme-hover);
}

.nav-btn:active {
  transform: scale(0.95);
}

.nav-btn.active {
  color: var(--theme-text);
  background: var(--theme-active);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .navbar {
    width: calc(100% - 32px);
    top: 46px;
  }

  .nav-btn {
    padding: 8px 10px;
    gap: 4px;
  }

  .nav-text {
    font-size: 12px;
  }
}
</style>
