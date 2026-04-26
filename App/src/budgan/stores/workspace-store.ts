import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { PiniaPluginContext } from 'pinia'
import 'pinia-plugin-persistedstate'
import container from '@inversify/setup-inversify'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import { BdgAccountImpl } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgAccountSegmentImpl } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'
import { CsvContentImporter } from '@engine/modules/csv-import/csv-content-importer'
import type { ResultWithError } from '@engine/types/result-pattern'
import { useSettingsStore } from './settings-store'

type SegmentRowSnapshot = {
  key: string
  cardNumber: string
  description: string
  dateTransactionAsString: string
  dateInscriptionAsString?: string
  amount: number
}

type SegmentSnapshot = {
  id: string
  name: string
  rows: SegmentRowSnapshot[]
}

type WorkspaceSnapshot = {
  id: string
  name: string
  accounts: Array<{
    id: string
    name: string
    columnMappingId: string
    segments: SegmentSnapshot[]
  }>
}

export type WorkspaceStore = {
  workspace: Ref<BdgWorkspace | null>
  workspacePath: Ref<string | null>
  workspaceSnapshot: Ref<WorkspaceSnapshot | null>
  createWorkspace(name: string): BdgWorkspace
  createAccount(name: string, columnMappingId: string): void
  removeSegment(accountId: string, segmentId: string): void
  importSegment(accountId: string, file: File): Promise<ResultWithError<BdgAccountSegment, string>>
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
        segments: a.segments.map((s) => ({
          id: s.id,
          name: s.name,
          rows: s.rows.map((r) => ({
            key: r.key,
            cardNumber: r.cardNumber,
            description: r.description,
            dateTransactionAsString: r.dateTransactionAsString,
            dateInscriptionAsString: r.dateInscriptionAsString,
            amount: r.amount,
          })),
        })),
      })),
    }
  }

  function rebuildWorkspaceFromSnapshot(): void {
    if (!workspaceSnapshot.value) {
      workspace.value = null
      return
    }
    const accounts = workspaceSnapshot.value.accounts.map((a) => {
      const account = new BdgAccountImpl(a.id, a.name, a.columnMappingId)
      for (const s of a.segments ?? []) {
        account.addSegment(new BdgAccountSegmentImpl(s.id, s.name, s.rows))
      }
      return account
    })
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

  function removeSegment(accountId: string, segmentId: string): void {
    if (!workspace.value) return
    const account = workspace.value.accounts.find((a) => a.id === accountId)
    if (!account) return
    account.removeSegment(segmentId)
    _syncWorkspaceSnapshot()
  }

  async function importSegment(
    accountId: string,
    file: File,
  ): Promise<ResultWithError<BdgAccountSegment, string>> {
    if (!workspace.value) return { success: false, error: 'No workspace' }

    const account = workspace.value.accounts.find((a) => a.id === accountId)
    if (!account) return { success: false, error: 'Account not found' }

    const bdgMapping = useSettingsStore().columnMappings.find(
      (m) => m.id === account.columnMappingId,
    )
    if (!bdgMapping) return { success: false, error: 'No column mapping found for this account' }

    const importer = container.get<CsvContentImporter>(CsvContentImporter.bindingTypeId)
    const result = await importer.import(file, bdgMapping.columnMapping)

    if (result.success) {
      account.addSegment(result.value.segment)
      _syncWorkspaceSnapshot()
    }

    return result.success
      ? { success: true, value: result.value.segment }
      : result
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
    removeSegment,
    importSegment,
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
