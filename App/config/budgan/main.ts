import '../../src/budgan/assets/main.scss'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import container from '@inversify/setup-inversify'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import BudganApp from './BudganApp.vue'
import router from '@/router'

const app = createApp(BudganApp)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate);

app.provide('container', container)

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1E3A8A',
                    'on-primary': '#FFFFFF',
                    secondary: '#3B82F6',
                    background: '#F8FAFC',
                    surface: '#FFFFFF',
                    success: '#10B981',
                    error: '#EF4444',
                }
            },
            dark: {
                colors: {
                    background: '#0F172A',
                    surface: '#1E293B',
                    primary: '#6366F1',
                    'on-primary': '#FFFFFF',
                    success: '#22C55E',
                    warning: '#F59E0B',
                    'on-background': '#E2E8F0',
                    'on-surface': '#E2E8F0',
                }
            }
        }
    },
    icons: {
        defaultSet: 'mdi'
    },
    components,
    directives
})

app.use<any>(vuetify, {
    options: {
        customProperties: true
    }
})

app.use(pinia)
app.use(router)

app.mount('#app')
