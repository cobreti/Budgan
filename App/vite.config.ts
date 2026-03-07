import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import sassDts from 'vite-plugin-sass-dts'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 8000,
        host: '0.0.0.0'
    },
    build: {
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
    plugins: [vue(), sassDts(), vueJsx(), tsconfigPaths()],
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
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@XmlParser': fileURLToPath(new URL('./src/core/modules/XmlParser', import.meta.url)),
            '@models': fileURLToPath(new URL('./src/core/models', import.meta.url)),
            '@services': fileURLToPath(new URL('./src/core/services', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@libComponents': fileURLToPath(new URL('./src/libComponents', import.meta.url)),
            '@filters': fileURLToPath(new URL('./src/core/models/filters', import.meta.url)),
            '@views': fileURLToPath(new URL('./src/views', import.meta.url))
        }
    }
})
