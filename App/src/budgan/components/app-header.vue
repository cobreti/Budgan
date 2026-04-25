<template>
  <v-app-bar color="primary">
    <template #prepend>
      <v-app-bar-nav-icon
        class="app-header__menu-btn"
        data-testid="app-header-menu-btn"
        aria-label="Open menu"
        @click="appSettingsStore.toggleDrawer()"
      />
    </template>
    <template #title>
      <span class="app-header__title">{{ t('app.title') }}</span>
    </template>
    <WorkspaceInfoHeader />
  </v-app-bar>
</template>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.app-header__title {
  cursor: default;
  user-select: none;
}

.app-header__menu-btn {
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppSettingsStore } from '@budgan/stores/appSettings-store.ts'
import WorkspaceInfoHeader from '@budgan/components/workspace-info-header.vue'

const { t } = useI18n()
const appSettingsStore = useAppSettingsStore()
</script>

