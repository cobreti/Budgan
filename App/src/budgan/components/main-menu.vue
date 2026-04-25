<template>
  <v-navigation-drawer
    v-model="appSettingsStore.appSettings.drawerVisible"
    temporary
    location="left"
    :width="drawerWidth"
    :style="{ bottom: 'var(--v-layout-bottom)' }"
    data-testid="main-menu"
  >
    <nav class="main-menu">
      <!-- menu items go here -->
    </nav>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'

const appSettingsStore = useAppSettingsStore()
const { width } = useDisplay()

const drawerWidth = computed(() => width.value < 1024 ? width.value : 600)
</script>

<style scoped>
@use '@/assets/colors-def.scss';


.main-menu {
  height: 100%;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
}
</style>

