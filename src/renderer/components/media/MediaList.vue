<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MediaCard from './MediaCard.vue'

interface MediaItem {
  id: string
  title: string
  poster?: string
  year?: number
  rating?: number
  type?: string
}

interface Props {
  title: string
  items: MediaItem[]
  showViewAll?: boolean
  loading?: boolean
  icon?: string
  cardVariant?: 'poster' | 'wide'
}

const props = withDefaults(defineProps<Props>(), {
  showViewAll: true,
  loading: false,
  icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  cardVariant: 'poster'
})

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'play', id: string): void
  (e: 'viewAll'): void
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const handleWheel = (e: WheelEvent) => {
  if (!scrollContainer.value) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    scrollContainer.value.scrollLeft += e.deltaY
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('wheel', handleWheel, { passive: false })
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('wheel', handleWheel)
  }
})
</script>

<template>
  <section class="media-list-section">
    <div class="list-header">
      <div class="list-title-group">
        <svg class="list-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path :d="icon" />
        </svg>
        <h3 class="list-title">{{ title }}</h3>
      </div>
      <button v-if="showViewAll" class="btn-view-all" @click="emit('viewAll')">
        查看全部
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>

    <div ref="scrollContainer" class="scroll-container">
      <div v-if="loading" class="loading-skeleton">
        <div v-for="i in 8" :key="i" class="skeleton-card">
          <div class="skeleton-poster"></div>
        </div>
      </div>

      <template v-else>
        <MediaCard
          v-for="item in items"
          :key="item.id"
          :id="item.id"
          :title="item.title"
          :poster="item.poster"
          :year="item.year"
          :rating="item.rating"
          :type="item.type"
          :variant="cardVariant"
          @click="(id) => emit('click', id)"
          @play="(id) => emit('play', id)"
        />
      </template>
    </div>
  </section>
</template>

<style scoped>
.media-list-section {
  width: 100%;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.list-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-icon {
  color: var(--theme-text-secondary);
}

.list-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text);
}

.btn-view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: transparent;
  color: var(--theme-text-tertiary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: all 300ms ease-in-out;
}

.btn-view-all:hover {
  color: var(--theme-text);
  background: var(--theme-hover);
}

.scroll-container {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

/* 加载骨架 */
.loading-skeleton {
  display: flex;
  gap: 14px;
}

.skeleton-card {
  flex: 0 0 150px;
}

.skeleton-poster {
  width: 150px;
  height: 225px;
  background: linear-gradient(90deg, var(--theme-primary) 25%, var(--theme-hover) 50%, var(--theme-primary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
