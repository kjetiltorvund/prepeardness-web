import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // Hash history keeps client-side routes working on static hosts such as GitHub Pages.
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
  ],
})

// Every route requires a signed in user unless it is marked as public
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.name === 'login' && authStore.hasValidToken()) {
    return { path: '/' }
  }
  if (!to.meta.public && !authStore.hasValidToken()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
