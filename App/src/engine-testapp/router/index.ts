import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@engineTestAppViews/Home/home.vue'
import { setupRouteTracking } from '@engineTestAppRouter/routeTracker.ts'
import Layout from '@engineTestAppViews/layout.vue'

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
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@engineTestAppViews/settings/settings.vue'),
          children: [
            {
              path: '',
              redirect: { name: 'settings-column-mappings' }
            },
            {
              path: 'column-mappings',
              name: 'settings-column-mappings',
              component: () => import('@engineTestAppViews/settings/settings-column-mappings.vue')
            }
          ]
        },
        {
          path: 'workspace',
          name: 'workspace',
          component: () => import('@engineTestAppViews/workspace/workspace.vue'),
          children: [
            {
              path: '',
              redirect: {
                name: 'workspace-create'
              }
            },
            {
              path: 'create',
              name: 'workspace-create',
              component: () => import('@engineTestAppViews/workspace/workspace-create.vue')
            },
            {
              path: 'accounts',
              name: 'workspace-accounts',
              component: () => import('@engineTestAppViews/workspace/accounts.vue')
            },
            {
              path: 'segments',
              name: 'workspace-segments',
              component: () => import('@engineTestAppViews/workspace/segments.vue')
            }
          ]
        }
      ]
    }
  ]
})

setupRouteTracking(router)
