import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type CsvColumnMapping } from '../../engine/modules/csv-import/csv-column-content'
import { type CsvContentExtractionResult } from '../../engine/modules/csv-import/csv-content-extractor'

export const useWorkspaceStore = defineStore('workspace', () => {
  const parsedJson = ref<CsvContentExtractionResult | null>(null)
  const appliedMapping = ref<CsvColumnMapping | null>(null)
  const selectedFileName = ref<string | null>(null)
  const selectedFileSize = ref<number | null>(null)
  const isJsonVisible = ref(false)

  function setParsedJson(content: CsvContentExtractionResult | null): void {
    parsedJson.value = content
    appliedMapping.value = null
    isJsonVisible.value = !!content
  }

  function setAppliedMapping(mapping: CsvColumnMapping | null): void {
    appliedMapping.value = mapping
  }

  function setSelectedFile(file: File | null): void {
    if (!file) {
      selectedFileName.value = null
      selectedFileSize.value = null
      return
    }

    selectedFileName.value = file.name
    selectedFileSize.value = file.size
  }

  function toggleJsonVisibility(): void {
    isJsonVisible.value = !isJsonVisible.value
  }

  return {
    parsedJson,
    appliedMapping,
    selectedFileName,
    selectedFileSize,
    isJsonVisible,
    setParsedJson,
    setAppliedMapping,
    setSelectedFile,
    toggleJsonVisibility
  }
})
