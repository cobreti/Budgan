import type { Router } from 'vue-router'

/**
 * Setup navigation tracking to record the previous route path
 * This helps components determine where the user navigated from
 */
export function setupRouteTracking(router: Router): void {
    // Track where navigation came from
    router.beforeEach((to, from, next) => {
        // Store the 'from' path in the 'to' route's meta
        to.meta.from = from.path
        next()
    })
}
