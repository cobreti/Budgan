import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@engineTestAppViews/Home/home.vue'
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
        },
        {
          path: 'workspace',
          name: 'workspace',
          component: () => import('@engineTestAppViews/workspace/workspace.vue'),
          children: [
            {
              path: '',
              redirect: {
                name: 'workspace-csv-selection'
              }
            },
            {
              path: 'create',
              name: 'workspace-create',
              component: () => import('@engineTestAppViews/workspace/workspace-create.vue')
            },
            {
              path: 'add-account',
              name: 'workspace-account-add',
              component: () => import('@engineTestAppViews/workspace/account-add.vue')
            },
            {
              path: 'csv-selection',
              name: 'workspace-csv-selection',
              component: () => import('@engineTestAppViews/workspace/workspace-csv-selection.vue')
            },
            {
              path: 'column-mapping',
              name: 'workspace-column-mapping',
              component: () => import('@engineTestAppViews/workspace/workspace-column-mapping.vue')
            },
            {
              path: 'json-data-view',
              name: 'workspace-json-data-view',
              component: () => import('@engineTestAppViews/workspace/workspace-json-data-view.vue')
            }
          ]
        }
      ]
    }
  ]
})

setupRouteTracking(router)
