<script setup lang="ts">
interface Props {
  title?: string
  message: string
  showRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '出错了',
  showRetry: true
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="error-container glass-effect">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--theme-text-tertiary)">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" class="btn-retry" @click="handleRetry">
      重试
    </button>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  border-radius: var(--radius-card);
  max-width: 400px;
  margin: 40px auto;
}

.error-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text);
  margin-top: 16px;
  margin-bottom: 8px;
}

.error-message {
  font-size: 13px;
  color: var(--theme-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.btn-retry {
  padding: 10px 24px;
  background: var(--theme-accent);
  color: white;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  transition: all 300ms ease-in-out;
}

.btn-retry:hover {
  opacity: 0.9;
}
</style>
