import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import container from '@inversify/setup-inversify'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'

export type WorkspaceStore = {
  workspace: Ref<BdgWorkspace | null>
  createWorkspace(name: string): BdgWorkspace
  setWorkspace(workspace: BdgWorkspace): void
  clearWorkspace(): void
}

export const useWorkspaceStore = defineStore<string, WorkspaceStore>('workspace', () => {
  const workspace = ref<BdgWorkspace | null>(null)

  const factory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)

  function createWorkspace(name: string): BdgWorkspace {
    const newWorkspace = factory.createWorkspace()
    newWorkspace.name = name
    workspace.value = newWorkspace
    return newWorkspace
  }

  function setWorkspace(value: BdgWorkspace): void {
    workspace.value = value
  }

  function clearWorkspace(): void {
    workspace.value = null
  }

  return {
    workspace,
    createWorkspace,
    setWorkspace,
    clearWorkspace,
  }
})

