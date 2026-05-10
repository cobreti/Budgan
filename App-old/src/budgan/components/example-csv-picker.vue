<template>
  <div class="example-csv-picker">
    <p v-if="isLoading" class="example-csv-picker__loading" data-testid="example-csv-picker-loading">
      {{ t('examples.loading') }}
    </p>
    <p v-else-if="error" class="example-csv-picker__error" data-testid="example-csv-picker-error">
      {{ t('examples.error') }}
    </p>
    <select
      v-else-if="files.length > 0"
      class="example-csv-picker__select"
      :disabled="disabled || isFetching"
      data-testid="example-csv-picker-select"
      @change="onSelect"
    >
      <option value="" disabled selected>{{ t('examples.select') }}</option>
      <template v-for="group in groups" :key="group">
        <optgroup :label="group">
          <option
            v-for="file in filesByGroup[group]"
            :key="file.path"
            :value="file.path"
            :data-label="file.label"
          >
            {{ file.label }}
          </option>
        </optgroup>
      </template>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useExampleCsvFiles } from '@budgan/composables/use-example-csv-files'

defineProps<{ disabled?: boolean }>()

const emit = defineEmits<{ 'file-selected': [file: File] }>()

const { t } = useI18n()
const { files, isLoading, error, load } = useExampleCsvFiles()
const isFetching = ref(false)

const groups = computed(() => [...new Set(files.value.map((f) => f.group))])
const filesByGroup = computed(() =>
  Object.fromEntries(groups.value.map((g) => [g, files.value.filter((f) => f.group === g)])),
)

onMounted(() => load())

async function onSelect(event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement
  const filePath = select.value
  const label = select.options[select.selectedIndex]?.dataset.label ?? filePath.split('/').pop() ?? 'example.csv'

  if (!filePath) return

  isFetching.value = true
  try {
    const response = await fetch(filePath)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const file = new File([blob], label, { type: 'text/csv' })
    emit('file-selected', file)
  } finally {
    isFetching.value = false
    select.value = ''
  }
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.example-csv-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example-csv-picker__select {
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 0.6rem;
  font: inherit;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
  cursor: pointer;
}

.example-csv-picker__select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.example-csv-picker__loading,
.example-csv-picker__error {
  margin: 0;
  font-size: 0.875rem;
}

.example-csv-picker__error {
  color: var(--bdg-error);
}

.example-csv-picker__loading {
  color: var(--bdg-on-surface);
  opacity: 0.6;
}
</style>
