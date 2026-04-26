<template>
  <section class="column-mapping-view" data-testid="column-mapping-view">

    <h1 class="column-mapping-view__title" data-testid="column-mapping-view-title">
      {{ t('columnMapping.title') }}
    </h1>
    <p class="column-mapping-view__description">{{ t('columnMapping.description') }}</p>

    <p
      v-if="!workspaceStore.workspace"
      class="column-mapping-view__no-workspace"
      data-testid="column-mapping-no-workspace"
    >
      {{ t('columnMapping.noWorkspace') }}
    </p>

    <template v-else>

    <!-- CSV picker -->
    <div class="column-mapping-view__csv-picker">
      <div
        class="column-mapping-view__csv-status"
        :class="{
          'column-mapping-view__csv-status--selected': csvFilename,
          'column-mapping-view__csv-status--empty': !csvFilename
        }"
        data-testid="column-mapping-csv-status"
      >
        <p class="column-mapping-view__csv-status-text">
          {{ csvFilename ? t('columnMapping.csvLoaded', { filename: csvFilename }) : t('columnMapping.noCsv') }}
        </p>
      </div>

      <div class="column-mapping-view__csv-actions">
        <button
          class="column-mapping-view__button"
          type="button"
          data-testid="column-mapping-open-csv"
          @click="fileInputRef?.click()"
        >
          {{ t('columnMapping.openCsv') }}
        </button>
        <button
          v-if="csvFilename"
          class="column-mapping-view__button column-mapping-view__button--secondary"
          type="button"
          data-testid="column-mapping-clear-csv"
          @click="clearCsv"
        >
          {{ t('columnMapping.clearCsv') }}
        </button>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept=".csv,text/csv"
        class="column-mapping-view__file-input"
        data-testid="column-mapping-file-input"
        @change="onFileSelected"
      />

      <p
        v-if="parseError"
        class="column-mapping-view__csv-error"
        data-testid="column-mapping-parse-error"
      >
        {{ parseError }}
      </p>
    </div>

    <!-- Management panel -->
    <div class="column-mapping-view__management">
      <div class="column-mapping-view__row">
        <label for="saved-mappings" class="column-mapping-view__label">
          {{ t('columnMapping.savedMappings') }}
        </label>
        <select
          id="saved-mappings"
          class="column-mapping-view__select"
          :value="selectedMappingId"
          data-testid="column-mapping-saved-select"
          @change="onMappingSelect"
        >
          <option value="">{{ t('columnMapping.newMapping') }}</option>
          <option v-for="mapping in savedMappings" :key="mapping.id" :value="mapping.id">
            {{ mapping.name }}
          </option>
        </select>
      </div>

      <div class="column-mapping-view__row">
        <label for="mapping-name" class="column-mapping-view__label">
          {{ t('columnMapping.mappingName') }}
        </label>
        <input
          id="mapping-name"
          v-model="mappingName"
          type="text"
          class="column-mapping-view__input"
          :placeholder="t('columnMapping.mappingName')"
          data-testid="column-mapping-name-input"
        />
      </div>

      <div class="column-mapping-view__actions">
        <button
          class="column-mapping-view__button"
          type="button"
          :disabled="!canSave"
          data-testid="column-mapping-save-btn"
          @click="onSaveNew"
        >
          {{ t('columnMapping.saveNew') }}
        </button>
        <button
          v-if="selectedMappingId"
          class="column-mapping-view__button"
          type="button"
          :disabled="!canSave"
          data-testid="column-mapping-update-btn"
          @click="onUpdate"
        >
          {{ t('columnMapping.update') }}
        </button>
        <button
          v-if="selectedMappingId"
          class="column-mapping-view__button column-mapping-view__button--danger"
          type="button"
          data-testid="column-mapping-delete-btn"
          @click="onDelete"
        >
          {{ t('columnMapping.delete') }}
        </button>
      </div>
    </div>

    <!-- Column rows -->
    <div v-if="csvHeaders.length > 0" class="column-mapping-view__grid">
      <div
        v-for="field in csvFields"
        :key="field.key"
        class="column-mapping-view__row"
        :data-testid="`column-mapping-row-${field.key}`"
      >
        <label :for="`mapping-${field.key}`" class="column-mapping-view__label">
          {{ t(field.labelKey) }}
          <span
            class="column-mapping-view__requirement"
            :class="field.required
              ? 'column-mapping-view__requirement--required'
              : 'column-mapping-view__requirement--optional'"
          >
            {{ field.required ? t('columnMapping.required') : t('columnMapping.optional') }}
          </span>
        </label>
        <select
          :id="`mapping-${field.key}`"
          class="column-mapping-view__select"
          :data-testid="`column-mapping-select-${field.key}`"
          :value="selectedColumns[field.key] ?? ''"
          @change="onColumnChange(field.key, $event)"
        >
          <option value="">{{ t('columnMapping.notMapped') }}</option>
          <option v-for="header in csvHeaders" :key="header" :value="header">
            {{ header }}
          </option>
        </select>
      </div>
    </div>

    <p
      v-else
      class="column-mapping-view__no-csv"
      data-testid="column-mapping-no-csv"
    >
      {{ t('columnMapping.noCsv') }}
    </p>

    <p
      v-if="missingRequiredFields.length > 0 && csvHeaders.length > 0"
      class="column-mapping-view__error"
      data-testid="column-mapping-missing-error"
    >
      {{ t('columnMapping.missingRequired', { columns: missingRequiredText }) }}
    </p>

    </template>

  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'
