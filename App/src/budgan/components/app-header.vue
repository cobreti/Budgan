<template>
  <v-app-bar color="teal-darken-4" title="Budgan">
    <template #append>
      v{{ version }}
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'

const appSettingsStore = useAppSettingsStore()
const version = computed(() => appSettingsStore.appSettings.version)
</script>

