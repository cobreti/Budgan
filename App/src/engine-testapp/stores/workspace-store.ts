import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type CsvColumnMapping } from '../../engine/modules/csv-import/csv-column-content'
import { type CsvContentExtractionResult } from '../../engine/modules/csv-import/csv-content-extractor'

export const useWorkspaceStore = defineStore('workspace', () => {
  const parsedJson = ref<CsvContentExtractionResult | null>(null)
  const appliedMapping = ref<CsvColumnMapping | null>(null)
  const isJsonVisible = ref(false)

  function setParsedJson(content: CsvContentExtractionResult | null): void {
    parsedJson.value = content
    appliedMapping.value = null
    isJsonVisible.value = !!content
  }

  function setAppliedMapping(mapping: CsvColumnMapping | null): void {
    appliedMapping.value = mapping
  }

  function toggleJsonVisibility(): void {
    isJsonVisible.value = !isJsonVisible.value
  }

  return {
    parsedJson,
    appliedMapping,
    isJsonVisible,
    setParsedJson,
    setAppliedMapping,
    toggleJsonVisibility
  }
})
