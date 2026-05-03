import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content'
import type { CsvContentExtractionResult } from '@engine/modules/csv-import/csv-content-extractor'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgAccountImpl } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import { BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import { CsvContentImporter } from '@engine/modules/csv-import/csv-content-importer'
import { BdgWorkspaceImporter } from '@engine/modules/bdg-workspace/bdg-workspace-importer'
import { BdgAccountSegmentImpl, type BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { ResultWithError } from '@engine/types/result-pattern'
import container from '@inversify/setup-inversify'
import { useCsvSourcesStore } from '@engineTestApp/stores/csv-sources-store'
import { useSettingsStore } from '@engineTestApp/stores/settings-store'

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
  csvSourceFilename?: string
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
    balanceSnapshot?: { amount: number; dateAsString: string }
  }>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
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
    const selectedAccountId = ref<string | null>(null)

    const workspaceStorageSize = computed<string | null>(() => {
      if (!workspaceSnapshot.value) return null
      const bytes = new Blob([JSON.stringify(workspaceSnapshot.value)]).size
      return formatBytes(bytes)
    })

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
          ...(a.balanceSnapshot
            ? { balanceSnapshot: { amount: a.balanceSnapshot.amount, dateAsString: a.balanceSnapshot.dateAsString } }
            : {}),
          segments: a.segments.map((s) => {
            const csvSource = a.getCsvContentSegment(s.id)
            return {
              id: s.id,
              name: s.name,
              ...(csvSource ? { csvSourceFilename: csvSource.filename } : {}),
              rows: s.rows.map((r) => ({
                key: r.key,
                cardNumber: r.cardNumber,
                description: r.description,
                dateTransactionAsString: r.dateTransactionAsString,
                ...(r.dateInscriptionAsString !== undefined
                  ? { dateInscriptionAsString: r.dateInscriptionAsString }
                  : {}),
                amount: r.amount,
              })),
            }
          }),
        })),
      }
    }

    function rebuildWorkspaceFromSnapshot(): void {
      if (!workspaceSnapshot.value) {
        currentWorkspace.value = null
        return
      }
      const factory = container.get<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)
      const accounts = workspaceSnapshot.value.accounts.map((a) => {
        const account = new BdgAccountImpl(a.id, a.name, a.columnMappingId)
        const csvSourcesStore = useCsvSourcesStore()
        for (const s of a.segments) {
          const rows: BdgAccountSegmentRow[] = s.rows.map((r) => ({ ...r }))
          account.addSegment(new BdgAccountSegmentImpl(s.id, s.name, rows))
          if (s.csvSourceFilename) {
            const persisted = csvSourcesStore.getCsvSource(s.id)
            account.addCsvContentSegment({
              segmentId: s.id,
              filename: s.csvSourceFilename,
              content: persisted?.content ?? '',
            })
          }
        }
        if (a.balanceSnapshot) {
          account.setBalanceSnapshot(a.balanceSnapshot.amount, a.balanceSnapshot.dateAsString)
        }
        return account
      })
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
      selectedAccountId.value = null
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

    function removeAccountFromCurrentWorkspace(accountId: string): void {
      if (!currentWorkspace.value) {
        throw new Error('No current workspace')
      }
      currentWorkspace.value.removeAccount(accountId)
      if (selectedAccountId.value === accountId) {
        selectedAccountId.value = null
      }
      _syncWorkspaceSnapshot()
    }

    function setSelectedAccount(accountId: string): void {
      selectedAccountId.value = accountId
    }

    function clearSelectedAccount(): void {
      selectedAccountId.value = null
    }

    function setAccountBalanceSnapshot(accountId: string, amount: number, dateAsString: string): void {
      if (!currentWorkspace.value) return
      const result = currentWorkspace.value.getAccount(accountId)
      if (!result.success) return
      result.value.setBalanceSnapshot(amount, dateAsString)
      _syncWorkspaceSnapshot()
    }

    function clearAccountBalanceSnapshot(accountId: string): void {
      if (!currentWorkspace.value) return
      const result = currentWorkspace.value.getAccount(accountId)
      if (!result.success) return
      result.value.clearBalanceSnapshot()
      _syncWorkspaceSnapshot()
    }

    async function importSegmentToSelectedAccount(
      file: File,
    ): Promise<ResultWithError<BdgAccountSegment, string>> {
      if (!currentWorkspace.value || !selectedAccountId.value) {
        return { success: false, error: 'No account selected' }
      }

      const accountResult = currentWorkspace.value.getAccount(selectedAccountId.value)
      if (!accountResult?.success) {
        return { success: false, error: 'Account not found' }
      }

      const account = accountResult.value
      const bdgSettings = container.get<BdgSettings>(BdgSettings.bindingTypeId)
      const bdgMapping = bdgSettings.columnMappings.find((m) => m.id === account.columnMappingId)

      if (!bdgMapping) {
        return { success: false, error: 'Column mapping not found for this account' }
      }

      const importer = container.get<CsvContentImporter>(CsvContentImporter.bindingTypeId)
      const result = await importer.import(file, bdgMapping.columnMapping)

      if (result.success) {
        const { segment, csvSource } = result.value
        account.addSegment(segment)
        account.addCsvContentSegment({
          segmentId: segment.id,
          filename: csvSource.filename,
          content: csvSource.content,
        })
        useCsvSourcesStore().setCsvSource(segment.id, { filename: csvSource.filename, content: csvSource.content })
        _syncWorkspaceSnapshot()
      }

      return result.success
        ? { success: true, value: result.value.segment }
        : result
    }

    async function importWorkspaceFromZip(
      handle: FileSystemFileHandle,
    ): Promise<ResultWithError<void, string>> {
      const importer = container.get<BdgWorkspaceImporter>(BdgWorkspaceImporter.bindingTypeId)
      const result = await importer.import(handle)
      if (!result.success) return result

      const { workspace, columnMappings, csvSources } = result.value

      const settingsStore = useSettingsStore()
      const existingIds = new Set(settingsStore.columnMappings.map((m) => m.id))
      for (const mapping of columnMappings) {
        if (existingIds.has(mapping.id)) {
          settingsStore.updateMapping(mapping)
        } else {
          settingsStore.insertMapping(mapping)
        }
      }

      const csvSourcesStore = useCsvSourcesStore()
      csvSourcesStore.clear()
      for (const source of csvSources) {
        csvSourcesStore.setCsvSource(source.segmentId, {
          filename: source.filename,
          content: source.content,
        })
      }

      setCurrentWorkspace(workspace)
      return { success: true, value: undefined }
    }

    return {
      parsedJson,
      appliedMapping,
      selectedFileName,
      selectedFileSize,
      isJsonVisible,
      currentWorkspace,
      workspaceSnapshot,
      selectedAccountId,
      workspaceStorageSize,
      setParsedJson,
      setAppliedMapping,
      setSelectedFile,
      toggleJsonVisibility,
      setCurrentWorkspace,
      rebuildWorkspaceFromSnapshot,
      createAccountInCurrentWorkspace,
      removeAccountFromCurrentWorkspace,
      setSelectedAccount,
      clearSelectedAccount,
      setAccountBalanceSnapshot,
      clearAccountBalanceSnapshot,
      importSegmentToSelectedAccount,
      importWorkspaceFromZip,
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
