<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Carousel from '@/components/media/Carousel.vue'
import MediaList from '@/components/media/MediaList.vue'
import Loading from '@/components/common/Loading.vue'
import Error from '@/components/common/Error.vue'
import { useEmbyStore } from '@/stores/emby'
import { usePlayerStore } from '@/stores/player'
import type { MediaItem } from '@/types/emby'

const router = useRouter()
const embyStore = useEmbyStore()
const playerStore = usePlayerStore()

const isLoading = ref(true)
const errorMsg = ref('')

const carouselItems = ref<any[]>([])
const librarySections = ref<{ title: string; items: any[]; icon: string; cardVariant?: 'poster' | 'wide' }[]>([])

const sectionIcons: Record<string, string> = {
  '继续观看': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
  '最新添加': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  '热门推荐': 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
}

function mapToCard(item: MediaItem) {
  return {
    id: item.id,
    title: item.title,
    poster: item.poster || embyStore.getPosterUrl(item.id, { width: 200, height: 300 }),
    year: item.year,
    rating: item.rating,
    type: item.type
  }
}

function mapToCarousel(item: MediaItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.overview?.slice(0, 120) || '',
    image: item.backdrop || embyStore.getBackdropUrl(item.id, { width: 1200, height: 600 })
  }
}

async function loadData() {
  isLoading.value = true
  errorMsg.value = ''

  try {
    if (embyStore.libraries.length === 0) {
      await embyStore.fetchLibraries()
    }

    const [latest, popular, resume, randomItems] = await Promise.all([
      embyStore.fetchMediaItems({ sortBy: 'DateCreated', sortOrder: 'Descending', limit: 20 }),
      embyStore.fetchMediaItems({ sortBy: 'CommunityRating', sortOrder: 'Descending', limit: 20 }),
      embyStore.fetchResumeItems(20),
      embyStore.fetchMediaItems({ sortBy: 'Random', limit: 15 })
    ])

    carouselItems.value = randomItems.slice(0, 5).map(mapToCarousel)

    if (carouselItems.value.length > 0) {
      embyStore.currentPosterBg = carouselItems.value[0].image
    }

    const sections: { title: string; items: any[]; icon: string; cardVariant?: 'poster' | 'wide' }[] = []

    for (const lib of embyStore.libraries) {
      const items = await embyStore.fetchMediaItems({
        parentId: lib.id,
        sortBy: 'DateCreated',
        sortOrder: 'Descending',
        limit: 20
      })
      if (items.length > 0) {
        sections.push({
          title: lib.name,
          items: items.map(mapToCard),
          icon: 'M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z'
        })
      }
    }

    if (popular.length > 0) {
      sections.push({ title: '热门推荐', items: popular.map(mapToCard), icon: sectionIcons['热门推荐'] })
    }

    librarySections.value = sections
  } catch (err: any) {
    errorMsg.value = err.message || '加载失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
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

const handleViewAll = (category: string) => {
  router.push(`/media?category=${category}`)
}
</script>

<template>
  <div class="home-page">
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
      <Loading v-if="isLoading" text="正在加载媒体库..." />

      <Error v-else-if="errorMsg" :message="errorMsg" @retry="loadData" />

      <div v-else class="content-area">
        <section v-if="carouselItems.length > 0" class="hero-section">
          <Carousel
            :items="carouselItems"
            :height="350"
            @click="(item: any) => handleMediaClick(item.id)"
            @slide-change="(item: any) => embyStore.currentPosterBg = item.image"
          />
        </section>

        <div class="sections-container">
          <MediaList
            v-for="(section, idx) in librarySections"
            :key="idx"
            :title="section.title"
            :items="section.items"
            :icon="section.icon"
            :card-variant="section.cardVariant || 'poster'"
            @click="handleMediaClick"
            @play="handlePlay"
            @view-all="handleViewAll(section.title)"
          />
        </div>

        <div v-if="librarySections.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <h3>暂无媒体内容</h3>
          <p>请检查媒体库是否有内容</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding-top: 130px;
  padding-bottom: 32px;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.hero-section {
  margin-bottom: 36px;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  gap: 12px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text);
}

.empty-state p {
  font-size: 14px;
  color: var(--theme-text-secondary);
}

@media (max-width: 768px) {
  .content-area {
    padding: 0 16px;
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
