import { describe, expect, test } from 'vitest'
import { BdgWorkspaceExporterImpl } from './bdg-workspace-exporter'
import { BdgWorkspaceImpl } from './bdg-workspace'
import { BdgAccountImpl } from './bdg-account'
import { BdgAccountSegmentImpl } from './bdg-account-segment'
import type { IdGenerator } from '@engine/services/IdGenerator'

const mockIdGenerator: IdGenerator = {
  generateId: () => 'generated-id',
}

const row = {
  key: '1234|2024-01-01|100|Deposit',
  cardNumber: '1234',
  description: 'Deposit',
  dateTransactionAsString: '2024-01-01',
  amount: 100,
}

function buildWorkspace() {
  const workspace = new BdgWorkspaceImpl(mockIdGenerator, 'workspace-id-1')
  workspace.name = 'My Workspace'

  const account = new BdgAccountImpl('account-id-1', 'Chequing', 'mapping-id-1')
  const segment = new BdgAccountSegmentImpl('segment-id-1', 'January', [{ ...row }])
  account.addSegment(segment)
  workspace.loadAccount(account)

  return workspace
}

describe('BdgWorkspaceExporter', () => {
  const exporter = new BdgWorkspaceExporterImpl({ saveWorkspace: async () => {} } as never)

  test('workspace entry has type "Workspace" and no parentId', () => {
    const workspace = buildWorkspace()
    const result = exporter.export(workspace)
    const entry = result['workspace-id-1']

    expect(entry.type).toBe('Workspace')
    expect('parentId' in entry).toBe(false)
  })

  test('account entry has type "Account" and parentId equal to workspace id', () => {
    const workspace = buildWorkspace()
    const result = exporter.export(workspace)
    const entry = result['account-id-1']

    expect(entry.type).toBe('Account')
    expect(entry.parentId).toBe('workspace-id-1')
  })

  test('segment entry has type "Segment" and parentId equal to account id', () => {
    const workspace = buildWorkspace()
    const result = exporter.export(workspace)
    const entry = result['segment-id-1']

    expect(entry.type).toBe('Segment')
    expect(entry.parentId).toBe('account-id-1')
  })
})

