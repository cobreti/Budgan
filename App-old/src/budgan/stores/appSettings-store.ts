import { defineStore } from 'pinia'
import { type Ref, ref } from 'vue'

export type AppSettings = {
    drawerVisible: boolean
    version: string
}

export type AppSettingsStore = {
    appSettings: Ref<AppSettings>

    setVersion(version: string): void
    toggleDrawer(): void
}

export const useAppSettingsStore = defineStore<string, AppSettingsStore>('appSettings', () => {
    const appSettings = ref({
        drawerVisible: true,
        version: '0.0.0.0',
        csvSettings: {}
    })

    function setVersion(version: string) {
        appSettings.value = {
            ...appSettings.value,
            version
        }
    }

    function toggleDrawer() {
        appSettings.value.drawerVisible = !appSettings.value.drawerVisible
    }

    return {
        appSettings,
        setVersion,
        toggleDrawer
    }
})
