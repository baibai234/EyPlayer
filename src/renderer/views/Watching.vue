<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
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
const watchingList = ref<MediaItem[]>([])

async function loadWatching() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    watchingList.value = await embyStore.fetchResumeItems(50)
  } catch (err: any) {
    errorMsg.value = err.message || '加载失败'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadWatching()
})

const handleResume = (id: string) => {
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
</script>

<template>
  <div class="watching-page">
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
        <h1 class="page-title">继续观看</h1>

        <Loading v-if="isLoading" text="正在加载..." />

        <Error v-else-if="errorMsg" :message="errorMsg" @retry="loadWatching" />

        <div v-else-if="watchingList.length > 0" class="watching-grid">
          <div
            v-for="item in watchingList"
            :key="item.id"
            class="watching-card"
            @click="handleResume(item.id)"
          >
            <img
              :src="item.backdrop || embyStore.getBackdropUrl(item.id, { width: 560, height: 360 })"
              :alt="item.title"
              class="card-bg"
            />
            <div class="card-overlay">
              <button class="btn-play-overlay" @click.stop="handlePlay(item.id)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div class="card-info">
                <h3 v-if="item.seriesName" class="card-series">{{ item.seriesName }}</h3>
                <h3 class="card-title">
                  <template v-if="item.type === 'Episode'">S{{ item.seasonNumber }}E{{ item.episodeNumber }} · </template>
                  {{ item.title }}
                </h3>
                <p class="card-meta">
                  <template v-if="item.year">{{ item.year }}</template>
                  <template v-if="item.playedPercentage"> · 已看 {{ Math.round(item.playedPercentage) }}%</template>
                </p>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (item.playedPercentage || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <h3>暂无在看内容</h3>
          <p>开始观看影片后会自动显示在这里</p>
          <button class="btn-browse" @click="router.push('/')">
            去媒体库看看
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.watching-page {
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

.page-title {
  font-size: 24px;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 24px;
}

.watching-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.watching-card {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-soft);
  transition: all 300ms ease-in-out;
}

.watching-card:hover {
  transform: scale(1.03);
  box-shadow: var(--shadow-hover);
}

.card-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 30%, rgba(0, 0, 0, 0.8));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}

.btn-play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 300ms ease-in-out;
}

.watching-card:hover .btn-play-overlay {
  opacity: 1;
}

.card-info {
  margin-bottom: 8px;
}

.card-series {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 2px;
}

.card-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--theme-accent);
  border-radius: 2px;
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
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text);
}

.empty-state p {
  font-size: 14px;
  color: var(--theme-text-secondary);
  margin-bottom: 8px;
}

.btn-browse {
  padding: 10px 24px;
  background: var(--theme-accent);
  color: white;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
}

.btn-browse:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 16px;
  }

  .watching-grid {
    grid-template-columns: 1fr;
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
