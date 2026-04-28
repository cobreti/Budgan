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
            children: [
                {
                    path: 'accounts',
                    name: 'accounts',
                    component: () => import('@budgan/views/accounts.vue'),
                },
                {
                    path: 'accounts/:accountId',
                    name: 'account',
                    component: () => import('@budgan/views/account.vue'),
                    redirect: (to) => ({ name: 'account-statements', params: to.params }),
                    children: [
                        {
                            path: 'statements',
                            name: 'account-statements',
                            component: () => import('@budgan/views/account-statements.vue'),
                        },
                        {
                            path: 'transactions',
                            name: 'account-transactions',
                            component: () => import('@budgan/views/account-transactions.vue'),
                        },
                    ],
                },
            ],
        },
    ]
})

setupRouteTracking(router)

export { router }
export default router
