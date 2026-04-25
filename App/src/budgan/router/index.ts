import { createRouter, createWebHistory } from 'vue-router'
import { setupRouteTracking } from './routeTracker.ts'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/en' },
        {
            path: '/:locale(en|fr)',
            name: 'home',
            component: () => import('@budgan/views/home.vue'),
        },
    ]
})

setupRouteTracking(router)

export { router }
export default router
