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
      <button
        type="button"
        class="app-header__title"
        data-testid="app-header-title"
        @click="onTitleClick"
      >
        {{ t('app.title') }}
      </button>
    </template>
    <template #append>
      <WorkspaceInfoHeader />
      <LanguageSwitcher class="app-header__language-switcher" />
    </template>
  </v-app-bar>
</template>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.app-header__title {
  border: none;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  user-select: none;
}

.app-header__menu-btn {
  cursor: pointer;
}

.app-header__language-switcher {
  margin-left: 0.75rem;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppSettingsStore } from '@budgan/stores/appSettings-store.ts'
import WorkspaceInfoHeader from '@budgan/components/workspace-info-header.vue'
import LanguageSwitcher from '@budgan/components/language-switcher.vue'

const { t } = useI18n()
const appSettingsStore = useAppSettingsStore()
const route = useRoute()
const router = useRouter()

const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})

function onTitleClick() {
  router.push({ name: 'home', params: { locale: localeParam.value } })
}
</script>

