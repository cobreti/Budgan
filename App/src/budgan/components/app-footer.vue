<template>
  <v-footer app color="surface" class="app-footer">
    <span class="app-footer__version" data-testid="app-footer-version">v{{ version }}</span>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppSettingsStore } from '@/stores/appSettings-store.ts'

const appSettingsStore = useAppSettingsStore()
const version = computed(() => appSettingsStore.appSettings.version)
</script>

<style scoped>
@use '@/assets/colors-def.scss';

.app-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 1rem;
  min-height: 2rem;
  border-top: 1px solid var(--bdg-on-surface);
}

.app-footer__version {
  font-size: 0.75rem;
  opacity: 0.5;
  color: var(--bdg-on-surface);
}
</style>

