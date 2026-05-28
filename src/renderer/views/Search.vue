<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import MediaCard from '@/components/media/MediaCard.vue'
import Loading from '@/components/common/Loading.vue'
import Error from '@/components/common/Error.vue'
import { useEmbyStore } from '@/stores/emby'
import { usePlayerStore } from '@/stores/player'
import type { MediaItem } from '@/types/emby'

const router = useRouter()
const embyStore = useEmbyStore()
const playerStore = usePlayerStore()

const searchQuery = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const errorMsg = ref('')
const searchResults = ref<MediaItem[]>([])

const recentSearches = ref<string[]>([])

onMounted(() => {
  const saved = localStorage.getItem('eyplayer-recent-searches')
  if (saved) {
    try {
      recentSearches.value = JSON.parse(saved)
    } catch {}
  }
})

function saveRecentSearches() {
  localStorage.setItem('eyplayer-recent-searches', JSON.stringify(recentSearches.value))
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  isSearching.value = true
  hasSearched.value = true
  errorMsg.value = ''

  if (!recentSearches.value.includes(query)) {
    recentSearches.value.unshift(query)
    if (recentSearches.value.length > 8) {
      recentSearches.value.pop()
    }
    saveRecentSearches()
  }

  try {
    searchResults.value = await embyStore.searchMedia(query)
  } catch (err: any) {
    errorMsg.value = err.message || '搜索失败'
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const handleQuickSearch = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

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

const clearRecentSearches = () => {
  recentSearches.value = []
  saveRecentSearches()
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  searchResults.value = []
}
</script>

<template>
  <div class="search-page">
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
        <div class="search-box glass-effect">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索电影、电视剧、动漫..."
            autofocus
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="btn-clear-input" @click="clearSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="search-content">
          <Loading v-if="isSearching" text="正在搜索..." />

          <Error v-else-if="errorMsg" :message="errorMsg" @retry="handleSearch" />

          <div v-else-if="hasSearched && searchResults.length > 0" class="search-results">
            <h2 class="results-title">
              搜索结果
              <span class="results-count">({{ searchResults.length }})</span>
            </h2>
            <div class="results-grid">
              <MediaCard
                v-for="item in searchResults"
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
          </div>

          <div v-else-if="hasSearched && searchResults.length === 0" class="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <h3>未找到相关内容</h3>
            <p>尝试使用不同的关键词搜索</p>
          </div>

          <div v-else class="search-home">
            <div v-if="recentSearches.length > 0" class="recent-section">
              <div class="section-header">
                <h3>最近搜索</h3>
                <button class="btn-clear" @click="clearRecentSearches">清除</button>
              </div>
              <div class="tags">
                <button
                  v-for="tag in recentSearches"
                  :key="tag"
                  class="tag"
                  @click="handleQuickSearch(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <div class="recent-section">
              <h3>热门分类</h3>
              <div class="tags">
                <button
                  v-for="lib in embyStore.libraries"
                  :key="lib.id"
                  class="tag"
                  @click="router.push(`/media?category=${lib.id}`)"
                >
                  {{ lib.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-page {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  padding-top: 130px;
  padding-bottom: 32px;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 32px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--radius-card);
  padding: 14px 20px;
  margin-bottom: 32px;
}

.search-icon {
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--theme-text);
}

.search-box input::placeholder {
  color: var(--theme-text-tertiary);
}

.btn-clear-input {
  flex-shrink: 0;
  padding: 4px;
  border-radius: 50%;
  transition: all 300ms ease-in-out;
}

.btn-clear-input:hover {
  background: var(--theme-hover);
}

.search-content {
  min-height: 300px;
}

.results-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 20px;
}

.results-count {
  font-size: 14px;
  color: var(--theme-text-tertiary);
  font-weight: 400;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 12px;
}

.no-results h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--theme-text);
}

.no-results p {
  font-size: 13px;
  color: var(--theme-text-secondary);
}

.search-home {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3,
.recent-section h3 {
  font-size: 15px;
  font-weight: 500;
  color: var(--theme-text);
}

.btn-clear {
  padding: 4px 8px;
  font-size: 12px;
  color: var(--theme-text-tertiary);
  border-radius: 6px;
  transition: all 300ms ease-in-out;
}

.btn-clear:hover {
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.08);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 8px 16px;
  background: var(--theme-active);
  color: var(--theme-text-secondary);
  border-radius: var(--radius-full);
  font-size: 13px;
  transition: all 300ms ease-in-out;
}

.tag:hover {
  background: var(--theme-accent-light);
  color: var(--theme-accent);
}

@media (max-width: 768px) {
  .page-container {
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
