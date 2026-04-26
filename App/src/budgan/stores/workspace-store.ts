import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import container from '@inversify/setup-inversify'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import { useSettingsStore } from './settings-store'

export type WorkspaceStore = {
  workspace: Ref<BdgWorkspace | null>
  workspacePath: Ref<string | null>
  createWorkspace(name: string): BdgWorkspace
  setWorkspace(workspace: BdgWorkspace): void
  setWorkspacePath(path: string | null): void
  clearWorkspace(): void
}

export const useWorkspaceStore = defineStore<string, WorkspaceStore>('workspace', () => {
  const workspace = ref<BdgWorkspace | null>(null)
  const workspacePath = ref<string | null>(null)

  const factory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)

  function createWorkspace(name: string): BdgWorkspace {
    const newWorkspace = factory.createWorkspace()
    newWorkspace.name = name
    workspace.value = newWorkspace
    workspacePath.value = null
    useSettingsStore().reinitialize()
    return newWorkspace
  }

  function setWorkspace(value: BdgWorkspace): void {
    workspace.value = value
  }

  function setWorkspacePath(path: string | null): void {
    workspacePath.value = path
  }

  function clearWorkspace(): void {
    workspace.value = null
    workspacePath.value = null
    useSettingsStore().reinitialize()
  }

  return {
    workspace,
    workspacePath,
    createWorkspace,
    setWorkspace,
    setWorkspacePath,
    clearWorkspace,
  }
})

