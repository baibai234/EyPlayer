<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getCachedImage } from '@/services/cache-service'

interface Props {
  id: string
  title: string
  poster?: string
  year?: number
  rating?: number
  type?: string
  variant?: 'poster' | 'wide'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'poster'
})

const emit = defineEmits<{
  (e: 'click', id: string): void
  (e: 'play', id: string): void
}>()

const imgSrc = ref(props.poster || '')

async function loadCachedPoster() {
  if (!props.poster) return
  const cached = await getCachedImage(props.poster)
  if (cached) imgSrc.value = cached
}

onMounted(() => loadCachedPoster())
watch(() => props.poster, () => loadCachedPoster())

const handleClick = () => {
  emit('click', props.id)
}
</script>

<template>
  <div class="media-card" :class="`variant-${variant}`" @click="handleClick">
    <div class="card-poster">
      <img
        :src="imgSrc || (variant === 'wide' ? `https://picsum.photos/400/225?random=${id}` : `https://picsum.photos/300/450?random=${id}`)"
        :alt="title"
        loading="lazy"
      />
      <div class="card-overlay">
        <span class="card-title">{{ title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.media-card {
  flex: 0 0 150px;
  cursor: pointer;
  transition: transform 300ms ease-in-out;
}

.media-card:hover {
  transform: scale(1.05);
}

.card-poster {
  position: relative;
  width: 150px;
  height: 225px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--theme-primary);
  box-shadow: var(--shadow-soft);
  transition: box-shadow 300ms ease-in-out;
}

.media-card:hover .card-poster {
  box-shadow: var(--shadow-hover);
}

.card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 10px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.card-title {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

/* 宽屏变体 16:9 */
.variant-wide {
  flex: 0 0 260px;
}

.variant-wide .card-poster {
  width: 260px;
  height: 146px;
}

.variant-wide .card-overlay {
  padding: 20px 10px 8px;
}

.variant-wide .card-title {
  font-size: 12px;
  -webkit-line-clamp: 1;
}
</style>
