<template>
  <div>
    <v-app :full-height="true">
      <AppHeader />
      <MainMenu />
      <v-main :scrollable="false">
        <RouterView />
      </v-main>
      <AppFooter />
    </v-app>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'
import settings from '@/assets/settings.json'
import AppHeader from '@/components/app-header.vue'
import AppFooter from '@/components/app-footer.vue'
import MainMenu from '@/components/main-menu.vue'

const appSettingsStore = useAppSettingsStore()
appSettingsStore.setVersion(settings.version)
</script>
