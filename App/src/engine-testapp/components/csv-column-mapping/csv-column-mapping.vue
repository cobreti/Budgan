<template>
  <section class="csv-column-mapping" data-testid="workspace-mapping-panel">
    <h3>{{ t('workspace.mapping.title') }}</h3>
    <p>{{ t('workspace.mapping.description') }}</p>

    <div class="csv-column-mapping__grid">
      <div v-for="column in mappingColumns" :key="column.key" class="csv-column-mapping__row">
        <label :for="`mapping-${column.key}`" class="csv-column-mapping__label">
          {{ t(column.labelKey) }}
          <span
            class="csv-column-mapping__requirement"
            :class="{
              'csv-column-mapping__requirement--required': column.required,
              'csv-column-mapping__requirement--optional': !column.required
            }"
          >
            {{
              column.required ? t('workspace.mapping.required') : t('workspace.mapping.optional')
            }}
          </span>
        </label>

        <select
          :id="`mapping-${column.key}`"
          class="csv-column-mapping__select"
          :data-testid="`workspace-mapping-${column.key}`"
          :value="selectedColumns[column.key] ?? ''"
          @change="onMappingChange(column.key, $event)"
        >
          <option value="">{{ t('workspace.mapping.unmapped') }}</option>
          <option v-for="header in csvHeaders" :key="header" :value="header">
            {{ header }}
          </option>
        </select>
      </div>
    </div>

    <p
      v-if="missingRequiredColumns.length > 0"
      class="csv-column-mapping__error"
      data-testid="workspace-mapping-required-error"
    >
      {{ t('workspace.mapping.missingRequired', { columns: missingRequiredColumnsText }) }}
    </p>

    <button
      class="csv-column-mapping__button"
      type="button"
      data-testid="workspace-apply-mapping"
      :disabled="!canApplyMapping"
      @click="applyMapping"
    >
      {{ t('workspace.mapping.apply') }}
    </button>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import {
    CsvColumns,
    type CsvColumnMapping,
    type CsvColumns as CsvColumnId
  } from '../../../engine/modules/csv-import/csv-column-content'

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
  const workspaceStore = useWorkspaceStore()
  const selectedColumns = ref<Partial<Record<CsvColumnId, string>>>({})
  const csvHeaders = computed(() => workspaceStore.parsedJson?.header ?? [])

  const missingRequiredColumns = computed(() => {
    return mappingColumns.filter((column) => column.required && !selectedColumns.value[column.key])
  })

  const missingRequiredColumnsText = computed(() => {
    return missingRequiredColumns.value.map((column) => t(column.labelKey)).join(', ')
  })

  const canApplyMapping = computed(() => {
    return missingRequiredColumns.value.length === 0
  })

  const currentMapping = computed<CsvColumnMapping>(() => {
    const mapping: CsvColumnMapping = {}

    for (const column of mappingColumns) {
      const selectedHeader = selectedColumns.value[column.key]
      if (!selectedHeader) {
        continue
      }

      const headerIndex = csvHeaders.value.indexOf(selectedHeader)
      if (headerIndex >= 0) {
        mapping[column.key] = headerIndex
      }
    }

    return mapping
  })

  watch(
    () => workspaceStore.parsedJson,
    () => {
      selectedColumns.value = {}
      workspaceStore.setAppliedMapping(null)
    }
  )

  function onMappingChange(column: CsvColumnId, event: Event): void {
    const selectedHeader = (event.target as HTMLSelectElement).value

    if (!selectedHeader) {
      const updatedMapping = { ...selectedColumns.value }
      delete updatedMapping[column]
      selectedColumns.value = updatedMapping
      workspaceStore.setAppliedMapping(null)
      return
    }

    selectedColumns.value = {
      ...selectedColumns.value,
      [column]: selectedHeader
    }
    workspaceStore.setAppliedMapping(null)
  }

  function applyMapping(): void {
    if (!canApplyMapping.value) {
      return
    }

    workspaceStore.setAppliedMapping({ ...currentMapping.value })
  }
</script>

<style scoped>
  @use 'colors-def';

  .csv-column-mapping {
    display: grid;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--column-mapping-border);
  }

  .csv-column-mapping h3,
  .csv-column-mapping p {
    margin: 0;
  }

  .csv-column-mapping__grid {
    display: grid;
    gap: 0.75rem;
  }

  .csv-column-mapping__row {
    display: grid;
    gap: 0.4rem;
  }

  .csv-column-mapping__label {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .csv-column-mapping__requirement {
    padding: 0.125rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .csv-column-mapping__requirement--required {
    color: var(--column-mapping-requirement-required-text);
    background-color: var(--column-mapping-requirement-required-background);
  }

  .csv-column-mapping__requirement--optional {
    color: var(--column-mapping-requirement-optional-text);
    background-color: var(--column-mapping-requirement-optional-background);
  }

  .csv-column-mapping__select {
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--column-mapping-select-border);
    border-radius: 0.6rem;
    font: inherit;
    color: var(--column-mapping-select-text);
    background-color: var(--column-mapping-select-background);
  }

  .csv-column-mapping__error {
    margin: 0;
    color: var(--column-mapping-error-text);
  }

  .csv-column-mapping__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--column-mapping-button-border);
    border-radius: 999px;
    background-color: var(--column-mapping-button-background);
    color: var(--column-mapping-button-text);
    font: inherit;
    cursor: pointer;
  }

  @media (max-width: 640px) {
    .csv-column-mapping__button {
      width: 100%;
    }
  }
</style>
