import type { BdgWorkspace } from '@engine/modules/bdg-workspace/bdg-workspace'
import type { BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'

export type BdgWorkspaceExportWorkspaceEntry = {
  id: string
  name: string
}

export type BdgWorkspaceExportAccountEntry = {
  id: string
  name: string
  columnMappingId: string
}

export type BdgWorkspaceExportSegmentRow = Omit<BdgAccountSegmentRow, 'dateTransaction' | 'dateInscription'>

export type BdgWorkspaceExportSegmentEntry = {
  id: string
  name: string
  dateStartAsString: string
  dateEndAsString: string
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

    const workspaceKey = `Workspace:${workspace.id}`
    result[workspaceKey] = { id: workspace.id, name: workspace.name }

    for (const account of workspace.accounts) {
      const accountKey = `${workspaceKey}:Account:${account.id}`
      result[accountKey] = {
        id: account.id,
        name: account.name,
        columnMappingId: account.columnMappingId,
      }

      for (const segment of account.segments) {
        const segmentKey = `${accountKey}:Segment:${segment.id}`
        result[segmentKey] = {
          id: segment.id,
          name: segment.name,
          dateStartAsString: segment.dateStartAsString,
          dateEndAsString: segment.dateEndAsString,
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
