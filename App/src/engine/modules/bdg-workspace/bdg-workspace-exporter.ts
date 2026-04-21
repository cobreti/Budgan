import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
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

export class BdgWorkspaceExporter {
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
          rows: segment.rows.map(({ key, cardNumber, description, dateTransactionAsString, dateInscriptionAsString, amount }) => ({
            key,
            cardNumber,
            description,
            dateTransactionAsString,
            ...(dateInscriptionAsString !== undefined ? { dateInscriptionAsString } : {}),
            amount,
          })),
        }
      }
    }

    return result
  }
}
