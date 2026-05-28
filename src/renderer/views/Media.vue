<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import MediaCard from '@/components/media/MediaCard.vue'
import Loading from '@/components/common/Loading.vue'
import Error from '@/components/common/Error.vue'
import { useEmbyStore } from '@/stores/emby'
import { usePlayerStore } from '@/stores/player'
import type { MediaItem } from '@/types/emby'

const route = useRoute()
const router = useRouter()
const embyStore = useEmbyStore()
const playerStore = usePlayerStore()

const isLoading = ref(false)
const errorMsg = ref('')
const activeLibrary = ref('all')
const mediaItems = ref<MediaItem[]>([])
const hasMore = ref(true)
const pageSize = 20

const categories = ref<{ id: string; name: string }[]>([])

async function loadCategories() {
  const libs = [{ id: 'all', name: '全部' }]
  for (const lib of embyStore.libraries) {
    libs.push({ id: lib.id, name: lib.name })
  }
  categories.value = libs

  const queryCategory = route.query.category as string
  if (queryCategory && libs.some(l => l.id === queryCategory)) {
    activeLibrary.value = queryCategory
  }
}

async function loadMedia(reset = true) {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const params: any = {
      sortBy: 'DateCreated',
      sortOrder: 'Descending',
      limit: pageSize,
      startIndex: reset ? 0 : mediaItems.value.length
    }
    if (activeLibrary.value !== 'all') {
      params.parentId = activeLibrary.value
    }

    const items = await embyStore.fetchMediaItems(params)

    if (reset) {
      mediaItems.value = items
    } else {
      mediaItems.value.push(...items)
    }
    hasMore.value = items.length >= pageSize
  } catch (err: any) {
    errorMsg.value = err.message || '加载失败'
  } finally {
    isLoading.value = false
  }
}

watch(activeLibrary, () => {
  loadMedia()
})

const handleMediaClick = (id: string) => {
  router.push(`/detail/${id}`)
}

const playError = ref('')

const handlePlay = async (id: string) => {
  playError.value = ''
  const url = embyStore.getPlaybackUrl(id)
  await playerStore.play(url, id)
  if (playerStore.error) {
    playError.value = playerStore.error
  }
}

const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    loadMedia(false)
  }
}

function handleScroll() {
  const el = document.querySelector('.page-wrapper')
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 300) {
    loadMore()
  }
}

onMounted(() => {
  loadCategories()
  loadMedia()
  document.querySelector('.page-wrapper')?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.querySelector('.page-wrapper')?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="media-page">
    <Navbar />

    <Transition name="fade">
      <div v-if="playError" class="play-error-toast glass-effect" @click="playError = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3b30">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{{ playError }}</span>
      </div>
    </Transition>

    <main class="main-content">
      <div class="page-container">
        <header class="page-header">
          <h1>媒体库</h1>
          <div class="category-tabs">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="tab-btn"
              :class="{ active: activeLibrary === cat.id }"
              @click="activeLibrary = cat.id"
            >
              {{ cat.name }}
            </button>
          </div>
        </header>

        <Loading v-if="isLoading && mediaItems.length === 0" text="正在加载..." />

        <Error v-else-if="errorMsg" :message="errorMsg" @retry="loadMedia" />

        <template v-else>
          <div class="media-grid">
            <MediaCard
              v-for="item in mediaItems"
              :key="item.id"
              :id="item.id"
              :title="item.title"
              :poster="item.poster || embyStore.getPosterUrl(item.id, { width: 200, height: 300 })"
              :year="item.year"
              :rating="item.rating"
              :type="item.type"
              @click="handleMediaClick"
              @play="handlePlay"
            />
          </div>

          <div v-if="mediaItems.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
              <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <h3>没有找到媒体</h3>
            <p>该媒体库暂无内容</p>
          </div>

          <div v-if="hasMore && mediaItems.length > 0" class="scroll-sentinel">
            <Loading v-if="isLoading" size="small" text="加载更多..." />
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.media-page {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding-top: 130px;
  padding-bottom: 32px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 16px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 16px;
  background: var(--theme-active);
  color: var(--theme-text-secondary);
  border-radius: var(--radius-full);
  font-size: 13px;
  white-space: nowrap;
  transition: all 300ms ease-in-out;
}

.tab-btn.active {
  background: var(--theme-accent);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: var(--theme-hover);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 12px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--theme-text);
}

.empty-state p {
  font-size: 13px;
  color: var(--theme-text-secondary);
}

.scroll-sentinel {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 16px;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
}

.play-error-toast {
  position: fixed;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  background: rgba(255, 59, 48, 0.12);
  border: 1px solid rgba(255, 59, 48, 0.25);
  color: var(--theme-text);
  font-size: 13px;
  cursor: pointer;
  max-width: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
