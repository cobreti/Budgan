import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import sassDts from 'vite-plugin-sass-dts'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8000,
        host: '0.0.0.0'
    },
    build: {
        outDir: '../../dist/Budgan',
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    const fileName = assetInfo.name || ''
                    if (/\.(css|scss|sass)$/.test(fileName)) {
                        return `assets/css/[name]-[hash][extname]`
                    }
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
                        return `assets/images/[name]-[hash][extname]`
                    }
                    if (/\.(ttf|woff2|woff|eot)$/.test(fileName)) {
                        return `assets/fonts/[name]-[hash][extname]`
                    }
                    return `assets/[name]-[hash][extname]`
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js'
            }
        }
    },
    plugins: [
        vue(),
        sassDts(),
        vueJsx(),
        tsconfigPaths(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: false,
            },
            manifest: {
                id: '/',
                name: 'Budgan',
                short_name: 'Budgan',
                description: 'CSV bank statement import and workspace management',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#1e1e2e',
                icons: [
                    { src: '/images/Budgan48.png',  sizes: '48x48',   type: 'image/png' },
                    { src: '/images/Budgan180.png', sizes: '180x180', type: 'image/png' },
                    { src: '/images/Budgan256.png', sizes: '256x256', type: 'image/png' },
                ],
              screenshots: [
                {
                  src: '/images/screenshots/desktop-landscape.png',
                  sizes: '1140x853',
                  type: 'image/png',
                  form_factor: 'wide',
                },
                {
                  src: '/images/screenshots/desktop-portrait.png',
                  sizes: '518x690',
                  type: 'image/png',
                  form_factor: 'narrow',
                }
              ]
            }
        })
    ],
    optimizeDeps: {
        esbuildOptions: {
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true
                }
            }
        }
    },
    resolve: {
        alias: {
            '@budgan': fileURLToPath(new URL('../../src/budgan', import.meta.url)),
            '@budganI18n': fileURLToPath(new URL('../../src/budgan/i18n', import.meta.url)),
            // '@XmlParser': fileURLToPath(new URL('../../src/core/modules/XmlParser', import.meta.url)),
            // '@models': fileURLToPath(new URL('../../src/core/models', import.meta.url)),
            // '@services': fileURLToPath(new URL('../../src/core/services', import.meta.url)),
            // '@components': fileURLToPath(new URL('../../src/components', import.meta.url)),
            // '@libComponents': fileURLToPath(new URL('../..src/libComponents', import.meta.url)),
            // '@filters': fileURLToPath(new URL('../../src/core/models/filters', import.meta.url)),
            // '@views': fileURLToPath(new URL('../../src/views', import.meta.url)),
            '@engine': fileURLToPath(new URL('../../src/engine', import.meta.url)),
            '@inversify': fileURLToPath(new URL('../../src/inversify', import.meta.url))
        }
    }
})
