<template>
  <div class="account-view" data-testid="account-view">
    <p v-if="!account" class="account-view__not-found" data-testid="account-view-not-found">
      {{ t('account.notFound') }}
    </p>
    <template v-else>
      <div class="account-view__header">
        <div class="account-view__title">
          <button
            class="account-view__back-btn"
            data-testid="account-view-back"
            @click="goToAccounts"
          >
            <v-icon class="account-view__back-btn-icon" icon="mdi-chevron-left" size="24" />
          </button>
          <h1 class="account-view__name" data-testid="account-view-name">{{ account.name }}</h1>
        </div>

        <div class="account-view__toggle" data-testid="account-view-toggle">
          <button
            class="account-view__toggle-btn"
            :class="{ 'account-view__toggle-btn--active': activeView === 'segments' }"
            data-testid="account-view-toggle-segments"
            @click="router.push({ name: 'account-statements', params: route.params })"
          >
            {{ t('account.viewSegments') }}
          </button>
          <button
            class="account-view__toggle-btn"
            :class="{ 'account-view__toggle-btn--active': activeView === 'transactions' }"
            data-testid="account-view-toggle-transactions"
            @click="router.push({ name: 'account-transactions', params: route.params })"
          >
            {{ t('account.viewTransactions') }}
          </button>
          <button
            class="account-view__toggle-btn"
            :class="{ 'account-view__toggle-btn--active': activeView === 'graphs' }"
            data-testid="account-view-toggle-graphs"
            @click="router.push({ name: 'account-graphs', params: route.params })"
          >
            {{ t('account.viewGraphs') }}
          </button>
        </div>

        <div class="account-view__header-actions">
          <button
            class="account-view__import-btn"
            data-testid="account-view-import-csv"
            :disabled="importing"
            @click="triggerFileInput"
          >
            <v-icon class="account-view__import-btn-icon" icon="mdi-upload" size="18" />
            <span>{{ importing ? t('account.importCsvLoading') : t('account.importCsv') }}</span>
          </button>
          <ExampleCsvPicker :disabled="importing" @file-selected="importFile" />
        </div>
      </div>

      <p v-if="importSuccess" class="account-view__success" data-testid="account-view-import-success">
        {{ importSuccess }}
      </p>
      <p v-if="importError" class="account-view__error" data-testid="account-view-import-error">
        {{ importError }}
      </p>
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        multiple
        class="account-view__file-input"
        data-testid="account-view-file-input"
        @change="onFileSelected"
      />

      <RouterView />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import ExampleCsvPicker from '@budgan/components/example-csv-picker.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const importError = ref<string | null>(null)
const importSuccess = ref<string | null>(null)

const activeView = computed(() => {
  if (route.name === 'account-transactions') return 'transactions'
  if (route.name === 'account-graphs') return 'graphs'
  return 'segments'
})

const accountId = computed(() => {
  const id = route.params.accountId
  return typeof id === 'string' ? id : null
})

const account = computed(() =>
  workspaceStore.workspace?.accounts.find((a) => a.id === accountId.value) ?? null,
)

function goToAccounts(): void {
  const locale = typeof route.params.locale === 'string' ? route.params.locale : 'en'
  router.push({ name: 'accounts', params: { locale } })
}

function triggerFileInput(): void {
  importError.value = null
  importSuccess.value = null
  fileInputRef.value?.click()
}

async function importFile(file: File): Promise<void> {
  if (!account.value) return

  importing.value = true
  importError.value = null
  importSuccess.value = null

  const result = await workspaceStore.importSegment(account.value.id, file)

  importing.value = false

  if (result.success) {
    importSuccess.value = t('account.importSuccess', { name: result.value.name })
  } else {
    importError.value = result.error ?? 'Unknown error'
  }
}

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0 || !account.value) return

  importing.value = true
  importError.value = null
  importSuccess.value = null
  const importedSegmentNames: string[] = []
  const failedFileNames: string[] = []
  let firstError: string | null = null

  for (const file of files) {
    const result = await workspaceStore.importSegment(account.value.id, file)

    if (result.success) {
      importedSegmentNames.push(result.value.name)
      continue
    }

    failedFileNames.push(file.name)
    if (!firstError && result.error) {
      firstError = result.error
    }
  }

  importing.value = false
  input.value = ''

  if (importedSegmentNames.length === 1) {
    importSuccess.value = t('account.importSuccess', { name: importedSegmentNames[0] })
  } else if (importedSegmentNames.length > 1) {
    importSuccess.value = t('account.importSuccessMultiple', { n: importedSegmentNames.length })
  }

  if (failedFileNames.length === 1 && importedSegmentNames.length === 0) {
    importError.value = firstError ?? 'Unknown error'
  } else if (failedFileNames.length > 0) {
    importError.value = t('account.importErrorMultiple', {
      n: failedFileNames.length,
      files: failedFileNames.join(', '),
    })
  }
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-view {
  padding: 1.5rem;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
  height: 100%;
}

.account-view__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.account-view__title {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.account-view__back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--bdg-on-surface);
  cursor: pointer;
}

.account-view__back-btn-icon {
  pointer-events: none;
  color: currentColor;
}

.account-view__header-actions {
  display: flex;
  justify-content: flex-end;
}

.account-view__toggle {
  display: flex;
  border: 1px solid var(--bdg-secondary);
  border-radius: 999px;
  overflow: hidden;
}

.account-view__toggle-btn {
  padding: 0.3rem 1rem;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  background: transparent;
  color: var(--bdg-on-surface);
  border: none;
  transition: background-color 0.15s, color 0.15s;
}

.account-view__toggle-btn--active {
  background-color: var(--bdg-primary);
  color: #ffffff;
}

.account-view__name {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--bdg-primary);
}

.account-view__not-found {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}

.account-view__import-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 8px;
  background-color: var(--bdg-surface);
  color: var(--bdg-on-surface);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.account-view__import-btn:hover:not(:disabled) {
  background-color: var(--bdg-accent);
  color: var(--bdg-surface);
}

.account-view__import-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.account-view__import-btn-icon {
  pointer-events: none;
}

.account-view__file-input {
  display: none;
}

.account-view__success {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--bdg-accent);
}

.account-view__error {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--bdg-error);
}
</style>
