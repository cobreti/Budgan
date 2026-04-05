import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content'
import type { CsvContentExtractionResult } from '@engine/modules/csv-import/csv-content-extractor'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgAccountImpl } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import container from '@inversify/setup-inversify'

type WorkspaceSnapshot = {
  id: string
  name: string
  accounts: Array<{ id: string; name: string; columnMappingId: string }>
}

export const useWorkspaceStore = defineStore(
  'workspace',
  () => {
    const parsedJson = ref<CsvContentExtractionResult | null>(null)
    const appliedMapping = ref<CsvColumnMapping | null>(null)
    const selectedFileName = ref<string | null>(null)
    const selectedFileSize = ref<number | null>(null)
    const isJsonVisible = ref(false)
    const currentWorkspace = ref<BdgWorkspace | null>(null)
    const workspaceSnapshot = ref<WorkspaceSnapshot | null>(null)

    function _syncWorkspaceSnapshot(): void {
      if (!currentWorkspace.value) {
        workspaceSnapshot.value = null
        return
      }
      workspaceSnapshot.value = {
        id: currentWorkspace.value.id,
        name: currentWorkspace.value.name,
        accounts: currentWorkspace.value.accounts.map((a) => ({
          id: a.id,
          name: a.name,
          columnMappingId: a.columnMappingId,
        })),
      }
    }

    function rebuildWorkspaceFromSnapshot(): void {
      if (!workspaceSnapshot.value) {
        currentWorkspace.value = null
        return
      }
      const factory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)
      const accounts = workspaceSnapshot.value.accounts.map(
        (a) => new BdgAccountImpl(a.id, a.name, a.columnMappingId),
      )
      currentWorkspace.value = factory.reconstructWorkspace(
        workspaceSnapshot.value.id,
        workspaceSnapshot.value.name,
        accounts,
      )
    }

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

    function setCurrentWorkspace(workspace: BdgWorkspace | null): void {
      currentWorkspace.value = workspace
      _syncWorkspaceSnapshot()
      resetWorkspaceData()
    }

    function createAccountInCurrentWorkspace(name: string, columnMappingId: string): BdgAccount {
      if (!currentWorkspace.value) {
        throw new Error('No current workspace')
      }
      const account = currentWorkspace.value.createAccount(name, columnMappingId)
      _syncWorkspaceSnapshot()
      return account
    }

    return {
      parsedJson,
      appliedMapping,
      selectedFileName,
      selectedFileSize,
      isJsonVisible,
      currentWorkspace,
      workspaceSnapshot,
      setParsedJson,
      setAppliedMapping,
      setSelectedFile,
      toggleJsonVisibility,
      setCurrentWorkspace,
      rebuildWorkspaceFromSnapshot,
      createAccountInCurrentWorkspace,
    }
  },
  {
    persist: {
      key: 'engine-testapp-workspace',
      storage: localStorage,
      omit: ['currentWorkspace'],
      afterHydrate: (ctx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(ctx.store as any).rebuildWorkspaceFromSnapshot()
      },
    },
  },
)
