<template>
  <section class="workspace-view">
    <header class="workspace-view__header">
      <h2>{{ t('workspace.title') }}</h2>
      <p>{{ t('workspace.description') }}</p>
    </header>

    <div class="workspace-view__panel">
      <p class="workspace-view__status" data-testid="workspace-status">
        {{
          selectedFile
            ? t('workspace.selected', { fileName: selectedFile.name })
            : t('workspace.empty')
        }}
      </p>

      <div class="workspace-view__actions">
        <button class="workspace-view__button" type="button" @click="openFilePicker">
          {{ t('workspace.select') }}
        </button>
        <button
          v-if="selectedFile"
          class="workspace-view__secondary-button"
          type="button"
          @click="clearSelection"
        >
          {{ t('workspace.clear') }}
        </button>
      </div>

      <input
        id="workspace-csv-input"
        data-testid="workspace-csv-input"
        class="workspace-view__file-input"
        type="file"
        accept=".csv,text/csv"
        @change="onFileSelected"
        ref="fileInput"
      />

      <p v-if="selectedFile" class="workspace-view__meta" data-testid="workspace-file-meta">
        {{ t('workspace.fileDetails', { size: formatFileSize(selectedFile.size) }) }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const fileInput = ref<HTMLInputElement | null>(null)
  const selectedFile = ref<File | null>(null)

  function openFilePicker(): void {
    fileInput.value?.click()
  }

  function onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      selectedFile.value = null
      return
    }

    const isCsvFile = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'

    if (!isCsvFile) {
      input.value = ''
      selectedFile.value = null
      return
    }

    selectedFile.value = file
  }

  function clearSelection(): void {
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    selectedFile.value = null
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
  .workspace-view {
    display: grid;
    gap: 1.5rem;
    max-width: 42rem;
  }

  .workspace-view__header {
    display: grid;
    gap: 0.5rem;
  }

  .workspace-view__header h2 {
    margin: 0;
  }

  .workspace-view__header p {
    margin: 0;
    color: #4b5563;
  }

  .workspace-view__panel {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid #d1d5db;
    border-radius: 1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
  }

  .workspace-view__status,
  .workspace-view__meta {
    margin: 0;
  }

  .workspace-view__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .workspace-view__button,
  .workspace-view__secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
  }

  .workspace-view__button {
    background-color: #0f766e;
    color: #ffffff;
  }

  .workspace-view__secondary-button {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    color: #0f172a;
  }

  .workspace-view__file-input {
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
    .workspace-view__actions {
      flex-direction: column;
    }

    .workspace-view__button,
    .workspace-view__secondary-button {
      width: 100%;
    }
  }
</style>
