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
      <div class="main-menu__section">
        <MainMenuItem
          icon="mdi-plus-box"
          :label="t('mainMenu.newWorkspace')"
          test-id="main-menu-new-workspace"
          @click="onNewWorkspace"
        />
        <MainMenuItem
          icon="mdi-folder-open"
          :label="t('mainMenu.openWorkspace')"
          test-id="main-menu-open-workspace"
          @click="onOpenWorkspace"
        />
      </div>

      <template v-if="workspaceStore.workspace">
        <hr class="main-menu__divider" />
        <div class="main-menu__section">
          <MainMenuItem
            icon="mdi-bank"
            :label="t('mainMenu.accounts')"
            test-id="main-menu-accounts"
            @click="onAccounts"
          />
          <MainMenuItem
            icon="mdi-table-cog"
            :label="t('mainMenu.columnMapping')"
            test-id="main-menu-column-mapping"
            @click="onColumnMapping"
          />
        </div>
      </template>
    </nav>
  </v-navigation-drawer>

  <NewWorkspaceDialog v-model="showNewWorkspaceDialog" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppSettingsStore } from '@budgan/stores/appSettings-store.ts'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import MainMenuItem from '@budgan/components/main-menu-item.vue'
import NewWorkspaceDialog from '@budgan/components/new-workspace-dialog.vue'

const appSettingsStore = useAppSettingsStore()
const workspaceStore = useWorkspaceStore()
const { width } = useDisplay()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const drawerWidth = computed(() => width.value < 1024 ? width.value : 600)
const showNewWorkspaceDialog = ref(false)

const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})

function onNewWorkspace() {
  appSettingsStore.toggleDrawer()
  showNewWorkspaceDialog.value = true
}

function onOpenWorkspace() {
  // TODO: handle open workspace
  appSettingsStore.toggleDrawer()
}

function onAccounts() {
  appSettingsStore.toggleDrawer()
  router.push({ name: 'accounts', params: { locale: localeParam.value } })
}

function onColumnMapping() {
  appSettingsStore.toggleDrawer()
  router.push({ name: 'column-mapping', params: { locale: localeParam.value } })
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.main-menu {
  height: 100%;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
}

.main-menu__section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.main-menu__divider {
  border: none;
  border-top: 1px solid var(--bdg-secondary);
  margin: 0 1rem;
  opacity: 0.3;
}
</style>

