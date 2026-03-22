import '@/engine-testapp/assets/main.scss'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import container from '../../src/inversify/setup-inversify'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import EngineTestApp from './EngineTestApp.vue'
import { router } from '@engineTestAppRouter/index.ts'
import { i18n } from '@engineTestApp/i18n.ts'

const app = createApp(EngineTestApp)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate);

app.provide('container', container)

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'blue-light',
        themes: {
            'blue-dark': {
                dark: true,
                colors: {
                    primary: '#90CAF9', // Lighter, desaturated blue (Blue Lighten-3)
                    secondary: '#B0BEC5', // Blue-Grey Lighten-1 for softer contrast
                    accent: '#82B1FF', // Keeping your light blue accent
                    surface: '#1E1E1E', // Standard Dark Surface (Cards/Menus)
                    background: '#121212', // Deep Dark Background
                    error: '#CF6679', // Desaturated Red (Standard for Dark Mode)
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FB8C00'
                }
            },
            'blue-light': {
                dark: false,
                colors: {
                    primary: '#1976D2', // Stronger blue (better for light backgrounds)
                    'primary-variant': '#1565C0',
                    secondary: '#424242', // Dark grey for contrast
                    accent: '#82B1FF', // Light blue accent (still works here)
                    surface: '#FFFFFF', // MUST be white or very light for light mode
                    background: '#F5F7FA', // A very subtle cool/blue-grey background
                    error: '#FF5252', // Vibrant red (standard for light mode)
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107'
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



app.use(i18n);
app.use(pinia)
app.use(router)

app.mount('#app')
