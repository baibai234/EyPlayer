import { createRouter, createWebHashHistory } from 'vue-router'
import { useEmbyStore } from '@/stores/emby'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/media',
      name: 'Media',
      component: () => import('@/views/Media.vue')
    },
    {
      path: '/watching',
      name: 'Watching',
      component: () => import('@/views/Watching.vue')
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue')
    },
    {
      path: '/detail/:id',
      name: 'Detail',
      component: () => import('@/views/Detail.vue')
    }
  ]
})

router.beforeEach((to) => {
  if (to.name === 'Settings') return true
  const settings = useSettingsStore()
  if (settings.apiKey) return true
  return { name: 'Settings' }
})

export default router