import { CsvColumns } from '@engine/modules/csv-import/csv-column-content'
import type { CsvColumnMapping, CsvColumns as CsvColumnId } from '@engine/modules/csv-import/csv-column-content'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import { IdGenerator } from '@engine/services/IdGenerator'
import container from '@inversify/setup-inversify'
import { useSettingsStore } from '@budgan/stores/settings-store.ts'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const workspaceStore = useWorkspaceStore()
const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)

type CsvMappingField = { key: CsvColumnId; labelKey: string; required: boolean }

const csvFields: CsvMappingField[] = [
  { key: CsvColumns.cardNumber,      labelKey: 'columnMapping.fieldCardNumber',     required: true },
  { key: CsvColumns.dateTransaction, labelKey: 'columnMapping.fieldDateTransaction', required: true },
  { key: CsvColumns.dateInscription, labelKey: 'columnMapping.fieldDateInscription', required: false },
  { key: CsvColumns.amount,          labelKey: 'columnMapping.fieldAmount',          required: true },
  { key: CsvColumns.description,     labelKey: 'columnMapping.fieldDescription',     required: true },
]

// CSV state
const fileInputRef = ref<HTMLInputElement | null>(null)
const csvFilename = ref<string | null>(null)
const csvHeaders = ref<string[]>([])
const parseError = ref('')

// Form state
const mappingName = ref('')
const selectedMappingId = ref('')
const selectedColumns = ref<Partial<Record<CsvColumnId, string>>>({})

const savedMappings = computed(() => settingsStore.settings.columnMappings)

const missingRequiredFields = computed(() =>
  csvFields.filter((f) => f.required && !selectedColumns.value[f.key])
)

const missingRequiredText = computed(() =>
  missingRequiredFields.value.map((f) => t(f.labelKey)).join(', ')
)

const currentMapping = computed<CsvColumnMapping>(() => {
  const mapping: CsvColumnMapping = {}
  for (const field of csvFields) {
    const header = selectedColumns.value[field.key]
    if (!header) continue
    const idx = csvHeaders.value.indexOf(header)
    if (idx >= 0) mapping[field.key] = idx
  }
  return mapping
})

const canSave = computed(() =>
  mappingName.value.trim() !== '' && missingRequiredFields.value.length === 0
)

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) { clearCsv(); return }

  try {
    const text = await file.text()
    const result = new CsvContentExtractor().extract(text)
    csvHeaders.value = result.header
    csvFilename.value = file.name
    parseError.value = ''
    selectedColumns.value = {}
  } catch {
    parseError.value = t('columnMapping.csvParseError')
    csvHeaders.value = []
    csvFilename.value = null
  }
  input.value = ''
}

function clearCsv(): void {
  if (fileInputRef.value) fileInputRef.value.value = ''
  csvHeaders.value = []
  csvFilename.value = null
  parseError.value = ''
  selectedColumns.value = {}
}

function onColumnChange(key: CsvColumnId, event: Event): void {
  const header = (event.target as HTMLSelectElement).value
  if (!header) {
    const updated = { ...selectedColumns.value }
    delete updated[key]
    selectedColumns.value = updated
  } else {
    selectedColumns.value = { ...selectedColumns.value, [key]: header }
  }
}

