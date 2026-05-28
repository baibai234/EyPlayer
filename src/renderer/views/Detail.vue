<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Loading from '@/components/common/Loading.vue'
import Error from '@/components/common/Error.vue'
import { useEmbyStore } from '@/stores/emby'
import { usePlayerStore } from '@/stores/player'
import type { MediaItem, Season, Episode } from '@/types/emby'

const route = useRoute()
const router = useRouter()
const embyStore = useEmbyStore()
const playerStore = usePlayerStore()

const mediaId = route.params.id as string
const isLoading = ref(true)
const errorMsg = ref('')
const media = ref<MediaItem | null>(null)
const isFavorite = ref(false)
const isLaunching = ref(false)
const playError = ref('')

// 电视剧季集
const seasons = ref<Season[]>([])
const episodes = ref<Episode[]>([])
const activeSeasonId = ref('')
const isLoadingEpisodes = ref(false)

// 合集
const isBoxSet = computed(() => media.value?.type === 'BoxSet')
const boxSetChildren = ref<MediaItem[]>([])
const isLoadingChildren = ref(false)

const isSeries = computed(() => media.value?.type === 'Series')

const formattedDuration = computed(() => {
  const mins = media.value?.duration || 0
  const hours = Math.floor(mins / 60)
  const m = mins % 60
  return hours > 0 ? `${hours}小时${m}分钟` : `${m}分钟`
})

const posterUrl = computed(() => {
  if (!media.value) return ''
  return media.value.poster || embyStore.getPosterUrl(media.value.id, { width: 300, height: 450 })
})

async function loadDetail() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const item = await embyStore.fetchMediaDetail(mediaId)
    if (!item) {
      errorMsg.value = '未找到该媒体'
      return
    }
    media.value = item

    const bgUrl = item.backdrop || item.poster || embyStore.getBackdropUrl(item.id, { width: 1920, height: 1080 })
    embyStore.currentPosterBg = bgUrl

    if (item.type === 'Series') {
      const seasonList = await embyStore.fetchSeasons(mediaId)
      seasons.value = seasonList
      if (seasonList.length > 0) {
        activeSeasonId.value = seasonList[0].id
        await loadEpisodes(seasonList[0].id)
      }
    }

    if (item.type === 'BoxSet') {
      isLoadingChildren.value = true
      try {
        boxSetChildren.value = await embyStore.fetchBoxSetChildren(mediaId)
      } catch {
        boxSetChildren.value = []
      } finally {
        isLoadingChildren.value = false
      }
    }
  } catch (err: any) {
    errorMsg.value = err.message || '加载失败'
  } finally {
    isLoading.value = false
  }
}

async function loadEpisodes(seasonId: string) {
  isLoadingEpisodes.value = true
  try {
    episodes.value = await embyStore.fetchEpisodes(mediaId, seasonId)
  } catch {
    episodes.value = []
  } finally {
    isLoadingEpisodes.value = false
  }
}

watch(activeSeasonId, (id) => {
  if (id) loadEpisodes(id)
})

onMounted(() => {
  loadDetail()
})

const handlePlay = async (episodeId?: string) => {
  const id = episodeId || media.value?.id
  if (!id) return
  playError.value = ''
  isLaunching.value = true
  try {
    const url = embyStore.getPlaybackUrl(id)
    await playerStore.play(url, id)
    if (playerStore.error) {
      playError.value = playerStore.error
    }
  } catch (err: any) {
    playError.value = err.message || '播放失败'
  } finally {
    setTimeout(() => { isLaunching.value = false }, 2000)
  }
}

const toggleFavorite = async () => {
  if (!media.value) return
  try {
    if (isFavorite.value) {
      await embyStore.removeFromFavorites(media.value.id)
    } else {
      await embyStore.addToFavorites(media.value.id)
    }
    isFavorite.value = !isFavorite.value
  } catch {}
}

const goBack = () => {
  router.back()
}

function formatEpisodeDuration(mins: number) {
  if (mins <= 0) return ''
  return `${mins}分钟`
}
</script>

