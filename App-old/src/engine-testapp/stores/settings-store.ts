import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'

export const useSettingsStore = defineStore('settings', () => {
  const workspaceStore = useWorkspaceStore()

  const columnMappings = computed<BdgColumnMapping[]>(
    () => workspaceStore.currentWorkspace?.settings.columnMappings ?? [],
  )

  function updateMapping(mapping: BdgColumnMapping): void {
    workspaceStore.currentWorkspace?.settings.updateColumnMapping(mapping)
    workspaceStore.syncSnapshot()
  }

  function insertMapping(mapping: BdgColumnMapping): void {
    workspaceStore.currentWorkspace?.settings.addColumnMapping(mapping)
    workspaceStore.syncSnapshot()
  }

  function removeMapping(id: string): void {
    workspaceStore.currentWorkspace?.settings.removeColumnMapping(id)
    workspaceStore.syncSnapshot()
  }

  return {
    columnMappings,
    updateMapping,
    insertMapping,
    removeMapping,
  }
})
