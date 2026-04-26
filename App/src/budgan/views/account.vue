<template>
  <div class="account-view" data-testid="account-view">
    <p v-if="!account" class="account-view__not-found" data-testid="account-view-not-found">
      {{ t('account.notFound') }}
    </p>
    <template v-else>
      <div class="account-view__header">
        <h1 class="account-view__name" data-testid="account-view-name">{{ account.name }}</h1>

        <div class="account-view__toggle" data-testid="account-view-toggle">
          <button
            class="account-view__toggle-btn"
            :class="{ 'account-view__toggle-btn--active': activeView === 'segments' }"
            data-testid="account-view-toggle-segments"
            @click="activeView = 'segments'"
          >
            {{ t('account.viewSegments') }}
          </button>
          <button
            class="account-view__toggle-btn"
            :class="{ 'account-view__toggle-btn--active': activeView === 'transactions' }"
            data-testid="account-view-toggle-transactions"
            @click="activeView = 'transactions'"
          >
            {{ t('account.viewTransactions') }}
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
        </div>
      </div>

      <p v-if="importSuccess" class="account-view__success" data-testid="account-view-import-success">
        {{ t('account.importSuccess', { name: importSuccess }) }}
      </p>
      <p v-if="importError" class="account-view__error" data-testid="account-view-import-error">
        {{ importError }}
      </p>
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        class="account-view__file-input"
        data-testid="account-view-file-input"
        @change="onFileSelected"
      />

      <AccountSegmentList
        v-if="activeView === 'segments'"
        :segments="account.segments"
        :account-id="account.id"
      />
      <AccountTransactionList
        v-else
        :segments="account.segments"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import AccountSegmentList from '@budgan/components/account/account-segment-list.vue'
import AccountTransactionList from '@budgan/components/account/account-transaction-list.vue'

const { t } = useI18n()
const route = useRoute()
const workspaceStore = useWorkspaceStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const importError = ref<string | null>(null)
const importSuccess = ref<string | null>(null)
const activeView = ref<'segments' | 'transactions'>('segments')

const accountId = computed(() => {
  const id = route.params.accountId
  return typeof id === 'string' ? id : null
})

const account = computed(() =>
  workspaceStore.workspace?.accounts.find((a) => a.id === accountId.value) ?? null,
)

function triggerFileInput(): void {
  importError.value = null
  importSuccess.value = null
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !account.value) return

  importing.value = true
  importError.value = null
  importSuccess.value = null

  const result = await workspaceStore.importSegment(account.value.id, file)

  importing.value = false
  input.value = ''

  if (result.success) {
    importSuccess.value = result.value.name
  } else {
    importError.value = result.error ?? 'Unknown error'
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