<template>
  <div class="detail-page">
    <Navbar />

    <Transition name="fade">
      <div v-if="playError" class="play-error-toast glass-effect" @click="playError = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3b30">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{{ playError }}</span>
      </div>
    </Transition>

    <Loading v-if="isLoading" fullscreen text="加载中..." />

    <Error v-else-if="errorMsg" :message="errorMsg" @retry="loadDetail" />

    <template v-else-if="media">
      <div class="detail-content">
        <button class="btn-back glass-effect" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          返回
        </button>

        <div class="main-info">
          <div class="poster">
            <img :src="posterUrl" :alt="media.title" />
            <div v-if="media.quality" class="quality-badge">{{ media.quality }}</div>
          </div>

          <div class="info">
            <h1 class="title">{{ media.title }}</h1>

            <div class="meta">
              <span v-if="media.year" class="meta-item">{{ media.year }}</span>
              <span v-if="media.rating" class="meta-item rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffd700">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {{ media.rating.toFixed(1) }}
              </span>
              <span v-if="media.duration" class="meta-item">{{ formattedDuration }}</span>
              <span v-if="media.audio" class="meta-item">{{ media.audio }}</span>
              <span v-if="media.officialRating" class="meta-item cert">{{ media.officialRating }}</span>
              <span v-if="isSeries && seasons.length > 0" class="meta-item">{{ seasons.length }} 季</span>
              <span v-if="isBoxSet && boxSetChildren.length > 0" class="meta-item">{{ boxSetChildren.length }} 部</span>
            </div>

            <div v-if="media.genres && media.genres.length > 0" class="genre">
              <span v-for="g in media.genres" :key="g" class="genre-tag">
                {{ g }}
              </span>
            </div>

            <p v-if="media.overview" class="overview">{{ media.overview }}</p>

            <div class="actions">
              <button
                v-if="!isBoxSet"
                class="btn-play"
                :disabled="isLaunching"
                @click="handlePlay()"
              >
                <svg v-if="!isLaunching" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>{{ isLaunching ? '正在启动...' : '立即播放' }}</span>
              </button>
              <button
                class="btn-secondary"
                :class="{ active: isFavorite }"
                @click="toggleFavorite"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 季集列表 -->
        <section v-if="isSeries && seasons.length > 0" class="episodes-section glass-effect">
          <div class="season-tabs">
            <button
              v-for="s in seasons"
              :key="s.id"
              class="season-tab"
              :class="{ active: activeSeasonId === s.id }"
              @click="activeSeasonId = s.id"
            >
              {{ s.name }}
            </button>
          </div>

          <Loading v-if="isLoadingEpisodes" size="small" text="加载集数..." />

          <div v-else-if="episodes.length > 0" class="episode-grid">
            <div
              v-for="ep in episodes"
              :key="ep.id"
              class="episode-card"
              :class="{ watched: ep.watched }"
              @click="handlePlay(ep.id)"
            >
              <div class="ep-number">{{ ep.episodeNumber }}</div>
              <div class="ep-info">
                <span class="ep-title">{{ ep.title }}</span>
                <span v-if="ep.duration" class="ep-duration">{{ formatEpisodeDuration(ep.duration) }}</span>
              </div>
              <div v-if="ep.watched" class="ep-watched-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#34c759">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div v-if="ep.playedPercentage && ep.playedPercentage > 0 && !ep.watched" class="ep-progress">
                <div class="ep-progress-fill" :style="{ width: `${ep.playedPercentage}%` }"></div>
              </div>
            </div>
          </div>

          <div v-else class="ep-empty">暂无集数信息</div>
        </section>

        <!-- 合集内容 -->
        <section v-if="isBoxSet && (boxSetChildren.length > 0 || isLoadingChildren)" class="episodes-section glass-effect">
          <h2 class="section-title">合集内容</h2>

          <Loading v-if="isLoadingChildren" size="small" text="加载合集内容..." />

          <div v-else class="boxset-grid">
            <div
              v-for="child in boxSetChildren"
              :key="child.id"
              class="boxset-card"
              @click="router.push(`/detail/${child.id}`)"
            >
              <div class="boxset-poster">
                <img
                  :src="child.poster || embyStore.getPosterUrl(child.id, { width: 200, height: 300 })"
                  :alt="child.title"
                  loading="lazy"
                />
                <div class="boxset-overlay">
                  <span class="boxset-title">{{ child.title }}</span>
                  <span v-if="child.year" class="boxset-year">{{ child.year }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoadingChildren && boxSetChildren.length === 0" class="ep-empty">暂无内容</div>
        </section>

        <section v-if="media.directors && media.directors.length > 0" class="detail-section glass-effect">
          <h2>导演</h2>
          <p class="director">{{ media.directors.join('、') }}</p>
        </section>

        <section v-if="media.castInfo && media.castInfo.length > 0" class="detail-section glass-effect">
          <h2>演员</h2>
          <div class="cast-list">
            <div
              v-for="actor in media.castInfo.slice(0, 8)"
              :key="actor.id || actor.name"
              class="cast-item"
            >
              <div class="cast-avatar">
                <img v-if="actor.imageUrl" :src="actor.imageUrl" :alt="actor.name" class="cast-img" loading="lazy" @error="($event.target as HTMLImageElement).style.display='none'" />
                <span class="cast-initial">{{ actor.name[0] }}</span>
              </div>
              <span class="cast-name">{{ actor.name }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.detail-content {
  position: relative;
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 134px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text);
  transition: all 300ms ease-in-out;
  margin-bottom: 32px;
}

.btn-back:hover {
  background: var(--theme-hover);
}

.main-info {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

.poster {
  flex-shrink: 0;
  width: 200px;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  position: relative;
}

.poster img {
  width: 100%;
  height: auto;
  display: block;
}

.quality-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: #ffd700;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
}

.info {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 12px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
  color: var(--theme-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item.cert {
  padding: 2px 8px;
  background: var(--theme-active);
  border-radius: 6px;
  font-size: 12px;
}

.genre {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.genre-tag {
  padding: 5px 14px;
  background: var(--theme-active);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--theme-text-secondary);
}

.overview {
  font-size: 14px;
  line-height: 1.6;
  color: var(--theme-text-secondary);
  margin-bottom: 20px;
  max-width: 600px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-play {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--theme-accent);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
}

.btn-play:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.02);
}

.btn-play:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  background: var(--theme-active);
  color: var(--theme-text);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
}

