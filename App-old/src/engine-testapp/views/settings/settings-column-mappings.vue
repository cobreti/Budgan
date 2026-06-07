<template>
  <section class="settings-column-mappings" data-testid="settings-column-mappings-view">
    <h3 class="settings-column-mappings__title">{{ t('settings.columnMappings.title') }}</h3>
    <p class="settings-column-mappings__description">{{ t('settings.columnMappings.description') }}</p>

    <!-- Local CSV picker -->
    <div class="settings-column-mappings__csv-picker">
      <p class="settings-column-mappings__csv-label">{{ t('settings.columnMappings.localCsv.label') }}</p>

      <div
        class="settings-column-mappings__csv-status"
        :class="{
          'settings-column-mappings__csv-status--selected': localFileName,
          'settings-column-mappings__csv-status--empty': !localFileName
        }"
        data-testid="settings-local-csv-status"
      >
        <p class="settings-column-mappings__csv-status-text">
          {{
            localFileName
              ? t('settings.columnMappings.localCsv.selected', { fileName: localFileName })
              : t('settings.columnMappings.localCsv.hint')
          }}
        </p>
      </div>

      <div class="settings-column-mappings__csv-actions">
        <button
          class="settings-column-mappings__button"
          type="button"
          data-testid="settings-local-csv-open"
          @click="fileInput?.click()"
        >
          {{ t('settings.columnMappings.localCsv.select') }}
        </button>
        <button
          v-if="localFileName"
          class="settings-column-mappings__button settings-column-mappings__button--secondary"
          type="button"
          data-testid="settings-local-csv-clear"
          @click="clearLocalCsv"
        >
          {{ t('settings.columnMappings.localCsv.clear') }}
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept=".csv,text/csv"
        class="settings-column-mappings__file-input"
        data-testid="settings-local-csv-input"
        @change="onFileSelected"
      />

      <p
        v-if="parseError"
        class="settings-column-mappings__csv-error"
        data-testid="settings-local-csv-error"
      >
        {{ parseError }}
      </p>
    </div>

    <!-- Example CSV picker -->
    <div class="settings-column-mappings__csv-picker">
      <p class="settings-column-mappings__csv-label">{{ t('examples.label') }}</p>
      <ExampleCsvPicker @file-selected="loadCsvFile" />
    </div>

    <!-- Column mapping component -->
    <CsvColumnMapping
      v-if="localParsedJson"
      :parsed-json="localParsedJson"
      @update:complete="localMappingComplete = $event"
    />

    <p
      v-else
      class="settings-column-mappings__no-csv"
      data-testid="settings-mapping-no-csv"
    >
      {{ t('settings.columnMappings.noCsv') }}
    </p>

    <!-- JSON data preview — shown once all required columns are mapped -->
    <template v-if="localMappingComplete && localParsedJson">
      <hr class="settings-column-mappings__separator" />
      <div class="settings-column-mappings__json-preview" data-testid="settings-json-preview">
        <h4 class="settings-column-mappings__json-preview-title">
          {{ t('settings.columnMappings.jsonData.title') }}
        </h4>
        <div class="settings-column-mappings__json-controls">
          <button
            class="settings-column-mappings__button"
            type="button"
            data-testid="settings-json-toggle"
            @click="isJsonVisible = !isJsonVisible"
          >
            {{ isJsonVisible ? t('workspace.hideJson') : t('workspace.showJson') }}
          </button>
        </div>
        <pre
          v-if="isJsonVisible"
          class="settings-column-mappings__json-output"
          data-testid="settings-json-output"
        ><code>{{ formattedJson }}</code></pre>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CsvColumnMapping from '@engineTestApp/components/csv-column-mapping/csv-column-mapping.vue'
  import ExampleCsvPicker from '@engineTestApp/components/example-csv-picker/example-csv-picker.vue'
  import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'
  import type { CsvContentExtractionResult } from '@engine/modules/csv-import/csv-content-extractor'

  const { t } = useI18n()
  const csvContentExtractor = new CsvContentExtractor()

  const fileInput = ref<HTMLInputElement | null>(null)
  const localParsedJson = ref<CsvContentExtractionResult | null>(null)
  const localFileName = ref<string | null>(null)
  const parseError = ref('')
  const localMappingComplete = ref(false)
  const isJsonVisible = ref(false)

  const formattedJson = computed(() => {
    if (!localParsedJson.value) return ''
    return JSON.stringify(localParsedJson.value, null, 2)
  })


  async function loadCsvFile(file: File): Promise<void> {
    try {
      const csvText = await file.text()
      localParsedJson.value = csvContentExtractor.extract(csvText)
      localFileName.value = file.name
      parseError.value = ''
    } catch {
      parseError.value = t('settings.columnMappings.localCsv.parseError')
      localParsedJson.value = null
      localFileName.value = null
    }
  }

  async function onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      clearLocalCsv()
      return
    }

    const isCsvFile = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
    if (!isCsvFile) {
      input.value = ''
      parseError.value = t('settings.columnMappings.localCsv.parseError')
      return
    }

    await loadCsvFile(file)
  }

  function clearLocalCsv(): void {
    if (fileInput.value) fileInput.value.value = ''
    localParsedJson.value = null
    localFileName.value = null
    parseError.value = ''
    localMappingComplete.value = false
    isJsonVisible.value = false
  }
