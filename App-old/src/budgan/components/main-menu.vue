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
        <MainMenuItem
          v-if="workspaceStore.workspace"
          icon="mdi-trash-can"
          :label="t('mainMenu.clearWorkspace')"
          test-id="main-menu-clear-workspace"
          class="main-menu__item--danger"
          @click="onClearWorkspace"
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

      <template v-if="installPrompt">
        <hr class="main-menu__divider" />
        <div class="main-menu__section main-menu__section--install">
          <MainMenuItem
            icon="mdi-download"
            :label="t('mainMenu.installApp')"
            test-id="main-menu-install-app"
            @click="onInstallApp"
          />
        </div>
      </template>
    </nav>
  </v-navigation-drawer>

  <NewWorkspaceDialog v-model="showNewWorkspaceDialog" />
  <ColumnMappingDialog v-model="showColumnMappingDialog" />

  <v-snackbar
    v-model="showLoadError"
    color="error"
    :timeout="4000"
    data-testid="main-menu-load-error-snackbar"
  >
    {{ loadError }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppSettingsStore } from '@budgan/stores/appSettings-store.ts'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import MainMenuItem from '@budgan/components/main-menu-item.vue'
import NewWorkspaceDialog from '@budgan/components/new-workspace-dialog.vue'
import ColumnMappingDialog from '@budgan/components/column-mapping-dialog.vue'

const appSettingsStore = useAppSettingsStore()
const workspaceStore = useWorkspaceStore()
const { width } = useDisplay()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const drawerWidth = computed(() => width.value < 1024 ? width.value : 600)
const showNewWorkspaceDialog = ref(false)
const showColumnMappingDialog = ref(false)
const loadError = ref<string | null>(null)
const showLoadError = computed(() => !!loadError.value)

const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})

function onNewWorkspace() {
  appSettingsStore.toggleDrawer()
  showNewWorkspaceDialog.value = true
}

async function onOpenWorkspace() {
  appSettingsStore.toggleDrawer()
  loadError.value = null
  const result = await workspaceStore.loadWorkspace()
  if (!result.success && 'error' in result) {
    loadError.value = t('mainMenu.loadWorkspaceError')
  }
}

function onAccounts() {
  appSettingsStore.toggleDrawer()
  router.push({ name: 'accounts', params: { locale: localeParam.value } })
}

function onColumnMapping() {
  appSettingsStore.toggleDrawer()
  showColumnMappingDialog.value = true
}

function onClearWorkspace() {
  workspaceStore.clearWorkspace()
  appSettingsStore.toggleDrawer()
}

const installPrompt = ref<Event | null>(null)

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  installPrompt.value = e
}

onMounted(() => window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt))
onUnmounted(() => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt))

async function onInstallApp() {
  const prompt = installPrompt.value as (Event & { prompt(): Promise<void> }) | null
  if (!prompt) return
  await prompt.prompt()
  installPrompt.value = null
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.main-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
}

.main-menu__section {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
}

.main-menu__section :deep(.main-menu-item) {
  width: 120px;
}

.main-menu__divider {
  border: none;
  border-top: 1px solid var(--bdg-secondary);
  margin: 0 1rem;
  opacity: 0.3;
}

.main-menu__section--install {
  margin-top: auto;
}

.main-menu__item--danger {
  margin-left: auto;
}

.main-menu__item--danger :deep(.main-menu-item) {
  border-color: var(--bdg-error);
  color: var(--bdg-error);
}

.main-menu__item--danger :deep(.main-menu-item__icon) {
  color: var(--bdg-error);
}
</style>

