import '../../src/assets/main.css'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { container } from '../../src/inversify/setup-inversify'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import router from '@/budgan/router'
import EngineTestApp from '../../src/EngineTestApp.vue'

const app = createApp(EngineTestApp)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate);

app.provide('container', container)

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            dark: {
                colors: {
                    // "primary": colors.blue.darken3,
                    // "secondary": colors.cyan.accent1,
                    // "surface": colors.lightBlue.darken4
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
