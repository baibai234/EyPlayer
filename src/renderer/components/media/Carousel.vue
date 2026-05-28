<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface CarouselItem {
  id: string
  title: string
  description?: string
  image: string
}

interface Props {
  items: CarouselItem[]
  autoplay?: boolean
  interval?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
  interval: 15000,
  height: 350
})

const emit = defineEmits<{
  (e: 'click', item: CarouselItem): void
  (e: 'slide-change', item: CarouselItem): void
}>()

const currentIndex = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const goToSlide = (index: number) => {
  currentIndex.value = index
  emit('slide-change', props.items[index])
}

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length
  emit('slide-change', props.items[currentIndex.value])
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length
  emit('slide-change', props.items[currentIndex.value])
}

const startAutoplay = () => {
  if (props.autoplay && props.items.length > 1) {
    autoplayTimer = setInterval(nextSlide, props.interval)
  }
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())
</script>

<template>
  <div
    class="carousel"
    :style="{ height: `${height}px` }"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="carousel-track">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="carousel-slide"
        :class="{ active: index === currentIndex }"
        @click="emit('click', item)"
      >
        <img :src="item.image" :alt="item.title" class="slide-image" />
        <div class="slide-overlay">
          <h2 class="slide-title">{{ item.title }}</h2>
          <p v-if="item.description" class="slide-description">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>

    <button v-if="items.length > 1" class="carousel-btn prev" @click.stop="prevSlide">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
      </svg>
    </button>
    <button v-if="items.length > 1" class="carousel-btn next" @click.stop="nextSlide">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
      </svg>
    </button>

    <div v-if="items.length > 1" class="carousel-dots">
      <button
        v-for="(_, index) in items"
        :key="index"
        class="dot"
        :class="{ active: index === currentIndex }"
        @click.stop="goToSlide(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.carousel {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 600ms ease-in-out;
  cursor: pointer;
}

.carousel-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48px 40px 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.slide-title {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.slide-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 500px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: #333;
  cursor: pointer;
  opacity: 0;
  transition: all 300ms ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
}

.carousel:hover .carousel-btn {
  opacity: 1;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.05);
}

.prev { left: 16px; }
.next { right: 16px; }

.carousel-dots {
  position: absolute;
  bottom: 16px;
  right: 24px;
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 300ms ease-in-out;
}

.dot.active {
  background: #fff;
  width: 24px;
  border-radius: 4px;
}
</style>
