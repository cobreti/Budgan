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
      <div class="main-menu__grid">
        <MainMenuItem
          icon="mdi-plus-box"
          label="New Workspace"
          test-id="main-menu-new-workspace"
          @click="onNewWorkspace"
        />
        <MainMenuItem
          icon="mdi-folder-open"
          label="Open Workspace"
          test-id="main-menu-open-workspace"
          @click="onOpenWorkspace"
        />
      </div>
    </nav>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'
import MainMenuItem from '@/components/main-menu-item.vue'

const appSettingsStore = useAppSettingsStore()
const { width } = useDisplay()

const drawerWidth = computed(() => width.value < 1024 ? width.value : 600)

function onNewWorkspace() {
  // TODO: handle new workspace
  appSettingsStore.toggleDrawer()
}

function onOpenWorkspace() {
  // TODO: handle open workspace
  appSettingsStore.toggleDrawer()
}
</script>

<style scoped>
@use '@/assets/colors-def.scss';

.main-menu {
  height: 100%;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
}

.main-menu__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
</style>

