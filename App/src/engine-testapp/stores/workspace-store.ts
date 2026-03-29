import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type CsvColumnMapping } from '../../engine/modules/csv-import/csv-column-content'
import { type CsvContentExtractionResult } from '../../engine/modules/csv-import/csv-content-extractor'

type StoredWorkspace = {
  id: string
  name: string
}

export const useWorkspaceStore = defineStore(
  'workspace',
  () => {
    const parsedJson = ref<CsvContentExtractionResult | null>(null)
    const appliedMapping = ref<CsvColumnMapping | null>(null)
    const selectedFileName = ref<string | null>(null)
    const selectedFileSize = ref<number | null>(null)
    const isJsonVisible = ref(false)
    const currentWorkspace = ref<StoredWorkspace | null>(null)

    function resetWorkspaceData(): void {
      parsedJson.value = null
      appliedMapping.value = null
      selectedFileName.value = null
      selectedFileSize.value = null
      isJsonVisible.value = false
    }

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

    function setCurrentWorkspace(workspace: StoredWorkspace | null): void {
      currentWorkspace.value = workspace
      resetWorkspaceData()
    }

    return {
      parsedJson,
      appliedMapping,
      selectedFileName,
      selectedFileSize,
      isJsonVisible,
      currentWorkspace,
      setParsedJson,
      setAppliedMapping,
      setSelectedFile,
      toggleJsonVisibility,
      setCurrentWorkspace
    }
  },
  {
    persist: {
      key: 'engine-testapp-workspace',
      storage: localStorage
    }
  }
)
