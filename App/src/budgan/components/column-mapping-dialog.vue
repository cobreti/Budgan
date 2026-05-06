<template>
  <v-dialog
    :model-value="modelValue"
    max-width="860px"
    :fullscreen="display.smAndDown.value"
    data-testid="column-mapping-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="column-mapping-dialog">
      <v-card-title class="column-mapping-dialog__title" data-testid="column-mapping-dialog-title">
        {{ t('columnMapping.title') }}
      </v-card-title>

      <v-card-text class="column-mapping-dialog__body">
        <p class="column-mapping-dialog__description">{{ t('columnMapping.description') }}</p>

        <p
          v-if="!workspaceStore.workspace"
          class="column-mapping-dialog__no-workspace"
          data-testid="column-mapping-no-workspace"
        >
          {{ t('columnMapping.noWorkspace') }}
        </p>

        <template v-else>

          <!-- CSV picker -->
          <div class="column-mapping-dialog__csv-picker">
            <div
              class="column-mapping-dialog__csv-status"
              :class="{
                'column-mapping-dialog__csv-status--selected': csvFilename,
                'column-mapping-dialog__csv-status--empty': !csvFilename
              }"
              data-testid="column-mapping-csv-status"
            >
              <p class="column-mapping-dialog__csv-status-text">
                {{ csvFilename ? t('columnMapping.csvLoaded', { filename: csvFilename }) : t('columnMapping.noCsv') }}
              </p>
            </div>

            <div class="column-mapping-dialog__csv-actions">
              <button
                class="column-mapping-dialog__button"
                type="button"
                data-testid="column-mapping-open-csv"
                @click="fileInputRef?.click()"
              >
                {{ t('columnMapping.openCsv') }}
              </button>
              <button
                v-if="csvFilename"
                class="column-mapping-dialog__button column-mapping-dialog__button--secondary"
                type="button"
                data-testid="column-mapping-clear-csv"
                @click="clearCsv"
              >
                {{ t('columnMapping.clearCsv') }}
              </button>
              <ExampleCsvPicker @file-selected="loadCsvFile" />
            </div>

            <input
              ref="fileInputRef"
              type="file"
              accept=".csv,text/csv"
              class="column-mapping-dialog__file-input"
              data-testid="column-mapping-file-input"
              @change="onFileSelected"
            />

            <p
              v-if="parseError"
              class="column-mapping-dialog__csv-error"
              data-testid="column-mapping-parse-error"
            >
              {{ parseError }}
            </p>
          </div>

          <!-- Management panel -->
          <div class="column-mapping-dialog__management">
            <div class="column-mapping-dialog__row">
              <label for="saved-mappings" class="column-mapping-dialog__label">
                {{ t('columnMapping.savedMappings') }}
              </label>
              <select
                id="saved-mappings"
                class="column-mapping-dialog__select"
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

            <div class="column-mapping-dialog__row">
              <label for="mapping-name" class="column-mapping-dialog__label">
                {{ t('columnMapping.mappingName') }}
              </label>
              <input
                id="mapping-name"
                v-model="mappingName"
                type="text"
                class="column-mapping-dialog__input"
                :placeholder="t('columnMapping.mappingName')"
                data-testid="column-mapping-name-input"
              />
            </div>
          </div>

          <!-- Column rows -->
          <div v-if="csvHeaders.length > 0" class="column-mapping-dialog__grid">
            <div
              v-for="field in csvFields"
              :key="field.key"
              class="column-mapping-dialog__row"
              :data-testid="`column-mapping-row-${field.key}`"
            >
              <label :for="`mapping-${field.key}`" class="column-mapping-dialog__label">
                {{ t(field.labelKey) }}
                <span
                  class="column-mapping-dialog__requirement"
                  :class="field.required
                    ? 'column-mapping-dialog__requirement--required'
                    : 'column-mapping-dialog__requirement--optional'"
                >
                  {{ field.required ? t('columnMapping.required') : t('columnMapping.optional') }}
                </span>
              </label>
              <select
                :id="`mapping-${field.key}`"
                class="column-mapping-dialog__select"
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
            class="column-mapping-dialog__no-csv"
            data-testid="column-mapping-no-csv"
          >
            {{ t('columnMapping.noCsv') }}
          </p>

          <p
            v-if="missingRequiredFields.length > 0 && csvHeaders.length > 0"
            class="column-mapping-dialog__error"
            data-testid="column-mapping-missing-error"
          >
            {{ t('columnMapping.missingRequired', { columns: missingRequiredText }) }}
          </p>

        </template>
      </v-card-text>

      <v-card-actions class="column-mapping-dialog__footer">
        <button
          v-if="selectedMappingId"
          class="column-mapping-dialog__button column-mapping-dialog__button--danger"
          type="button"
          data-testid="column-mapping-delete-btn"
          @click="onDelete"
        >
          {{ t('columnMapping.delete') }}
        </button>
        <v-spacer />
        <v-btn
          variant="outlined"
          data-testid="column-mapping-close-btn"
          @click="emit('update:modelValue', false)"
        >
          {{ t('columnMapping.cancel') }}
        </v-btn>
        <button
          v-if="selectedMappingId"
          class="column-mapping-dialog__button"
          type="button"
          :disabled="!canSave"
          data-testid="column-mapping-update-btn"
          @click="onUpdate"
        >
          {{ t('columnMapping.update') }}
        </button>
        <button
          class="column-mapping-dialog__button"
          type="button"
          :disabled="!canSave"
          data-testid="column-mapping-save-btn"
          @click="onSaveNew"
        >
          {{ t('columnMapping.saveNew') }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'
import { CsvColumns } from '@engine/modules/csv-import/csv-column-content'
import type { CsvColumnMapping, CsvColumns as CsvColumnId } from '@engine/modules/csv-import/csv-column-content'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import { IdGenerator } from '@engine/services/IdGenerator'
import container from '@inversify/setup-inversify'
import { useSettingsStore } from '@budgan/stores/settings-store.ts'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import ExampleCsvPicker from '@budgan/components/example-csv-picker.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const display = useDisplay()
const settingsStore = useSettingsStore()
const workspaceStore = useWorkspaceStore()
const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)

