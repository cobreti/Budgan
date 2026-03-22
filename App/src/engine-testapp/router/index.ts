import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@engineTestAppViews/Home/home.vue';
import { setupRouteTracking } from '@engineTestAppRouter/routeTracker.ts'
import Layout from '@engineTestAppViews/layout.vue'
import ZipFile from '@engineTestAppViews/zip-file/zip-file.vue'

export const router = createRouter({

    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:locale(en|fr)',
            component: Layout,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView
                },
                {
                    path: 'zip-file',
                    name: 'zip-file',
                    component: () => import('@engineTestAppViews/zip-file/zip-file.vue')
                }
            ]
        }
    ]
});

setupRouteTracking(router);
