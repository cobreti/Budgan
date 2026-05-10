import 'reflect-metadata'
import { injectable, inject } from 'inversify'
import { unzip } from 'fflate'
import { InversifyUtils } from '@inversify/inversify-utils.ts'
import { ZipEntry, CSV_SOURCES_PREFIX } from '@engine/services/FileSaveService'
import { FileReadService } from '@engine/services/FileReadService'
import { BdgWorkspaceFactory } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import { BdgAccountImpl } from '@engine/modules/bdg-workspace/bdg-account'
import { BdgAccountSegmentImpl } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type {
  BdgWorkspaceExport,
  BdgWorkspaceExportAccountEntry,
  BdgWorkspaceExportSegmentEntry,
  BdgWorkspaceExportWorkspaceEntry,
} from '@engine/modules/bdg-workspace/bdg-workspace-exporter'
import type { BdgSettingsExport } from '@engine/modules/bdg-settings/bdg-settings-exporter'
import type { ResultWithError } from '@engine/types/result-pattern'

export type BdgWorkspaceImportResult = {
  workspace: BdgWorkspace
  csvSources: Array<{ segmentId: string; filename: string; content: string }>
}

export abstract class BdgWorkspaceImporter {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('BdgWorkspaceImporter')

  abstract import(
    handle: FileSystemFileHandle,
  ): Promise<ResultWithError<BdgWorkspaceImportResult, string>>
}

@injectable()
export class BdgWorkspaceImporterImpl extends BdgWorkspaceImporter {
  constructor(
    @inject(FileReadService.bindingTypeId) private readonly fileReadService: FileReadService,
    @inject(BdgWorkspaceFactory.bindingTypeId)
    private readonly workspaceFactory: BdgWorkspaceFactory,
  ) {
    super()
  }

  import(handle: FileSystemFileHandle): Promise<ResultWithError<BdgWorkspaceImportResult, string>> {
    return new Promise(async (resolve) => {
      let bytes: Uint8Array
      try {
        bytes = await this.fileReadService.readAsBytes(handle)
      } catch {
        resolve({ success: false, error: 'Failed to read the zip file' })
        return
      }

      unzip(bytes, (err, entries) => {
        if (err) {
          resolve({ success: false, error: 'Failed to decompress the zip file' })
          return
        }

        try {
          resolve(this._reconstruct(entries))
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Failed to reconstruct workspace'
          resolve({ success: false, error: message })
        }
      })
    })
  }

  private _reconstruct(
    entries: Record<string, Uint8Array>,
  ): ResultWithError<BdgWorkspaceImportResult, string> {
    const decoder = new TextDecoder()

    const workspaceRaw = entries[ZipEntry.Workspace]
    if (!workspaceRaw) {
      return { success: false, error: 'Workspace.json not found in zip' }
    }

    const workspaceExport: BdgWorkspaceExport = JSON.parse(decoder.decode(workspaceRaw))

    const settingsRaw = entries[ZipEntry.Settings]
    const settingsExport: BdgSettingsExport = settingsRaw
      ? JSON.parse(decoder.decode(settingsRaw))
      : {}

    const workspaceEntry = Object.values(workspaceExport).find(
      (e): e is BdgWorkspaceExportWorkspaceEntry => e.type === 'Workspace',
    )
    if (!workspaceEntry) {
      return { success: false, error: 'No Workspace entry found in Workspace.json' }
    }

    const accountEntries = Object.values(workspaceExport).filter(
      (e): e is BdgWorkspaceExportAccountEntry =>
        e.type === 'Account' && e.parentId === workspaceEntry.id,
    )

    const segmentsByAccountId = Object.values(workspaceExport)
      .filter((e): e is BdgWorkspaceExportSegmentEntry => e.type === 'Segment')
      .reduce<Record<string, BdgWorkspaceExportSegmentEntry[]>>((acc, seg) => {
        ;(acc[seg.parentId] ??= []).push(seg)
        return acc
      }, {})

    const csvSourcesMap: Record<string, { filename: string; content: string }> = {}
    for (const [path, data] of Object.entries(entries)) {
      if (path.startsWith(CSV_SOURCES_PREFIX)) {
        const segmentId = path.slice(CSV_SOURCES_PREFIX.length)
        csvSourcesMap[segmentId] = { filename: segmentId, content: decoder.decode(data) }
      }
    }

    const accounts = accountEntries.map((accountEntry) => {
      const account = new BdgAccountImpl(
        accountEntry.id,
        accountEntry.name,
        accountEntry.columnMappingId,
      )

      const segmentEntries = segmentsByAccountId[accountEntry.id] ?? []
      for (const segEntry of segmentEntries) {
        if (segEntry.rows.length === 0) continue

        const rows: BdgAccountSegmentRow[] = segEntry.rows.map((r) => ({ ...r }))
        account.addSegment(new BdgAccountSegmentImpl(segEntry.id, segEntry.name, rows))

        const csvSource = csvSourcesMap[segEntry.id]
        account.addCsvContentSegment({
          segmentId: segEntry.id,
          filename: segEntry.csvSourceFilename ?? csvSource?.filename ?? segEntry.id,
          content: csvSource?.content ?? '',
        })
      }

      if (accountEntry.balanceSnapshot) {
        account.setBalanceSnapshot(
          accountEntry.balanceSnapshot.amount,
          accountEntry.balanceSnapshot.dateAsString,
        )
      }

      return account
    })

    const columnMappings = Object.values(settingsExport).map((entry) => ({
      id: entry.id,
      name: entry.name,
      columnMapping: entry.columnMapping,
    }))

    const workspace = this.workspaceFactory.reconstructWorkspace(
      workspaceEntry.id,
      workspaceEntry.name,
      accounts,
      columnMappings,
    )

    const csvSources = Object.entries(csvSourcesMap).map(([segmentId, source]) => ({
      segmentId,
      filename: source.filename,
      content: source.content,
    }))

    return { success: true, value: { workspace, csvSources } }
  }
}
