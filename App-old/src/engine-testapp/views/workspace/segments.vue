<template>
  <section class="segments" data-testid="segments-view">
    <h3 class="segments__title">{{ t('workspace.segments.title') }}</h3>
    <p class="segments__description">{{ t('workspace.segments.description') }}</p>
    <p class="segments__account" data-testid="segments-account-name">
      {{ t('workspace.segments.account', { accountName: selectedAccount?.name }) }}
    </p>

    <div class="segments__import">
      <button
        class="segments__button"
        type="button"
        :disabled="isImporting"
        data-testid="segments-import-button"
        @click="fileInput?.click()"
      >
        {{ isImporting ? t('workspace.segments.import.importing') : t('workspace.segments.import.select') }}
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".csv,text/csv"
        class="segments__file-input"
        data-testid="segments-file-input"
        @change="onFileSelected"
      />
      <ExampleCsvPicker :disabled="isImporting" @file-selected="importFile" />
    </div>

    <p
      v-if="importSuccess"
      class="segments__success"
      data-testid="segments-import-success"
    >
      {{ t('workspace.segments.import.success', { segmentName: importSuccess }) }}
    </p>
    <p
      v-if="importError"
      class="segments__error"
      data-testid="segments-import-error"
    >
      {{ t('workspace.segments.import.error', { error: importError }) }}
    </p>

    <hr class="segments__separator" />

    <div class="segments__list-section">
      <h4 class="segments__list-title">{{ t('workspace.segments.list.title') }}</h4>
      <ul v-if="segments.length > 0" class="segments__list">
        <li
          v-for="segment in segments"
          :key="segment.id"
          class="segments__list-item"
          :data-testid="`segments-item-${segment.name}`"
        >
          <span class="segments__list-item-name">{{ segment.name }}</span>
          <span class="segments__list-item-meta">
            {{ t('workspace.segments.list.dateRange', { dateStart: segment.dateStartAsString, dateEnd: segment.dateEndAsString }) }}
          </span>
          <span class="segments__list-item-meta">
            {{ t('workspace.segments.list.rowCount', { count: segment.rows.length }) }}
          </span>
        </li>
      </ul>
      <p v-else class="segments__list-empty" data-testid="segments-list-empty">
        {{ t('workspace.segments.list.empty') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
  import ExampleCsvPicker from '@engineTestApp/components/example-csv-picker/example-csv-picker.vue'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()

  const fileInput = ref<HTMLInputElement | null>(null)
  const isImporting = ref(false)
  const importSuccess = ref<string | null>(null)
  const importError = ref<string | null>(null)

  const selectedAccount = computed(() => {
    if (!workspaceStore.selectedAccountId || !workspaceStore.currentWorkspace) return null
    const result = workspaceStore.currentWorkspace.getAccount(workspaceStore.selectedAccountId)
    return result?.success ? result.value : null
  })

  const segments = computed(() => selectedAccount.value?.segments ?? [])

  async function importFile(file: File): Promise<void> {
    importSuccess.value = null
    importError.value = null
    isImporting.value = true

    const result = await workspaceStore.importSegmentToSelectedAccount(file)

    isImporting.value = false

    if (result.success) {
      importSuccess.value = result.value.name
    } else {
      importError.value = result.error ?? 'Unknown error'
    }
  }

  async function onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    await importFile(file)
    if (fileInput.value) fileInput.value.value = ''
  }
</script>

<style scoped>
  @use 'colors-def';

  .segments {
    display: grid;
    gap: 0.75rem;
  }

  .segments__title,
  .segments__description,
  .segments__account {
    margin: 0;
  }

  .segments__description {
    color: var(--workspace-on-surface-variant);
  }

  .segments__account {
    font-weight: 600;
  }

  .segments__import {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .segments__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 999px;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
    cursor: pointer;
  }

  .segments__button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .segments__file-input {
    display: none;
  }

  .segments__success {
    margin: 0;
    color: var(--workspace-success);
  }

  .segments__error {
    margin: 0;
    color: var(--workspace-error);
  }

  .segments__separator {
    margin: 0.75rem 0;
    border: 0;
    border-top: 1px solid var(--workspace-outline);
    opacity: 0.2;
  }

  .segments__list-section {
    display: grid;
    gap: 0.75rem;
  }

  .segments__list-title {
    margin: 0;
    font-weight: 600;
  }

  .segments__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  .segments__list-item {
    display: grid;
    gap: 0.25rem;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface-variant-alpha-05);
  }

  .segments__list-item-name {
    font-weight: 600;
  }

  .segments__list-item-meta {
    font-size: 0.875rem;
    color: var(--workspace-on-surface-variant);
  }

  .segments__list-empty {
    margin: 0;
    color: var(--workspace-on-surface-variant);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .segments__button {
      width: 100%;
    }
  }
</style>
