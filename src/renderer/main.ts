import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useSettingsStore } from './stores/settings'
import { useEmbyStore } from './stores/emby'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 启动时加载设置并自动连接
const settings = useSettingsStore()
settings.loadSettings()

const embyStore = useEmbyStore()
if (settings.apiKey && settings.serverUrl && settings.userId) {
  embyStore.connect({
    serverUrl: settings.serverUrl,
    apiKey: settings.apiKey,
    userId: settings.userId
  }).catch(() => {})
}

app.use(router)
app.mount('#app')
