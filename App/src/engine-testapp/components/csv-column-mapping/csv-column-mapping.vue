<template>
  <section class="csv-column-mapping" data-testid="workspace-mapping-panel">
    <h3>{{ t('workspace.mapping.title') }}</h3>
    <p>{{ t('workspace.mapping.description') }}</p>

    <div class="csv-column-mapping__management">
      <div class="csv-column-mapping__row">
        <label for="saved-mappings" class="csv-column-mapping__label">
          {{ t('workspace.mapping.savedMappings') }}
        </label>
        <select
          id="saved-mappings"
          class="csv-column-mapping__select"
          :value="selectedMappingId"
          @change="onMappingSelect"
        >
          <option value="">{{ t('workspace.mapping.newMapping') }}</option>
          <option v-for="mapping in savedMappings" :key="mapping.id" :value="mapping.id">
            {{ mapping.name }}
          </option>
        </select>
      </div>

      <div class="csv-column-mapping__row">
        <label for="mapping-name" class="csv-column-mapping__label">
          {{ t('workspace.mapping.mappingName') }}
        </label>
        <input
          id="mapping-name"
          v-model="mappingName"
          type="text"
          class="csv-column-mapping__input"
          :placeholder="t('workspace.mapping.mappingName')"
        />
      </div>

      <div class="csv-column-mapping__actions">
        <button
          class="csv-column-mapping__button"
          type="button"
          :disabled="!canSave"
          @click="saveNewMapping"
        >
          {{ t('workspace.mapping.saveNew') }}
        </button>
        <button
          v-if="selectedMappingId"
          class="csv-column-mapping__button"
          type="button"
          :disabled="!canSave"
          @click="updateExistingMapping"
        >
          {{ t('workspace.mapping.update') }}
        </button>
        <button
          v-if="selectedMappingId"
          class="csv-column-mapping__button csv-column-mapping__button--danger"
          type="button"
          @click="deleteMapping"
        >
          {{ t('workspace.mapping.delete') }}
        </button>
      </div>
    </div>

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
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
  import { useSettingsStore } from '@engineTestApp/stores/settings-store'
  import { IdGenerator } from '@engine/services/IdGenerator'
  import container from '@inversify/setup-inversify'
  import {
    CsvColumns,
    type CsvColumnMapping,
    type CsvColumns as CsvColumnId
  } from '@engine/modules/csv-import/csv-column-content'
  import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
  import type { CsvContentExtractionResult } from '@engine/modules/csv-import/csv-content-extractor'

  const props = withDefaults(
    defineProps<{ parsedJson?: CsvContentExtractionResult | null }>(),
    { parsedJson: undefined }
  )

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
  const settingsStore = useSettingsStore()
  const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)

  const selectedColumns = ref<Partial<Record<CsvColumnId, string>>>({})
  const mappingName = ref('')
  const selectedMappingId = ref('')

  const csvHeaders = computed(() => (props.parsedJson ?? workspaceStore.parsedJson)?.header ?? [])
  const savedMappings = computed(() => settingsStore.columnMappings)

  const missingRequiredColumns = computed(() => {
    return mappingColumns.filter((column) => column.required && !selectedColumns.value[column.key])
  })

  const missingRequiredColumnsText = computed(() => {
    return missingRequiredColumns.value.map((column) => t(column.labelKey)).join(', ')
  })

  const canSave = computed(() => {
    return mappingName.value.trim() !== '' && missingRequiredColumns.value.length === 0
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

  function syncSelectedColumnsFromAppliedMapping(): void {
    const headers = csvHeaders.value
    const applied = workspaceStore.appliedMapping

    if (!headers.length || !applied) {
      selectedColumns.value = {}
      return
    }

    const mappedSelections: Partial<Record<CsvColumnId, string>> = {}

    for (const column of mappingColumns) {
      const headerIndex = applied[column.key]
      if (headerIndex === undefined) {
        continue
      }

      const headerName = headers[headerIndex]
      if (headerName !== undefined) {
        mappedSelections[column.key] = headerName
      }
    }

    selectedColumns.value = mappedSelections
  }

  watch(
    [() => props.parsedJson, () => workspaceStore.parsedJson, () => workspaceStore.appliedMapping],
    () => {
      syncSelectedColumnsFromAppliedMapping()
    },
    { immediate: true }
  )

  function onMappingChange(column: CsvColumnId, event: Event): void {
    const selectedHeader = (event.target as HTMLSelectElement).value

    if (!selectedHeader) {
      const updatedMapping = { ...selectedColumns.value }
      delete updatedMapping[column]
      selectedColumns.value = updatedMapping
      return
    }

    selectedColumns.value = {
      ...selectedColumns.value,
      [column]: selectedHeader
    }
  }

  function onMappingSelect(event: Event): void {
    const id = (event.target as HTMLSelectElement).value
    selectedMappingId.value = id

    if (!id) {
      mappingName.value = ''
      selectedColumns.value = {}
      return
    }

    const mapping = savedMappings.value.find((m: BdgColumnMapping) => m.id === id)
    if (mapping) {
      mappingName.value = mapping.name
      loadMapping(mapping.columnMapping)
    }
  }

  function loadMapping(mapping: CsvColumnMapping): void {
    const headers = csvHeaders.value
    const mappedSelections: Partial<Record<CsvColumnId, string>> = {}

    for (const column of mappingColumns) {
      const headerIndex = mapping[column.key]
      if (headerIndex === undefined) {
        continue
      }

      const headerName = headers[headerIndex]
      if (headerName !== undefined) {
        mappedSelections[column.key] = headerName
      }
    }

    selectedColumns.value = mappedSelections
  }

  function saveNewMapping(): void {
    if (!canSave.value) return

    const newMapping: BdgColumnMapping = {
      id: idGenerator.generateId(),
      name: mappingName.value,
      columnMapping: { ...currentMapping.value }
    }

    settingsStore.insertMapping(newMapping)
    selectedMappingId.value = newMapping.id
  }

  function updateExistingMapping(): void {
    if (!selectedMappingId.value || !canSave.value) return

    const updatedMapping: BdgColumnMapping = {
      id: selectedMappingId.value,
      name: mappingName.value,
      columnMapping: { ...currentMapping.value }
    }

    settingsStore.updateMapping(updatedMapping)
  }

  function deleteMapping(): void {
    if (!selectedMappingId.value) return

    settingsStore.removeMapping(selectedMappingId.value)
    selectedMappingId.value = ''
    mappingName.value = ''
    selectedColumns.value = {}
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
    margin-bottom: 1rem;
  }

  .csv-column-mapping__management {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: var(--column-mapping-select-background);
    border: 1px solid var(--column-mapping-select-border);
    border-radius: 0.8rem;
  }

  .csv-column-mapping__actions {
    display: flex;
    flex-wrap: wrap;
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

  .csv-column-mapping__input {
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

  .csv-column-mapping__button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .csv-column-mapping__button--danger {
    background-color: var(--column-mapping-error-text);
    color: white;
    border-color: var(--column-mapping-error-text);
  }

  @media (max-width: 640px) {
    .csv-column-mapping__button {
      width: 100%;
    }
  }
</style>