type CsvMappingField = { key: CsvColumnId; labelKey: string; required: boolean }

const csvFields: CsvMappingField[] = [
  { key: CsvColumns.cardNumber,      labelKey: 'columnMapping.fieldCardNumber',      required: true },
  { key: CsvColumns.dateTransaction, labelKey: 'columnMapping.fieldDateTransaction',  required: false },
  { key: CsvColumns.dateInscription, labelKey: 'columnMapping.fieldDateInscription',  required: true },
  { key: CsvColumns.amount,          labelKey: 'columnMapping.fieldAmount',           required: true },
  { key: CsvColumns.description,     labelKey: 'columnMapping.fieldDescription',      required: true },
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

// Reset state when dialog closes
watch(() => props.modelValue, (open) => {
  if (!open) {
    clearCsv()
    mappingName.value = ''
    selectedMappingId.value = ''
  }
})

const savedMappings = computed(() => settingsStore.columnMappings)

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

async function loadCsvFile(file: File): Promise<void> {
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
}

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) { clearCsv(); return }
  await loadCsvFile(file)
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
  settingsStore.addColumnMapping(newMapping)
  selectedMappingId.value = newMapping.id
  emit('update:modelValue', false)
}

function onUpdate(): void {
  if (!selectedMappingId.value || !canSave.value) return
  settingsStore.updateColumnMapping({
    id: selectedMappingId.value,
    name: mappingName.value.trim(),
    columnMapping: { ...currentMapping.value },
  })
}

function onDelete(): void {
  if (!selectedMappingId.value) return
  settingsStore.removeColumnMapping(selectedMappingId.value)
  selectedMappingId.value = ''
  mappingName.value = ''
  selectedColumns.value = {}
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.column-mapping-dialog__title {
  padding-top: 1.25rem;
  color: var(--bdg-primary);
}

.column-mapping-dialog__body {
  display: grid;
  gap: 1rem;
  overflow-y: auto;
}

.column-mapping-dialog__description,
.column-mapping-dialog__no-csv {
  margin: 0;
  color: var(--bdg-on-surface);
  opacity: 0.6;
}

.column-mapping-dialog__no-workspace {
  color: var(--bdg-on-surface);
  opacity: 0.6;
  font-style: italic;
  margin: 0;
}

/* CSV picker */
.column-mapping-dialog__csv-picker {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.75rem;
  background-color: var(--bdg-surface);
}

.column-mapping-dialog__csv-status {
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid;
}

.column-mapping-dialog__csv-status--empty {
  background-color: color-mix(in srgb, var(--bdg-background) 90%, var(--bdg-secondary));
  border-color: var(--bdg-secondary);
  opacity: 0.7;
}

.column-mapping-dialog__csv-status--selected {
  background-color: color-mix(in srgb, var(--bdg-background) 85%, var(--bdg-accent));
  border-color: var(--bdg-accent);
}

.column-mapping-dialog__csv-status-text {
  margin: 0;
  font-weight: 500;
  color: var(--bdg-on-surface);
}

.column-mapping-dialog__csv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.column-mapping-dialog__file-input {
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

.column-mapping-dialog__csv-error {
  margin: 0;
  color: var(--bdg-error);
}

/* Management panel */
.column-mapping-dialog__management {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bdg-surface);
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.8rem;
}

/* Column grid */
.column-mapping-dialog__grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.column-mapping-dialog__row {
  display: grid;
  gap: 0.4rem;
}

.column-mapping-dialog__label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--bdg-on-surface);
}

.column-mapping-dialog__requirement {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid;
}

.column-mapping-dialog__requirement--required {
  color: var(--bdg-error);
  border-color: var(--bdg-error);
  background-color: transparent;
  opacity: 0.75;
}

.column-mapping-dialog__requirement--optional {
  color: var(--bdg-on-surface);
  border-color: var(--bdg-secondary);
  background-color: transparent;
  opacity: 0.4;
}

.column-mapping-dialog__select,
.column-mapping-dialog__input {
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.6rem;
  font: inherit;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
}

.column-mapping-dialog__footer {
  padding: 0.5rem 1rem 1rem;
  gap: 0.5rem;
}

.column-mapping-dialog__button {
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

.column-mapping-dialog__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.column-mapping-dialog__button--secondary {
  background-color: transparent;
  color: var(--bdg-on-surface);
  border: 1px solid var(--bdg-secondary);
}

.column-mapping-dialog__button--danger {
  background-color: var(--bdg-error);
  color: #ffffff;
}

.column-mapping-dialog__error {
  margin: 0;
  color: var(--bdg-error);
  font-size: 0.9rem;
}

.column-mapping-dialog__footer {
  padding: 0.5rem 1rem 1rem;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .column-mapping-dialog__button {
    width: 100%;
  }
  .column-mapping-dialog__csv-actions {
    flex-direction: column;
  }
}
</style>

