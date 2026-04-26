import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { PiniaPluginContext } from 'pinia'
import 'pinia-plugin-persistedstate'
import container from '@inversify/setup-inversify'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import { BdgAccountImpl } from '@engine/modules/bdg-workspace/bdg-account'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import { useSettingsStore } from './settings-store'

type WorkspaceSnapshot = {
  id: string
  name: string
  accounts: Array<{
    id: string
    name: string
    columnMappingId: string
  }>
}

export type WorkspaceStore = {
  workspace: Ref<BdgWorkspace | null>
  workspacePath: Ref<string | null>
  workspaceSnapshot: Ref<WorkspaceSnapshot | null>
  createWorkspace(name: string): BdgWorkspace
  createAccount(name: string, columnMappingId: string): void
  setWorkspace(workspace: BdgWorkspace): void
  setWorkspacePath(path: string | null): void
  clearWorkspace(): void
  rebuildWorkspaceFromSnapshot(): void
}

export const useWorkspaceStore = defineStore('budgan-workspace', () => {
  const workspace = ref<BdgWorkspace | null>(null)
  const workspacePath = ref<string | null>(null)
  const workspaceSnapshot = ref<WorkspaceSnapshot | null>(null)

  const factory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)

  function _syncWorkspaceSnapshot(): void {
    if (!workspace.value) {
      workspaceSnapshot.value = null
      return
    }
    workspaceSnapshot.value = {
      id: workspace.value.id,
      name: workspace.value.name,
      accounts: workspace.value.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        columnMappingId: a.columnMappingId,
      })),
    }
  }

  function rebuildWorkspaceFromSnapshot(): void {
    if (!workspaceSnapshot.value) {
      workspace.value = null
      return
    }
    const accounts = workspaceSnapshot.value.accounts.map(
      (a) => new BdgAccountImpl(a.id, a.name, a.columnMappingId),
    )
    workspace.value = factory.reconstructWorkspace(
      workspaceSnapshot.value.id,
      workspaceSnapshot.value.name,
      accounts,
    )
  }

  function createWorkspace(name: string): BdgWorkspace {
    const newWorkspace = factory.createWorkspace()
    newWorkspace.name = name
    workspace.value = newWorkspace
    workspacePath.value = null
    useSettingsStore().reinitialize()
    _syncWorkspaceSnapshot()
    return newWorkspace
  }

  function createAccount(name: string, columnMappingId: string): void {
    if (!workspace.value) return
    workspace.value.createAccount(name, columnMappingId)
    _syncWorkspaceSnapshot()
  }

  function setWorkspace(value: BdgWorkspace): void {
    workspace.value = value
    _syncWorkspaceSnapshot()
  }

  function setWorkspacePath(path: string | null): void {
    workspacePath.value = path
  }

  function clearWorkspace(): void {
    workspace.value = null
    workspacePath.value = null
    workspaceSnapshot.value = null
    useSettingsStore().reinitialize()
  }

  return {
    workspace,
    workspacePath,
    workspaceSnapshot,
    createWorkspace,
    createAccount,
    setWorkspace,
    setWorkspacePath,
    clearWorkspace,
    rebuildWorkspaceFromSnapshot,
  }
}, {
  persist: {
    key: 'budgan-workspace',
    storage: localStorage,
    omit: ['workspace'],
    afterHydrate: (ctx: PiniaPluginContext) => {
      ;(ctx.store as unknown as { rebuildWorkspaceFromSnapshot(): void }).rebuildWorkspaceFromSnapshot()
    },
  },
})

