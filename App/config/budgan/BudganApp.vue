<template>
  <div>
    <v-app :full-height="true">
      <AppHeader />
      <v-main :scrollable="false">
        <RouterView />
      </v-main>
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

const appSettingsStore = useAppSettingsStore()
appSettingsStore.setVersion(settings.version)
</script>