.btn-secondary:hover {
  background: var(--theme-hover);
}

.btn-secondary.active {
  color: #ff2d55;
}

/* 季集列表 */
.episodes-section {
  padding: 20px;
  border-radius: var(--radius-card);
  margin-bottom: 16px;
}

.season-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--theme-border);
}

.season-tab {
  padding: 8px 16px;
  background: var(--theme-active);
  color: var(--theme-text-secondary);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 300ms ease-in-out;
}

.season-tab.active {
  background: var(--theme-accent);
  color: white;
}

.season-tab:hover:not(.active) {
  background: var(--theme-hover);
}

.episode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.episode-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--theme-active);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 300ms ease-in-out;
  overflow: hidden;
}

.episode-card:hover {
  background: var(--theme-hover);
  transform: translateY(-1px);
}

.episode-card.watched {
  opacity: 0.7;
}

.ep-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-accent-light);
  color: var(--theme-accent);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.ep-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ep-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--theme-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ep-duration {
  font-size: 11px;
  color: var(--theme-text-tertiary);
}

.ep-watched-badge {
  flex-shrink: 0;
}

.ep-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
}

.ep-progress-fill {
  height: 100%;
  background: var(--theme-accent);
  border-radius: 0 2px 0 0;
}

.ep-empty {
  text-align: center;
  padding: 24px;
  font-size: 13px;
  color: var(--theme-text-tertiary);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 16px;
}

.boxset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.boxset-card {
  cursor: pointer;
  transition: transform 300ms ease-in-out;
}

.boxset-card:hover {
  transform: scale(1.05);
}

.boxset-poster {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 2/3;
  background: var(--theme-active);
}

.boxset-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.boxset-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 8px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.boxset-title {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.boxset-year {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* 导演演员 */
.detail-section {
  padding: 20px 24px;
  border-radius: var(--radius-card);
  margin-bottom: 16px;
}

.detail-section h2 {
  font-size: 16px;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 14px;
}

.director {
  font-size: 14px;
  color: var(--theme-text-secondary);
}

.cast-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cast-item {
  flex-shrink: 0;
  text-align: center;
  width: 88px;
}

.cast-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 10px;
  background: var(--theme-accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.cast-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.cast-initial {
  font-size: 24px;
  font-weight: 600;
  color: var(--theme-accent);
  z-index: 0;
}

.cast-name {
  font-size: 13px;
  color: var(--theme-text-secondary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .main-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .poster {
    width: 180px;
  }

  .meta { justify-content: center; }
  .genre { justify-content: center; }
  .overview { max-width: 100%; }
  .actions { justify-content: center; }

  .episode-grid {
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
