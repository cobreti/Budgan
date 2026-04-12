import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWorkspaceStore } from './workspace-store'
import { BdgWorkspaceFactory, BdgWorkspaceFactoryImpl } from '@engine/modules/bdg-workspace/bdg-workspace-factory'
import { IdGeneratorImpl } from '@engine/services/IdGenerator'
import { BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import { CsvContentImporter } from '@engine/modules/csv-import/csv-content-importer'
import { BdgAccountSegmentImpl } from '@engine/modules/bdg-workspace/bdg-account-segment'

vi.mock('@inversify/setup-inversify', () => ({
  default: { get: vi.fn() },
}))

import container from '@inversify/setup-inversify'

function makeFactory(): BdgWorkspaceFactoryImpl {
  return new BdgWorkspaceFactoryImpl(new IdGeneratorImpl())
}

describe('useWorkspaceStore — segment persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  test('rebuildWorkspaceFromSnapshot reconstructs segments onto accounts', () => {
    const store = useWorkspaceStore()
    vi.mocked(container.get).mockReturnValue(makeFactory())

    store.workspaceSnapshot = {
      id: 'ws-1',
      name: 'Test Workspace',
      accounts: [
        {
          id: 'acc-1',
          name: 'Test Account',
          columnMappingId: 'mapping-1',
          segments: [
            {
              id: 'seg-1',
              name: 'March',
              rows: [
                {
                  cardNumber: '1234',
                  description: 'Coffee',
                  dateTransactionAsString: '2024-03-15',
                  amount: -4.2,
                },
              ],
            },
          ],
        },
      ],
    }

    store.rebuildWorkspaceFromSnapshot()

    const result = store.currentWorkspace?.getAccount('acc-1')
    expect(result?.success).toBe(true)
    if (result?.success) {
      const { segments } = result.value
      expect(segments).toHaveLength(1)
      expect(segments[0].id).toBe('seg-1')
      expect(segments[0].name).toBe('March')
      expect(segments[0].rows).toHaveLength(1)
      expect(segments[0].rows[0].cardNumber).toBe('1234')
    }
  })

  test('rebuildWorkspaceFromSnapshot re-derives dateStart and dateEnd from row strings', () => {
    const store = useWorkspaceStore()
    vi.mocked(container.get).mockReturnValue(makeFactory())

    store.workspaceSnapshot = {
      id: 'ws-1',
      name: 'Test Workspace',
      accounts: [
        {
          id: 'acc-1',
          name: 'Test Account',
          columnMappingId: 'mapping-1',
          segments: [
            {
              id: 'seg-1',
              name: 'March',
              rows: [
                { cardNumber: '1', description: 'A', dateTransactionAsString: '2024-03-01', amount: -1 },
                { cardNumber: '1', description: 'B', dateTransactionAsString: '2024-03-31', amount: -2 },
              ],
            },
          ],
        },
      ],
    }

    store.rebuildWorkspaceFromSnapshot()

    const result = store.currentWorkspace?.getAccount('acc-1')
    expect(result?.success).toBe(true)
    if (result?.success) {
      const seg = result.value.segments[0]
      expect(seg.dateStartAsString).toBe('2024-03-01')
      expect(seg.dateEndAsString).toBe('2024-03-31')
    }
  })

  test('rebuildWorkspaceFromSnapshot handles an account with no segments', () => {
    const store = useWorkspaceStore()
    vi.mocked(container.get).mockReturnValue(makeFactory())

    store.workspaceSnapshot = {
      id: 'ws-1',
      name: 'Test Workspace',
      accounts: [{ id: 'acc-1', name: 'Test Account', columnMappingId: 'mapping-1', segments: [] }],
    }

    store.rebuildWorkspaceFromSnapshot()

    const result = store.currentWorkspace?.getAccount('acc-1')
    expect(result?.success).toBe(true)
    if (result?.success) {
      expect(result.value.segments).toHaveLength(0)
    }
  })

  test('setCurrentWorkspace serializes existing segments into workspaceSnapshot', () => {
    const store = useWorkspaceStore()
    const factory = makeFactory()
    vi.mocked(container.get).mockReturnValue(factory)

    const workspace = factory.createWorkspace()
    workspace.name = 'My Workspace'
    const account = workspace.createAccount('My Account', 'mapping-1')
    account.addSegment(
      new BdgAccountSegmentImpl('seg-1', 'March', [
        { cardNumber: '1234', description: 'Coffee', dateTransactionAsString: '2024-03-15', amount: -4.2 },
      ]),
    )

    store.setCurrentWorkspace(workspace)

    const snapshotAccount = store.workspaceSnapshot?.accounts[0]
    expect(snapshotAccount?.segments).toHaveLength(1)
    expect(snapshotAccount?.segments[0].id).toBe('seg-1')
    expect(snapshotAccount?.segments[0].name).toBe('March')
    expect(snapshotAccount?.segments[0].rows).toHaveLength(1)
    expect(snapshotAccount?.segments[0].rows[0].cardNumber).toBe('1234')
  })

  test('importSegmentToSelectedAccount writes segment into workspaceSnapshot after import', async () => {
    const store = useWorkspaceStore()
    const factory = makeFactory()

    const workspace = factory.createWorkspace()
    workspace.name = 'My Workspace'
    const account = workspace.createAccount('My Account', 'mapping-1')

    const mockSegment = new BdgAccountSegmentImpl('seg-imported', 'march', [
      { cardNumber: '9999', description: 'Salary', dateTransactionAsString: '2024-03-01', amount: 1200 },
    ])
    const mockImporter = {
      import: vi.fn().mockResolvedValue({ success: true, value: mockSegment }),
    } as unknown as CsvContentImporter
    const mockSettings = {
      columnMappings: [{ id: 'mapping-1', columnMapping: {} }],
    } as unknown as InstanceType<typeof BdgSettings>

    vi.mocked(container.get as (id: string) => unknown).mockImplementation((bindingTypeId: string) => {
      if (bindingTypeId === BdgSettings.bindingTypeId) return mockSettings
      if (bindingTypeId === CsvContentImporter.bindingTypeId) return mockImporter
      if (bindingTypeId === BdgWorkspaceFactory.bindingTypeId) return factory
      return undefined
    })

    store.setCurrentWorkspace(workspace)
    store.setSelectedAccount(account.id)

    const file = new File([], 'march.csv', { type: 'text/csv' })
    const result = await store.importSegmentToSelectedAccount(file)

    expect(result.success).toBe(true)

    const snapshotAccount = store.workspaceSnapshot?.accounts[0]
    expect(snapshotAccount?.segments).toHaveLength(1)
    expect(snapshotAccount?.segments[0].id).toBe('seg-imported')
    expect(snapshotAccount?.segments[0].rows[0].cardNumber).toBe('9999')
  })

  test('round-trip: segments survive snapshot → rebuild → re-snapshot', () => {
    const store = useWorkspaceStore()
    vi.mocked(container.get).mockReturnValue(makeFactory())

    store.workspaceSnapshot = {
      id: 'ws-1',
      name: 'Round-trip',
      accounts: [
        {
          id: 'acc-1',
          name: 'Account A',
          columnMappingId: 'mapping-1',
          segments: [
            {
              id: 'seg-rt',
              name: 'Data',
              rows: [{ cardNumber: '0001', description: 'Test', dateTransactionAsString: '2024-06-01', amount: 99 }],
            },
          ],
        },
      ],
    }

    store.rebuildWorkspaceFromSnapshot()
    // Re-sync by setting the workspace again
    store.setCurrentWorkspace(store.currentWorkspace!)

    const snapshotAccount = store.workspaceSnapshot?.accounts[0]
    expect(snapshotAccount?.segments).toHaveLength(1)
    expect(snapshotAccount?.segments[0].id).toBe('seg-rt')
    expect(snapshotAccount?.segments[0].rows[0].amount).toBe(99)
  })
})
