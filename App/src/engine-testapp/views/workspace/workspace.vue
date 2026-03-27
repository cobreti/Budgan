<template>
  <section class="workspace-view">
    <header class="workspace-view__header">
      <h2>{{ t('workspace.title') }}</h2>
      <p>{{ t('workspace.description') }}</p>
    </header>

    <div class="workspace-view__panel">
      <CsvSelection @csv-content-selected="onCsvContentSelected" />

      <section
        v-if="parsedJson"
        class="workspace-view__mapping"
        data-testid="workspace-mapping-panel"
      >
        <h3>{{ t('workspace.mapping.title') }}</h3>
        <p>{{ t('workspace.mapping.description') }}</p>

        <div class="workspace-view__mapping-grid">
          <div
            v-for="column in mappingColumns"
            :key="column.key"
            class="workspace-view__mapping-row"
          >
            <label :for="`mapping-${column.key}`" class="workspace-view__mapping-label">
              {{ t(column.labelKey) }}
              <span
                class="workspace-view__mapping-requirement"
                :class="{
                  'workspace-view__mapping-requirement--required': column.required,
                  'workspace-view__mapping-requirement--optional': !column.required
                }"
              >
                {{
                  column.required
                    ? t('workspace.mapping.required')
                    : t('workspace.mapping.optional')
                }}
              </span>
            </label>

            <select
              :id="`mapping-${column.key}`"
              class="workspace-view__mapping-select"
              :data-testid="`workspace-mapping-${column.key}`"
              :value="selectedColumns[column.key] ?? ''"
              @change="onMappingChange(column.key, $event)"
            >
              <option value="">{{ t('workspace.mapping.unmapped') }}</option>
              <option v-for="header in parsedJson.header" :key="header" :value="header">
                {{ header }}
              </option>
            </select>
          </div>
        </div>

        <p
          v-if="missingRequiredColumns.length > 0"
          class="workspace-view__error"
          data-testid="workspace-mapping-required-error"
        >
          {{ t('workspace.mapping.missingRequired', { columns: missingRequiredColumnsText }) }}
        </p>

        <button
          class="workspace-view__secondary-button"
          type="button"
          data-testid="workspace-apply-mapping"
          :disabled="!canApplyMapping"
          @click="applyMapping"
        >
          {{ t('workspace.mapping.apply') }}
        </button>

        <pre
          v-if="appliedMapping"
          class="workspace-view__json-output"
          data-testid="workspace-mapping-output"
        ><code>{{ formattedAppliedMapping }}</code></pre>
      </section>

      <div v-if="parsedJson" class="workspace-view__json-controls">
        <button
          class="workspace-view__secondary-button"
          type="button"
          data-testid="workspace-toggle-json"
          @click="toggleJsonVisibility"
        >
          {{ isJsonVisible ? t('workspace.hideJson') : t('workspace.showJson') }}
        </button>
      </div>

      <pre
        v-if="parsedJson && isJsonVisible"
        class="workspace-view__json-output"
        data-testid="workspace-json-output"
      ><code>{{ formattedJson }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CsvSelection from '../../components/csv-selection/csv-selection.vue'
  import {
    CsvColumns,
    type CsvColumnMapping,
    type CsvColumns as CsvColumnId
  } from '../../../engine/modules/csv-import/csv-column-content'
  import { type CsvContentExtractionResult } from '../../../engine/modules/csv-import/csv-content-extractor'

  type CsvMappingColumnDefinition = {
    key: CsvColumnId
    labelKey: string
    required: boolean
  }

  const mappingColumns: CsvMappingColumnDefinition[] = [
    {
      key: CsvColumns.cardNumber,
      labelKey: 'workspace.mapping.cardNumber',
      required: true
    },
    {
      key: CsvColumns.dateInscription,
      labelKey: 'workspace.mapping.dateInscription',
      required: false
    },
    {
      key: CsvColumns.dateTransaction,
      labelKey: 'workspace.mapping.dateTransaction',
      required: true
    },
    {
      key: CsvColumns.amount,
      labelKey: 'workspace.mapping.amount',
      required: true
    },
    {
      key: CsvColumns.description,
      labelKey: 'workspace.mapping.descriptionLabel',
      required: true
    }
  ]

  const { t } = useI18n()
  const parsedJson = ref<CsvContentExtractionResult | null>(null)
  const selectedColumns = ref<Partial<Record<CsvColumnId, string>>>({})
  const appliedMapping = ref<CsvColumnMapping | null>(null)
  const isJsonVisible = ref(false)

  const missingRequiredColumns = computed(() => {
    return mappingColumns.filter((column) => column.required && !selectedColumns.value[column.key])
  })

  const missingRequiredColumnsText = computed(() => {
    return missingRequiredColumns.value.map((column) => t(column.labelKey)).join(', ')
  })

  const canApplyMapping = computed(() => {
    return !!parsedJson.value && missingRequiredColumns.value.length === 0
  })

  const currentMapping = computed<CsvColumnMapping>(() => {
    const mapping: CsvColumnMapping = {}

    if (!parsedJson.value) {
      return mapping
    }

    for (const column of mappingColumns) {
      const selectedHeader = selectedColumns.value[column.key]
      if (!selectedHeader) {
        continue
      }

      const headerIndex = parsedJson.value.header.indexOf(selectedHeader)
      if (headerIndex >= 0) {
        mapping[column.key] = headerIndex
      }
    }

    return mapping
  })

  const formattedAppliedMapping = computed(() => {
    if (!appliedMapping.value) {
      return ''
    }

    return JSON.stringify(appliedMapping.value, null, 2)
  })

  const formattedJson = computed(() => {
    if (!parsedJson.value) {
      return ''
    }

    return JSON.stringify(parsedJson.value, null, 2)
  })

  function onCsvContentSelected(result: CsvContentExtractionResult | null): void {
    parsedJson.value = result
    selectedColumns.value = {}
    appliedMapping.value = null
    isJsonVisible.value = !!result
  }

  function onMappingChange(column: CsvColumnId, event: Event): void {
    const selectedHeader = (event.target as HTMLSelectElement).value

    if (!selectedHeader) {
      const updatedMapping = { ...selectedColumns.value }
      delete updatedMapping[column]
      selectedColumns.value = updatedMapping
      appliedMapping.value = null
      return
    }

    selectedColumns.value = {
      ...selectedColumns.value,
      [column]: selectedHeader
    }
    appliedMapping.value = null
  }

  function applyMapping(): void {
    if (!canApplyMapping.value) {
      return
    }

    appliedMapping.value = { ...currentMapping.value }
  }

  function toggleJsonVisibility(): void {
    isJsonVisible.value = !isJsonVisible.value
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

  .workspace-view__error {
    margin: 0;
    color: #b91c1c;
  }

  .workspace-view__mapping {
    display: grid;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .workspace-view__mapping h3,
  .workspace-view__mapping p {
    margin: 0;
  }

  .workspace-view__mapping-grid {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-view__mapping-row {
    display: grid;
    gap: 0.4rem;
  }

  .workspace-view__mapping-label {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .workspace-view__mapping-requirement {
    padding: 0.125rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .workspace-view__mapping-requirement--required {
    color: #9f1239;
    background-color: #ffe4e6;
  }

  .workspace-view__mapping-requirement--optional {
    color: #334155;
    background-color: #e2e8f0;
  }

  .workspace-view__mapping-select {
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.6rem;
    font: inherit;
    color: #0f172a;
    background-color: #ffffff;
  }

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

  .workspace-view__secondary-button {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    color: #0f172a;
  }

  .workspace-view__json-controls {
    display: flex;
  }

  .workspace-view__json-output {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background-color: #0f172a;
    color: #e2e8f0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .workspace-view__secondary-button {
      width: 100%;
    }
  }
</style>