</script>

<style scoped>
  @use 'colors-def';

  .settings-column-mappings {
    display: grid;
    gap: 1rem;
  }

  .settings-column-mappings__title,
  .settings-column-mappings__description,
  .settings-column-mappings__no-csv,
  .settings-column-mappings__csv-label {
    margin: 0;
  }

  .settings-column-mappings__description,
  .settings-column-mappings__no-csv {
    color: var(--workspace-on-surface-variant);
  }

  /* Local CSV picker */
  .settings-column-mappings__csv-picker {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.75rem;
    background-color: var(--workspace-surface);
  }

  .settings-column-mappings__csv-label {
    font-weight: 600;
    color: var(--workspace-on-surface);
  }

  .settings-column-mappings__csv-status {
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
    border: 1px solid;
  }

  .settings-column-mappings__csv-status--selected {
    background-color: var(--csv-selection-status-selected-background);
    border-color: var(--csv-selection-status-selected-border);
  }

  .settings-column-mappings__csv-status--empty {
    background-color: var(--csv-selection-status-empty-background);
    border-color: var(--csv-selection-status-empty-border);
  }

  .settings-column-mappings__csv-status-text {
    margin: 0;
    font-weight: 500;
    color: var(--workspace-on-surface-variant);
  }

  .settings-column-mappings__csv-status--selected .settings-column-mappings__csv-status-text {
    color: var(--csv-selection-status-selected-text);
  }

  .settings-column-mappings__csv-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .settings-column-mappings__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    padding: 0.6rem 1.1rem;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
    background-color: var(--csv-selection-button-background);
    color: var(--csv-selection-button-text);
    border: none;
  }

  .settings-column-mappings__button--secondary {
    background-color: var(--csv-selection-secondary-button-background);
    color: var(--csv-selection-secondary-button-text);
    border: 1px solid var(--csv-selection-secondary-button-border);
  }

  .settings-column-mappings__csv-error {
    margin: 0;
    color: var(--csv-selection-error-text);
  }

  .settings-column-mappings__file-input {
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

  .settings-column-mappings__separator {
    margin: 0.5rem 0;
    border: 0;
    border-top: 1px solid var(--workspace-outline);
    opacity: 0.2;
  }

  .settings-column-mappings__json-preview {
    display: grid;
    gap: 0.75rem;
  }

  .settings-column-mappings__json-preview-title {
    margin: 0;
    font-weight: 600;
    color: var(--workspace-on-surface);
  }

  .settings-column-mappings__json-controls {
    display: flex;
  }

  .settings-column-mappings__json-output {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid var(--json-view-output-border);
    background-color: var(--json-view-output-background);
    color: var(--json-view-output-text);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .settings-column-mappings__csv-actions {
      flex-direction: column;
    }

    .settings-column-mappings__button {
      width: 100%;
    }
  }
</style>

