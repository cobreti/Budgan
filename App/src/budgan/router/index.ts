import { createRouter, createWebHistory } from 'vue-router'
import { setupRouteTracking } from './routeTracker.ts'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: []
})

// Setup route tracking to determine navigation source
setupRouteTracking(router)

export default router
