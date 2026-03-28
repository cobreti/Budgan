<template>
  <div class="csv-selection">
    <div
      class="csv-selection__status"
      :class="{
        'csv-selection__status--selected': workspaceStore.selectedFileName,
        'csv-selection__status--empty': !workspaceStore.selectedFileName
      }"
      data-testid="workspace-status"
    >
      <p class="csv-selection__status-text">
        {{
          workspaceStore.selectedFileName
            ? t('workspace.selected', { fileName: workspaceStore.selectedFileName })
            : t('workspace.empty')
        }}
      </p>
    </div>

    <div class="csv-selection__actions">
      <button class="csv-selection__button" type="button" @click="openFilePicker">
        {{ t('workspace.select') }}
      </button>
      <button
        v-if="workspaceStore.selectedFileName"
        class="csv-selection__secondary-button"
        type="button"
        @click="clearSelection"
      >
        {{ t('workspace.clear') }}
      </button>
    </div>

    <input
      id="workspace-csv-input"
      data-testid="workspace-csv-input"
      class="csv-selection__file-input"
      type="file"
      accept=".csv,text/csv"
      ref="fileInput"
      @change="onFileSelected"
    />

    <p
      v-if="workspaceStore.selectedFileSize !== null"
      class="csv-selection__meta"
      data-testid="workspace-file-meta"
    >
      {{ t('workspace.fileDetails', { size: formatFileSize(workspaceStore.selectedFileSize) }) }}
    </p>

    <p v-if="parseError" class="csv-selection__error" data-testid="workspace-parse-error">
      {{ parseError }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import { CsvContentExtractor } from '../../../engine/modules/csv-import/csv-content-extractor'

  const { t } = useI18n()
  const csvContentExtractor = new CsvContentExtractor()
  const workspaceStore = useWorkspaceStore()

  const fileInput = ref<HTMLInputElement | null>(null)
  const parseError = ref('')

  function openFilePicker(): void {
    fileInput.value?.click()
  }

  async function onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      workspaceStore.setSelectedFile(null)
      parseError.value = ''
      workspaceStore.setParsedJson(null)
      return
    }

    const isCsvFile = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'

    if (!isCsvFile) {
      input.value = ''
      workspaceStore.setSelectedFile(null)
      parseError.value = t('workspace.invalidCsv')
      workspaceStore.setParsedJson(null)
      return
    }

    workspaceStore.setSelectedFile(file)

    try {
      const csvText = await file.text()
      const extractionResult = csvContentExtractor.extract(csvText)
      parseError.value = ''
      workspaceStore.setParsedJson(extractionResult)
    } catch {
      parseError.value = t('workspace.parseError')
      workspaceStore.setParsedJson(null)
    }
  }

  function clearSelection(): void {
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    workspaceStore.setSelectedFile(null)
    parseError.value = ''
    workspaceStore.setParsedJson(null)
  }

  function formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`
    }

    const sizeInKilobytes = sizeInBytes / 1024
    return `${sizeInKilobytes.toFixed(1)} KB`
  }
</script>

<style scoped>
  @use 'colors-def';

  .csv-selection {
    display: grid;
    gap: 1rem;
  }

  .csv-selection__status {
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid;
  }

  .csv-selection__status--selected {
    background-color: var(--csv-selection-status-selected-background);
    border-color: var(--csv-selection-status-selected-border);
  }

  .csv-selection__status--empty {
    background-color: var(--csv-selection-status-empty-background);
    border-color: var(--csv-selection-status-empty-border);
  }

  .csv-selection__status-text {
    margin: 0;
    font-weight: 500;
  }

  .csv-selection__status--selected .csv-selection__status-text {
    color: var(--csv-selection-status-selected-text);
  }

  .csv-selection__status--empty .csv-selection__status-text {
    color: var(--csv-selection-status-empty-text);
  }

  .csv-selection__meta {
    margin: 0;
  }

  .csv-selection__error {
    margin: 0;
    color: var(--csv-selection-error-text);
  }

  .csv-selection__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .csv-selection__button,
  .csv-selection__secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
  }

  .csv-selection__button {
    background-color: var(--csv-selection-button-background);
    color: var(--csv-selection-button-text);
  }

  .csv-selection__secondary-button {
    border: 1px solid var(--csv-selection-secondary-button-border);
    background-color: var(--csv-selection-secondary-button-background);
    color: var(--csv-selection-secondary-button-text);
  }

  .csv-selection__file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 640px) {
    .csv-selection__actions {
      flex-direction: column;
    }

    .csv-selection__button,
    .csv-selection__secondary-button {
      width: 100%;
    }
  }
</style>
