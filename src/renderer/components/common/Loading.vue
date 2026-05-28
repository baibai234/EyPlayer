<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: '',
  fullscreen: false
})
</script>

<template>
  <div
    class="loading-container"
    :class="{
      fullscreen: fullscreen,
      [`size-${size}`]: true
    }"
  >
    <div class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--theme-bg);
  backdrop-filter: blur(20px);
  z-index: 1000;
}

.loading-spinner {
  position: relative;
}

.spinner {
  border: 3px solid var(--theme-border);
  border-top-color: var(--theme-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.size-small .spinner {
  width: 24px;
  height: 24px;
}

.size-medium .spinner {
  width: 36px;
  height: 36px;
}

.size-large .spinner {
  width: 48px;
  height: 48px;
}

.loading-text {
  font-size: 13px;
  color: var(--theme-text-secondary);
  text-align: center;
}

.size-small .loading-text {
  font-size: 12px;
}

.size-large .loading-text {
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
