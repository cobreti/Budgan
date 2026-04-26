<template>
  <div class="column-mapping-view">
    <h1 class="column-mapping-view__title" data-testid="column-mapping-view-title">
      {{ t('columnMapping.title') }}
    </h1>

    <!-- CSV file picker -->
    <div class="column-mapping-view__csv-section">
      <input
        ref="fileInputRef"
        type="file"
        accept=".csv"
        class="column-mapping-view__file-input"
        data-testid="column-mapping-file-input"
        @change="onFileSelected"
      />
      <v-btn
        variant="outlined"
        color="primary"
        data-testid="column-mapping-open-csv"
        @click="fileInputRef?.click()"
      >
        {{ t('columnMapping.openCsv') }}
      </v-btn>
      <span class="column-mapping-view__csv-status" data-testid="column-mapping-csv-status">
        {{ csvFilename ? t('columnMapping.csvLoaded', { filename: csvFilename }) : t('columnMapping.noCsv') }}
      </span>
    </div>

    <!-- Mapping name -->
    <div class="column-mapping-view__form">
      <v-text-field
        v-model="mappingName"
        :label="t('columnMapping.mappingName')"
        variant="outlined"
        density="compact"
        :error-messages="nameError ?? undefined"
        data-testid="column-mapping-name-input"
        @input="nameError = null"
      />

      <!-- Column rows -->
      <div class="column-mapping-view__rows">
        <div
          v-for="field in csvFields"
          :key="field.key"
          class="column-mapping-view__row"
          :data-testid="`column-mapping-row-${field.key}`"
        >
          <span class="column-mapping-view__row-label">
              {{ t(field.labelKey) }}
              <span
                :class="field.required ? 'column-mapping-view__badge--required' : 'column-mapping-view__badge--optional'"
                class="column-mapping-view__badge"
              >{{ field.required ? t('columnMapping.required') : t('columnMapping.optional') }}</span>
            </span>
          <v-select
            v-model="columnMapping[field.key]"
            :items="columnOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            :disabled="csvHeaders.length === 0"
            :data-testid="`column-mapping-select-${field.key}`"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="column-mapping-view__actions">
      <v-btn
        variant="outlined"
        data-testid="column-mapping-cancel-btn"
        @click="router.back()"
      >
        {{ t('columnMapping.cancel') }}
      </v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :disabled="!canSave"
        :style="{ color: 'rgb(var(--v-theme-on-primary))' }"
        data-testid="column-mapping-save-btn"
        @click="onSave"
      >
        {{ t('columnMapping.save') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'
import { CsvColumns } from '@engine/modules/csv-import/csv-column-content'
import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content'
import { IdGenerator } from '@engine/services/IdGenerator'
import container from '@inversify/setup-inversify'
import { useSettingsStore } from '@budgan/stores/settings-store.ts'

const { t } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)

// CSV state
const fileInputRef = ref<HTMLInputElement | null>(null)
const csvFilename = ref<string | null>(null)
const csvHeaders = ref<string[]>([])

// Form state
const mappingName = ref('')
const nameError = ref<string | null>(null)
const columnMapping = ref<CsvColumnMapping>({})

const csvFields: { key: keyof CsvColumnMapping; labelKey: string; required: boolean }[] = [
  { key: CsvColumns.cardNumber,       labelKey: 'columnMapping.fieldCardNumber',      required: true },
  { key: CsvColumns.dateTransaction,  labelKey: 'columnMapping.fieldDateTransaction',  required: true },
  { key: CsvColumns.dateInscription,  labelKey: 'columnMapping.fieldDateInscription',  required: false },
  { key: CsvColumns.amount,           labelKey: 'columnMapping.fieldAmount',           required: true },
  { key: CsvColumns.description,      labelKey: 'columnMapping.fieldDescription',      required: true },
]

const columnOptions = computed(() => [
  { title: t('columnMapping.notMapped'), value: null },
  ...csvHeaders.value.map((header, index) => ({ title: header, value: index })),
])

const canSave = computed(() => {
  const name = mappingName.value.trim()
  if (!name) return false
  const isDuplicate = settingsStore.settings.columnMappings.some((m) => m.name === name)
  if (isDuplicate) return false
  return csvFields
    .filter((f) => f.required)
    .every((f) => columnMapping.value[f.key] != null)
})

async function onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const text = await file.text()
  const extractor = new CsvContentExtractor()
  try {
    const result = extractor.extract(text)
    csvHeaders.value = result.header
    csvFilename.value = file.name
    columnMapping.value = {}
  } catch {
    csvHeaders.value = []
    csvFilename.value = null
  }
  input.value = ''
}

function onSave(): void {
  const name = mappingName.value.trim()
  if (!name) {
    nameError.value = t('columnMapping.nameRequired')
    return
  }
  const isDuplicate = settingsStore.settings.columnMappings.some((m) => m.name === name)
  if (isDuplicate) {
    nameError.value = t('columnMapping.nameDuplicate')
    return
  }

  settingsStore.settings.addColumnMapping({
    id: idGenerator.generateId(),
    name,
    columnMapping: { ...columnMapping.value },
  })

  router.back()
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.column-mapping-view {
  padding: 1.5rem;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.column-mapping-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bdg-primary);
}

.column-mapping-view__csv-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.column-mapping-view__file-input {
  display: none;
}

.column-mapping-view__csv-status {
  font-size: 0.85rem;
  opacity: 0.7;
  color: var(--bdg-on-surface);
}

.column-mapping-view__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.column-mapping-view__rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.column-mapping-view__row {
  display: grid;
  grid-template-columns: 200px 1fr;
  align-items: center;
  gap: 1rem;
}

.column-mapping-view__row-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--bdg-on-surface);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.column-mapping-view__badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  width: fit-content;
}

.column-mapping-view__badge--required {
  background-color: var(--bdg-error);
  color: #ffffff;
}

.column-mapping-view__badge--optional {
  background-color: var(--bdg-secondary);
  color: #ffffff;
  opacity: 0.7;
}

.column-mapping-view__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}
</style>

