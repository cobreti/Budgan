<template>
  <div class="csv-selection">
    <p class="csv-selection__status" data-testid="workspace-status">
      {{
        selectedFile
          ? t('workspace.selected', { fileName: selectedFile.name })
          : t('workspace.empty')
      }}
    </p>

    <div class="csv-selection__actions">
      <button class="csv-selection__button" type="button" @click="openFilePicker">
        {{ t('workspace.select') }}
      </button>
      <button
        v-if="selectedFile"
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

    <p v-if="selectedFile" class="csv-selection__meta" data-testid="workspace-file-meta">
      {{ t('workspace.fileDetails', { size: formatFileSize(selectedFile.size) }) }}
    </p>

    <p v-if="parseError" class="csv-selection__error" data-testid="workspace-parse-error">
      {{ parseError }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    CsvContentExtractor,
    type CsvContentExtractionResult
  } from '../../../engine/modules/csv-import/csv-content-extractor'

  const emit = defineEmits<{
    (e: 'csv-content-selected', result: CsvContentExtractionResult | null): void
  }>()

  const { t } = useI18n()
  const csvContentExtractor = new CsvContentExtractor()

  const fileInput = ref<HTMLInputElement | null>(null)
  const selectedFile = ref<File | null>(null)
  const parseError = ref('')

  function openFilePicker(): void {
    fileInput.value?.click()
  }

  async function onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      selectedFile.value = null
      parseError.value = ''
      emit('csv-content-selected', null)
      return
    }

    const isCsvFile = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'

    if (!isCsvFile) {
      input.value = ''
      selectedFile.value = null
      parseError.value = t('workspace.invalidCsv')
      emit('csv-content-selected', null)
      return
    }

    selectedFile.value = file

    try {
      const csvText = await file.text()
      const extractionResult = csvContentExtractor.analyze(csvText)
      parseError.value = ''
      emit('csv-content-selected', extractionResult)
    } catch {
      parseError.value = t('workspace.parseError')
      emit('csv-content-selected', null)
    }
  }

  function clearSelection(): void {
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    selectedFile.value = null
    parseError.value = ''
    emit('csv-content-selected', null)
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
  .csv-selection {
    display: grid;
    gap: 1rem;
  }

  .csv-selection__status,
  .csv-selection__meta {
    margin: 0;
  }

  .csv-selection__error {
    margin: 0;
    color: #b91c1c;
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
    background-color: #0f766e;
    color: #ffffff;
  }

  .csv-selection__secondary-button {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    color: #0f172a;
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
