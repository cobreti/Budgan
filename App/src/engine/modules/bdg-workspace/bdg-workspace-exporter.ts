import 'reflect-metadata'
import { injectable, inject } from 'inversify'
import { zipSync } from 'fflate'
import { InversifyUtils } from '@inversify/inversify-utils.ts'
import { FileSaveService, ZipEntry, CSV_SOURCES_PREFIX } from '@engine/services/FileSaveService'
import { BdgSettingsExporter } from '@engine/modules/bdg-settings/bdg-settings-exporter'
import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type { BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import type { BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'

export type BdgWorkspaceExportWorkspaceEntry = {
  type: 'Workspace'
  id: string
  name: string
}

export type BdgWorkspaceExportAccountEntry = {
  type: 'Account'
  parentId: string
  id: string
  name: string
  columnMappingId: string
  balanceSnapshot?: { amount: number; dateAsString: string }
}

export type BdgWorkspaceExportSegmentRow = Omit<BdgAccountSegmentRow, 'dateTransaction' | 'dateInscription'>

export type BdgWorkspaceExportSegmentEntry = {
  type: 'Segment'
  parentId: string
  id: string
  name: string
  dateStartAsString: string
  dateEndAsString: string
  csvSourceFilename?: string
  rows: BdgWorkspaceExportSegmentRow[]
}

export type BdgWorkspaceExportEntry =
  | BdgWorkspaceExportWorkspaceEntry
  | BdgWorkspaceExportAccountEntry
  | BdgWorkspaceExportSegmentEntry

export type BdgWorkspaceExport = Record<string, BdgWorkspaceExportEntry>

export abstract class BdgWorkspaceExporter {
  static readonly bindingTypeId = InversifyUtils.createBindingId('BdgWorkspaceExporter')

  abstract export(workspace: BdgWorkspace): BdgWorkspaceExport

  abstract saveToHandle(
    handle: FileSystemFileHandle,
    workspace: BdgWorkspace,
    settings: BdgSettings,
  ): Promise<void>

  abstract buildZipBytes(workspace: BdgWorkspace, settings: BdgSettings): Uint8Array
}

@injectable()
export class BdgWorkspaceExporterImpl extends BdgWorkspaceExporter {
  constructor(
    @inject(FileSaveService.bindingTypeId) private readonly fileSaveService: FileSaveService,
  ) {
    super()
  }

  export(workspace: BdgWorkspace): BdgWorkspaceExport {
    const result: BdgWorkspaceExport = {}

    result[workspace.id] = { type: 'Workspace', id: workspace.id, name: workspace.name }

    for (const account of workspace.accounts) {
      result[account.id] = {
        type: 'Account',
        parentId: workspace.id,
        id: account.id,
        name: account.name,
        columnMappingId: account.columnMappingId,
        ...(account.balanceSnapshot
          ? { balanceSnapshot: { amount: account.balanceSnapshot.amount, dateAsString: account.balanceSnapshot.dateAsString } }
          : {}),
      }

      for (const segment of account.segments) {
        const csvSource = account.getCsvContentSegment(segment.id)
        result[segment.id] = {
          type: 'Segment',
          parentId: account.id,
          id: segment.id,
          name: segment.name,
          dateStartAsString: segment.dateStartAsString,
          dateEndAsString: segment.dateEndAsString,
          ...(csvSource ? { csvSourceFilename: csvSource.filename } : {}),
          rows: segment.rows.map(({ key, cardNumber, description, dateInscriptionAsString, dateTransactionAsString, amount }) => ({
            key,
            cardNumber,
            description,
            dateInscriptionAsString,
            ...(dateTransactionAsString !== undefined ? { dateTransactionAsString } : {}),
            amount,
          })),
        }
      }
    }

    return result
  }

  async saveToHandle(
    handle: FileSystemFileHandle,
    workspace: BdgWorkspace,
    settings: BdgSettings,
  ): Promise<void> {
    const workspaceExport = this.export(workspace)
    const settingsExport = new BdgSettingsExporter().export(settings)
    const csvSources = this._collectCsvSources(workspace)
    await this.fileSaveService.saveWorkspace(handle, workspaceExport, settingsExport, csvSources)
  }

  buildZipBytes(workspace: BdgWorkspace, settings: BdgSettings): Uint8Array {
    const workspaceExport = this.export(workspace)
    const settingsExport = new BdgSettingsExporter().export(settings)
    const csvSources = this._collectCsvSources(workspace)
    const encoder = new TextEncoder()
    const entries: Record<string, Uint8Array> = {
      [ZipEntry.Workspace]: encoder.encode(JSON.stringify(workspaceExport, null, 2)),
      [ZipEntry.Settings]: encoder.encode(JSON.stringify(settingsExport, null, 2)),
    }
    for (const [segmentId, source] of Object.entries(csvSources)) {
      entries[`${CSV_SOURCES_PREFIX}${segmentId}`] = encoder.encode(source.content)
    }
    return zipSync(entries)
  }

  private _collectCsvSources(
    workspace: BdgWorkspace,
  ): Record<string, { filename: string; content: string }> {
    const result: Record<string, { filename: string; content: string }> = {}
    for (const account of workspace.accounts) {
      for (const src of account.csvContentSegments) {
        if (src.content) {
          result[src.segmentId] = { filename: src.filename, content: src.content }
        }
      }
    }
    return result
  }
}