function onMappingSelect(event: Event): void {
  const id = (event.target as HTMLSelectElement).value
  selectedMappingId.value = id
  if (!id) { mappingName.value = ''; selectedColumns.value = {}; return }
  const mapping = savedMappings.value.find((m: BdgColumnMapping) => m.id === id)
  if (mapping) { mappingName.value = mapping.name; loadMapping(mapping.columnMapping) }
}

function loadMapping(mapping: CsvColumnMapping): void {
  const mapped: Partial<Record<CsvColumnId, string>> = {}
  for (const field of csvFields) {
    const idx = mapping[field.key]
    if (idx !== undefined && csvHeaders.value[idx] !== undefined)
      mapped[field.key] = csvHeaders.value[idx]
  }
  selectedColumns.value = mapped
}

function onSaveNew(): void {
  if (!canSave.value) return
  const newMapping: BdgColumnMapping = {
    id: idGenerator.generateId(),
    name: mappingName.value.trim(),
    columnMapping: { ...currentMapping.value },
  }
  settingsStore.settings.addColumnMapping(newMapping)
  selectedMappingId.value = newMapping.id
}

function onUpdate(): void {
  if (!selectedMappingId.value || !canSave.value) return
  settingsStore.settings.updateColumnMapping({
    id: selectedMappingId.value,
    name: mappingName.value.trim(),
    columnMapping: { ...currentMapping.value },
  })
}

function onDelete(): void {
  if (!selectedMappingId.value) return
  settingsStore.settings.removeColumnMapping(selectedMappingId.value)
  selectedMappingId.value = ''
  mappingName.value = ''
  selectedColumns.value = {}
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.column-mapping-view {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
}

.column-mapping-view__title,
.column-mapping-view__description,
.column-mapping-view__no-csv {
  margin: 0;
}

.column-mapping-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bdg-primary);
}

.column-mapping-view__description,
.column-mapping-view__no-csv {
  color: var(--bdg-on-surface);
  opacity: 0.6;
}

.column-mapping-view__no-workspace {
  color: var(--bdg-on-surface);
  opacity: 0.6;
  font-style: italic;
  margin: 0;
}

/* CSV picker */
.column-mapping-view__csv-picker {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.75rem;
  background-color: var(--bdg-surface);
}

.column-mapping-view__csv-status {
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid;
}

.column-mapping-view__csv-status--empty {
  background-color: color-mix(in srgb, var(--bdg-background) 90%, var(--bdg-secondary));
  border-color: var(--bdg-secondary);
  opacity: 0.7;
}

.column-mapping-view__csv-status--selected {
  background-color: color-mix(in srgb, var(--bdg-background) 85%, var(--bdg-accent));
  border-color: var(--bdg-accent);
}

.column-mapping-view__csv-status-text {
  margin: 0;
  font-weight: 500;
  color: var(--bdg-on-surface);
}

.column-mapping-view__csv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.column-mapping-view__file-input {
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

.column-mapping-view__csv-error {
  margin: 0;
  color: var(--bdg-error);
}

/* Management panel */
.column-mapping-view__management {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bdg-surface);
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.8rem;
}

/* Column grid */
.column-mapping-view__grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.column-mapping-view__row {
  display: grid;
  gap: 0.4rem;
}

.column-mapping-view__label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--bdg-on-surface);
}

.column-mapping-view__requirement {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid;
}

.column-mapping-view__requirement--required {
  color: var(--bdg-error);
  border-color: var(--bdg-error);
  background-color: transparent;
  opacity: 0.75;
}

.column-mapping-view__requirement--optional {
  color: var(--bdg-on-surface);
  border-color: var(--bdg-secondary);
  background-color: transparent;
  opacity: 0.4;
}

.column-mapping-view__select,
.column-mapping-view__input {
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.6rem;
  font: inherit;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
}

.column-mapping-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.column-mapping-view__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
  background-color: var(--bdg-primary);
  color: #ffffff;
  border: none;
}

.column-mapping-view__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.column-mapping-view__button--secondary {
  background-color: transparent;
  color: var(--bdg-on-surface);
  border: 1px solid var(--bdg-secondary);
}

.column-mapping-view__button--danger {
  background-color: var(--bdg-error);
  color: #ffffff;
}

.column-mapping-view__error {
  margin: 0;
  color: var(--bdg-error);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .column-mapping-view__button {
    width: 100%;
  }
  .column-mapping-view__csv-actions {
    flex-direction: column;
  }
}
</style>
